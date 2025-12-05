'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ReservationFormData } from '@/types/reservation';
import { formatAmountForStripe } from '@/lib/stripe';

const reservationSchema = z.object({
  // Informations personnelles
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  dateOfBirth: z.string().min(1, 'Date de naissance requise'),
  address: z.string().min(5, 'Adresse complète requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  country: z.string().min(2, 'Pays requis'),

  // Informations permis
  licenseNumber: z.string().min(8, 'Numéro de permis invalide'),
  licenseIssueDate: z.string().min(1, 'Date d\'obtention requise'),
  licenseExpiryDate: z.string().min(1, 'Date d\'expiration requise'),
  licenseIssuingAuthority: z.string().min(2, 'Autorité émettrice requise'),

  // Informations ANTAI
  licensePoints: z.preprocess(
    (val) => {
      // Convertir les valeurs vides, null, undefined ou NaN en undefined
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }
      const num = Number(val);
      if (isNaN(num)) {
        return undefined;
      }
      return num;
    },
    z.number().min(0).max(12).optional()
  ),
  hasViolations: z.boolean(),
  violationsDetails: z.string().optional(),

  // Réservation
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  vehicleType: z.string().optional(),
  specialRequests: z.string().optional(),

  // Paiement
  amount: z.number().min(1, 'Montant requis'),
  currency: z.string().default('eur'),

  // Engagement
  acceptsResponsibility: z.boolean(),
}).refine((data) => data.acceptsResponsibility === true, {
  message: 'Vous devez accepter les conditions de responsabilité',
  path: ['acceptsResponsibility'],
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  onSubmit: (data: ReservationFormData, licenseFileRecto: File | null, licenseFileVerso: File | null) => Promise<void>;
  defaultAmount?: number;
}

export default function ReservationForm({ onSubmit, defaultAmount = 11000 }: ReservationFormProps) {
  const [licenseFileRecto, setLicenseFileRecto] = useState<File | null>(null);
  const [licenseFileVerso, setLicenseFileVerso] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasViolations, setHasViolations] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      currency: 'eur',
      amount: defaultAmount,
      hasViolations: false,
      acceptsResponsibility: false,
    },
  });

  const watchedHasViolations = watch('hasViolations');

  const onFormSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    try {
      const formData: ReservationFormData = {
        ...data,
        licenseFileRecto: licenseFileRecto || undefined,
        licenseFileVerso: licenseFileVerso || undefined,
      };
      await onSubmit(formData, licenseFileRecto, licenseFileVerso);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileRectoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFileRecto(e.target.files[0]);
    }
  };

  const handleFileVersoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFileVerso(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Informations personnelles */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Informations Personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              {...register('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              {...register('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de naissance *
            </label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              {...register('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code postal *
            </label>
            <input
              {...register('postalCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pays *
            </label>
            <input
              {...register('country')}
              defaultValue="France"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Informations permis de conduire */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Permis de Conduire</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de permis *
            </label>
            <input
              {...register('licenseNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'obtention *
            </label>
            <input
              type="date"
              {...register('licenseIssueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.licenseIssueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.licenseIssueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration *
            </label>
            <input
              type="date"
              {...register('licenseExpiryDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.licenseExpiryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.licenseExpiryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autorité émettrice *
            </label>
            <input
              {...register('licenseIssuingAuthority')}
              placeholder="Ex: Préfecture de Paris"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.licenseIssuingAuthority && (
              <p className="text-red-500 text-xs mt-1">{errors.licenseIssuingAuthority.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload du permis de conduire - Recto (face avant) *
            </label>
            <input
              type="file"
              name="licenseFileRecto"
              id="licenseFileRecto"
              accept="image/*,.pdf"
              onChange={handleFileRectoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {licenseFileRecto && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Recto sélectionné: {licenseFileRecto.name} ({(licenseFileRecto.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {!licenseFileRecto && (
              <p className="text-xs text-gray-500 mt-1">Veuillez sélectionner le recto (face avant) de votre permis</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload du permis de conduire - Verso (face arrière) *
            </label>
            <input
              type="file"
              name="licenseFileVerso"
              id="licenseFileVerso"
              accept="image/*,.pdf"
              onChange={handleFileVersoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {licenseFileVerso && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Verso sélectionné: {licenseFileVerso.name} ({(licenseFileVerso.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {!licenseFileVerso && (
              <p className="text-xs text-gray-500 mt-1">Veuillez sélectionner le verso (face arrière) de votre permis</p>
            )}
          </div>
        </div>
      </section>

      {/* Informations ANTAI */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Informations pour désignation de conducteur (ANTAI)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de points restants (optionnel - permis étranger sans points)
            </label>
            <input
              type="number"
              min="0"
              max="12"
              {...register('licensePoints', { 
                setValueAs: (v) => {
                  // Convertir les valeurs vides ou invalides en undefined
                  if (v === '' || v === null || v === undefined) {
                    return undefined;
                  }
                  const num = Number(v);
                  return isNaN(num) ? undefined : num;
                }
              })}
              placeholder="Laisser vide si permis étranger"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.licensePoints && (
              <p className="text-red-500 text-xs mt-1">{errors.licensePoints.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('hasViolations')}
                onChange={(e) => setHasViolations(e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                J'ai eu des contraventions dans les 12 derniers mois
              </span>
            </label>
          </div>

          {watchedHasViolations && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Détails des contraventions
              </label>
              <textarea
                {...register('violationsDetails')}
                rows={4}
                placeholder="Décrivez les contraventions reçues..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
              />
            </div>
          )}
        </div>
      </section>

      {/* Créneau de réservation */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Créneau de Réservation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="date"
              {...register('startDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <input
              type="date"
              {...register('endDate')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de début *
            </label>
            <input
              type="time"
              {...register('startTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.startTime && (
              <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de fin *
            </label>
            <input
              type="time"
              {...register('endTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
            {errors.endTime && (
              <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demandes particulières
            </label>
            <textarea
              {...register('specialRequests')}
              rows={3}
              placeholder="Options supplémentaires, équipements souhaités, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Engagement et responsabilité */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Engagement et Responsabilité</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                {...register('acceptsResponsibility')}
                className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-800">
                J'accepte et comprends les conditions suivantes : *
              </label>
              <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Je m'engage à remettre le véhicule en état comme je l'ai pris au début de la location</li>
                <li>Je suis responsable de toutes les contraventions qui pourraient survenir durant la période de location</li>
                <li>Je suis responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la location</li>
                <li>Je comprends que je devrai procéder à la désignation du conducteur en cas de contravention conformément aux informations fournies</li>
              </ul>
            </div>
          </div>
        </div>
        {errors.acceptsResponsibility && (
          <p className="text-red-500 text-sm mt-2">{errors.acceptsResponsibility.message}</p>
        )}
      </section>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Traitement...' : 'Continuer vers le paiement'}
        </button>
      </div>
    </form>
  );
}

