'use client';

import { useState } from 'react';
import ReservationForm from '@/components/ReservationForm';
import { ReservationFormData } from '@/types/reservation';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (data: ReservationFormData, licenseFileRecto: File | null, licenseFileVerso: File | null) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

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
        console.log('Fichier recto ajouté:', licenseFileRecto.name, licenseFileRecto.size, 'bytes');
      } else {
        console.warn('⚠️ Aucun fichier recto fourni');
      }
      
      if (licenseFileVerso) {
        formData.append('licenseFileVerso', licenseFileVerso);
        console.log('Fichier verso ajouté:', licenseFileVerso.name, licenseFileVerso.size, 'bytes');
      } else {
        console.warn('⚠️ Aucun fichier verso fourni');
      }

      console.log('Envoi de la réservation...');
      const response = await fetch('/api/submit-reservation', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'enregistrement de la réservation');
      }

      console.log('Réservation enregistrée avec succès:', result.reservationId);
      setReservationId(result.reservationId);
      setSubmitStatus('success');
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      setErrorMessage(error.message || 'Une erreur est survenue. Veuillez réessayer.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success' && reservationId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Réservation confirmée !
              </h1>
              <p className="text-gray-600 mb-6">
                Votre réservation a été enregistrée avec succès.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Prochaines étapes</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Vous allez recevoir un email de confirmation avec votre contrat de location.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Le paiement se fera en espèces, PayPal ou Wero lors de la remise des clés.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Numéro de réservation : <strong>{reservationId}</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSubmitStatus('idle');
                setReservationId(null);
                window.location.reload();
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Faire une nouvelle réservation
            </button>
          </div>
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
          <p className="text-sm text-gray-500 mt-2">
            Le paiement se fera en espèces, PayPal ou Wero lors de la remise des clés
          </p>
        </div>
        
        {submitStatus === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Erreur</p>
            <p>{errorMessage}</p>
          </div>
        )}

        <ReservationForm onSubmit={handleFormSubmit} />
        
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-gray-700">Enregistrement de votre réservation...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

