import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extraire les données du formulaire
    const reservationData: any = {};
    const entries = formData.entries();
    
    for (const [key, value] of entries) {
      if (key !== 'licenseFile') {
        const stringValue = value.toString();
        // Essayer de parser comme JSON si possible
        try {
          reservationData[key] = JSON.parse(stringValue);
        } catch {
          reservationData[key] = stringValue;
        }
      }
    }

    // Gérer le fichier du permis
    const licenseFile = formData.get('licenseFile') as File | null;
    
    // Générer un ID de réservation
    const reservationId = uuidv4();

    // Calculer le montant (assurer que c'est en centimes)
    const amount = reservationData.amount || 10000; // 100€ par défaut
    const amountInCents = typeof amount === 'number' ? amount : parseInt(amount);

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: reservationData.currency || 'eur',
      metadata: {
        reservationId,
        customerEmail: reservationData.email,
        customerName: `${reservationData.firstName} ${reservationData.lastName}`,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Stocker temporairement les données de réservation (en production, utilisez une base de données)
    // Pour l'instant, on stockera dans un fichier ou une base de données simple
    // TODO: Implémenter un stockage persistant

    // Sauvegarder le fichier si présent
    if (licenseFile) {
      // TODO: Uploader le fichier vers un service de stockage (S3, Cloudinary, etc.)
      // Pour l'instant, on stocke juste la référence
      console.log('Fichier permis reçu:', licenseFile.name);
    }

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

