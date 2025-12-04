'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservation_id');
  const [isLoading, setIsLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    if (reservationId) {
      // Simuler un chargement
      setTimeout(() => {
        setIsLoading(false);
        setReservation({ id: reservationId });
      }, 1000);
    }
  }, [reservationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Réservation confirmée !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre paiement a été traité avec succès
            </p>
          </div>

          {reservationId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Numéro de réservation</p>
              <p className="text-2xl font-mono font-bold text-primary-600">
                {reservationId}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
            <p className="text-sm text-blue-700">
              <strong>Prochaines étapes :</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Un email de confirmation a été envoyé à votre adresse</li>
              <li>Le contrat de location vous sera envoyé par email dans les prochaines minutes</li>
              <li>Veuillez vérifier votre boîte de réception (et vos spams)</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
            >
              Imprimer la confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

