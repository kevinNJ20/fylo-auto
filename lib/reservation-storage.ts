// Stockage temporaire en mémoire des réservations
// TODO: Remplacer par une vraie base de données en production

interface StoredReservation {
  reservationId: string;
  reservationData: any;
  licenseFileRecto?: {
    name: string;
    base64: string;
    mimeType: string;
  };
  licenseFileVerso?: {
    name: string;
    base64: string;
    mimeType: string;
  };
  createdAt: Date;
}

// Stockage en mémoire (sera perdu au redémarrage)
// En production, utiliser une base de données ou un cache Redis
const reservations = new Map<string, StoredReservation>();

export const storeReservation = (
  reservationId: string,
  reservationData: any,
  licenseFileRecto?: { name: string; base64: string; mimeType: string },
  licenseFileVerso?: { name: string; base64: string; mimeType: string }
) => {
  reservations.set(reservationId, {
    reservationId,
    reservationData,
    licenseFileRecto,
    licenseFileVerso,
    createdAt: new Date(),
  });

  // Nettoyer les réservations de plus de 24h
  const now = new Date();
  for (const [id, reservation] of Array.from(reservations.entries())) {
    const hoursSinceCreation = (now.getTime() - reservation.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      reservations.delete(id);
    }
  }
};

export const getReservation = (reservationId: string): StoredReservation | undefined => {
  return reservations.get(reservationId);
};

export const deleteReservation = (reservationId: string) => {
  reservations.delete(reservationId);
};

