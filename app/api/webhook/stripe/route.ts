import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendEmailWebhook, sendContractWebhook } from '@/lib/make-webhook';

// Configuration pour Vercel: durée maximale d'exécution (30 secondes)
export const maxDuration = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur de vérification du webhook:', err.message);
    return NextResponse.json(
      { error: `Erreur de vérification: ${err.message}` },
      { status: 400 }
    );
  }

  // Gérer les événements Stripe
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const reservationId = paymentIntent.metadata.reservationId;
    const customerEmail = paymentIntent.metadata.customerEmail;
    const customerName = paymentIntent.metadata.customerName;

    try {
      // TODO: Récupérer les données de réservation complètes depuis la base de données
      // Pour l'instant, on utilise les métadonnées disponibles
      const reservationData = {
        email: customerEmail,
        firstName: customerName.split(' ')[0] || '',
        lastName: customerName.split(' ').slice(1).join(' ') || '',
      };

      // Envoyer l'email de confirmation via Make.com
      await sendEmailWebhook({
        reservationId: reservationId || 'unknown',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
        reservationData: reservationData as any,
      });

      // Envoyer le contrat via Make.com
      await sendContractWebhook({
        reservationId: reservationId || 'unknown',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
        reservationData: reservationData as any,
      });

      console.log(`Webhook traité avec succès pour la réservation ${reservationId}`);
    } catch (error: any) {
      console.error('Erreur lors du traitement du webhook:', error);
      // Ne pas renvoyer d'erreur pour éviter que Stripe ne réessaie
      // Loguer l'erreur pour traitement manuel
    }
  }

  return NextResponse.json({ received: true });
}
