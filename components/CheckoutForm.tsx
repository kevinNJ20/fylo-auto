'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ReservationFormData } from '@/types/reservation';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  reservationData: ReservationFormData;
  reservationId: string;
}

export default function CheckoutForm({ reservationData, reservationId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue');
        setIsProcessing(false);
        return;
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/reservation/confirmation?reservation_id=${reservationId}`,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || 'Le paiement a échoué');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Rediriger vers la page de confirmation
        router.push(`/reservation/confirmation?reservation_id=${reservationId}`);
      }
    } catch (err) {
      console.error('Erreur lors du paiement:', err);
      setError('Une erreur inattendue est survenue');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Informations de paiement</h2>
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Traitement...' : `Payer ${(reservationData.amount / 100).toFixed(2)} €`}
      </button>
    </form>
  );
}

