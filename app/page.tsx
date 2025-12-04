'use client';

import { useState } from 'react';
import ReservationForm from '@/components/ReservationForm';
import { ReservationFormData } from '@/types/reservation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function Home() {
  const [reservationData, setReservationData] = useState<ReservationFormData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const handleFormSubmit = async (data: ReservationFormData, licenseFileRecto: File | null, licenseFileVerso: File | null) => {
    try {
      // Créer une FormData pour envoyer les fichiers
      const formData = new FormData();
      
      // Convertir les données en JSON et les ajouter
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'licenseFileRecto' && key !== 'licenseFileVerso' && value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });

      // Ajouter les fichiers si présents
      if (licenseFileRecto) {
        formData.append('licenseFileRecto', licenseFileRecto);
      }
      if (licenseFileVerso) {
        formData.append('licenseFileVerso', licenseFileVerso);
      }

      // Créer le PaymentIntent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const result = await response.json();
      setReservationData(data);
      setClientSecret(result.clientSecret);
      setReservationId(result.reservationId);
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  if (clientSecret && reservationData && reservationId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Finaliser votre réservation
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nom:</strong> {reservationData.firstName} {reservationData.lastName}</p>
              <p><strong>Email:</strong> {reservationData.email}</p>
              <p><strong>Période:</strong> du {new Date(reservationData.startDate).toLocaleDateString('fr-FR')} au {new Date(reservationData.endDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Montant:</strong> {(reservationData.amount / 100).toFixed(2)} €</p>
            </div>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              reservationData={reservationData}
              reservationId={reservationId}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Fylo-Auto
          </h1>
          <p className="text-lg text-gray-600">
            Réservez votre véhicule en ligne en quelques clics
          </p>
        </div>
        <ReservationForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}

