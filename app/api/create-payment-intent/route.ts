import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { storeReservation } from '@/lib/reservation-storage';

// Configuration pour Vercel: durée maximale d'exécution (30 secondes)
export const maxDuration = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extraire les données du formulaire
    const reservationData: any = {};
    
    // Convertir FormData en objet
    for (const [key, value] of Array.from(formData.entries())) {
      if (key !== 'licenseFileRecto' && key !== 'licenseFileVerso') {
        const stringValue = value.toString();
        // Essayer de parser comme JSON si possible
        try {
          reservationData[key] = JSON.parse(stringValue);
        } catch {
          reservationData[key] = stringValue;
        }
      }
    }

    // Gérer les fichiers du permis (recto et verso)
    const licenseFileRecto = formData.get('licenseFileRecto') as File | null;
    const licenseFileVerso = formData.get('licenseFileVerso') as File | null;
    
    // Générer un ID de réservation
    const reservationId = uuidv4();

    // Calculer le montant (assurer que c'est en centimes)
    const amount = reservationData.amount || 11000; // 110€ par défaut (montant fixe)
    const amountInCents = typeof amount === 'number' ? amount : parseInt(amount);

    // Stocker les noms des fichiers dans les métadonnées Stripe pour référence future
    const metadata: Record<string, string> = {
      reservationId,
      customerEmail: reservationData.email,
      customerName: `${reservationData.firstName} ${reservationData.lastName}`,
    };
    
    // Convertir les fichiers en base64 pour stockage temporaire
    let licenseFileRectoData: { name: string; base64: string; mimeType: string } | undefined;
    let licenseFileVersoData: { name: string; base64: string; mimeType: string } | undefined;

    if (licenseFileRecto) {
      console.log('Fichier permis recto reçu:', licenseFileRecto.name);
      metadata.licenseFileRectoName = licenseFileRecto.name;
      const arrayBuffer = await licenseFileRecto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      licenseFileRectoData = {
        name: licenseFileRecto.name,
        base64,
        mimeType: licenseFileRecto.type || 'image/jpeg',
      };
    }
    
    if (licenseFileVerso) {
      console.log('Fichier permis verso reçu:', licenseFileVerso.name);
      metadata.licenseFileVersoName = licenseFileVerso.name;
      const arrayBuffer = await licenseFileVerso.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      licenseFileVersoData = {
        name: licenseFileVerso.name,
        base64,
        mimeType: licenseFileVerso.type || 'image/jpeg',
      };
    }
    
    // Stocker temporairement la réservation avec les fichiers
    // TODO: En production, utiliser une base de données ou un service de stockage (S3, Cloudinary)
    storeReservation(
      reservationId,
      reservationData,
      licenseFileRectoData,
      licenseFileVersoData
    );

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: reservationData.currency || 'eur',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      reservationId,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}

