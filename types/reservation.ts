export interface ReservationFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;

  // Informations permis de conduire
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseIssuingAuthority: string;
  licenseFile?: File;

  // Informations ANTAI
  licensePoints: number;
  hasViolations: boolean;
  violationsDetails?: string;

  // Réservation
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  vehicleType?: string;
  specialRequests?: string;

  // Paiement
  amount: number;
  currency: string;

  // Engagement
  acceptsResponsibility: boolean;
}

export interface Reservation extends ReservationFormData {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  licenseFileUrl?: string;
  contractUrl?: string;
}

