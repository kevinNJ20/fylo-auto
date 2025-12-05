import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { storeReservation } from '@/lib/reservation-storage';
import { sendEmailWebhook, sendContractWebhook } from '@/lib/make-webhook';
import { generateContractHTML } from '@/lib/contract-html';

// Configuration pour Vercel: durée maximale d'exécution (30 secondes)
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const reservationId = uuidv4();
  
  console.log('=== NOUVELLE RÉSERVATION ===');
  console.log('Reservation ID:', reservationId);
  console.log('Timestamp:', new Date().toISOString());

  try {
    const formData = await request.formData();
    
    // Extraire toutes les données du formulaire
    const reservationData: any = {};
    const formDataEntries = Array.from(formData.entries());
    
    console.log('=== DONNÉES REÇUES ===');
    console.log('Nombre de champs:', formDataEntries.length);
    
    // Traiter chaque champ
    for (const [key, value] of formDataEntries) {
      if (key === 'licenseFileRecto' || key === 'licenseFileVerso') {
        // Les fichiers seront traités séparément
        continue;
      }
      
      // Convertir les valeurs selon leur type
      if (value instanceof File) {
        console.log(`Champ ${key}: Fichier (${value.name}, ${value.size} bytes)`);
      } else {
        const stringValue = value.toString();
        console.log(`Champ ${key}: ${stringValue}`);
        
        // Parser les valeurs booléennes et numériques
        if (stringValue === 'true' || stringValue === 'false') {
          reservationData[key] = stringValue === 'true';
        } else if (!isNaN(Number(stringValue)) && stringValue !== '') {
          reservationData[key] = Number(stringValue);
        } else {
          reservationData[key] = stringValue;
        }
      }
    }

    // Traiter les fichiers du permis
    const licenseFileRecto = formData.get('licenseFileRecto') as File | null;
    const licenseFileVerso = formData.get('licenseFileVerso') as File | null;

    console.log('=== FICHIERS REÇUS ===');
    if (licenseFileRecto) {
      console.log('Recto:', {
        name: licenseFileRecto.name,
        size: licenseFileRecto.size,
        type: licenseFileRecto.type,
      });
    } else {
      console.log('Recto: AUCUN FICHIER');
    }
    
    if (licenseFileVerso) {
      console.log('Verso:', {
        name: licenseFileVerso.name,
        size: licenseFileVerso.size,
        type: licenseFileVerso.type,
      });
    } else {
      console.log('Verso: AUCUN FICHIER');
    }

    // Convertir les fichiers en base64 pour stockage
    let licenseFileRectoData: { name: string; base64: string; mimeType: string } | undefined;
    let licenseFileVersoData: { name: string; base64: string; mimeType: string } | undefined;

    if (licenseFileRecto) {
      const arrayBuffer = await licenseFileRecto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      licenseFileRectoData = {
        name: licenseFileRecto.name,
        base64,
        mimeType: licenseFileRecto.type || 'image/jpeg',
      };
      console.log('Recto converti en base64:', base64.length, 'caractères');
    }
    
    if (licenseFileVerso) {
      const arrayBuffer = await licenseFileVerso.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      licenseFileVersoData = {
        name: licenseFileVerso.name,
        base64,
        mimeType: licenseFileVerso.type || 'image/jpeg',
      };
      console.log('Verso converti en base64:', base64.length, 'caractères');
    }

    // Stocker la réservation
    console.log('=== STOCKAGE DE LA RÉSERVATION ===');
    storeReservation(
      reservationId,
      reservationData,
      licenseFileRectoData,
      licenseFileVersoData
    );
    console.log('Réservation stockée avec succès');

    // Log complet des données stockées
    console.log('=== DONNÉES COMPLÈTES DE LA RÉSERVATION ===');
    console.log(JSON.stringify({
      reservationId,
      reservationData,
      hasRecto: !!licenseFileRectoData,
      hasVerso: !!licenseFileVersoData,
      rectoName: licenseFileRectoData?.name,
      versoName: licenseFileVersoData?.name,
    }, null, 2));

    // Générer le contrat HTML
    console.log('=== GÉNÉRATION DU CONTRAT ===');
    const contractHTML = generateContractHTML(reservationData, reservationId);
    console.log('Contrat HTML généré:', contractHTML.length, 'caractères');

    // Envoyer les webhooks Make.com
    console.log('=== ENVOI DES WEBHOOKS ===');
    
    try {
      await sendEmailWebhook({
        reservationId,
        customerEmail: reservationData.email || '',
        customerName: `${reservationData.firstName || ''} ${reservationData.lastName || ''}`.trim(),
        reservationData,
      });
      console.log('✓ Webhook email envoyé avec succès');
    } catch (error: any) {
      console.error('✗ Erreur webhook email:', error.message);
      // Ne pas bloquer si le webhook email échoue
    }

    try {
      await sendContractWebhook({
        reservationId,
        customerEmail: reservationData.email || '',
        customerName: `${reservationData.firstName || ''} ${reservationData.lastName || ''}`.trim(),
        reservationData,
        contractHTML,
      });
      console.log('✓ Webhook contrat envoyé avec succès');
    } catch (error: any) {
      console.error('✗ Erreur webhook contrat:', error.message);
      // Ne pas bloquer si le webhook contrat échoue
    }

    const duration = Date.now() - startTime;
    console.log('=== RÉSERVATION TRAITÉE AVEC SUCCÈS ===');
    console.log('Durée totale:', duration, 'ms');
    console.log('Reservation ID:', reservationId);

    return NextResponse.json({
      success: true,
      reservationId,
      message: 'Réservation enregistrée avec succès. Vous recevrez un email de confirmation.',
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('=== ERREUR LORS DU TRAITEMENT ===');
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
    console.error('Durée avant erreur:', duration, 'ms');
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'enregistrement de la réservation',
      },
      { status: 500 }
    );
  }
}

