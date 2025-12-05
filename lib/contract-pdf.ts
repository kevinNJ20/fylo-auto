import PdfPrinter from 'pdfmake';
import { ReservationFormData } from '@/types/reservation';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * Génère le contrat de location en PDF
 */
export const generateContractPDF = async (
  reservationData: ReservationFormData,
  reservationId: string
): Promise<Buffer> => {
  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Définir les polices (pdfmake utilise des polices intégrées)
  const fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
  };

  const printer = new PdfPrinter(fonts);

  // Définir le document PDF
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 50],
    content: [
      // En-tête
      {
        text: 'CONTRAT DE LOCATION DE VÉHICULE',
        fontSize: 20,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },
      {
        text: `Numéro de réservation : ${reservationId}`,
        fontSize: 10,
        alignment: 'center',
        margin: [0, 0, 0, 5],
      },
      {
        text: `Date du contrat : ${formatDate(new Date().toISOString())}`,
        fontSize: 10,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },

      // Informations du locataire
      {
        text: 'INFORMATIONS DU LOCATAIRE',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Nom complet : ${reservationData.firstName} ${reservationData.lastName}\n`,
          `Email : ${reservationData.email}\n`,
          `Téléphone : ${reservationData.phone}\n`,
          `Date de naissance : ${formatDate(reservationData.dateOfBirth)}\n`,
          `Adresse : ${reservationData.address}, ${reservationData.postalCode} ${reservationData.city}\n`,
          `Pays : ${reservationData.country}`,
        ],
        margin: [0, 0, 0, 15],
      },

      // Informations permis de conduire
      {
        text: 'INFORMATIONS PERMIS DE CONDUIRE',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Numéro de permis : ${reservationData.licenseNumber}\n`,
          `Date d'obtention : ${formatDate(reservationData.licenseIssueDate)}\n`,
          `Date d'expiration : ${formatDate(reservationData.licenseExpiryDate)}\n`,
          `Autorité émettrice : ${reservationData.licenseIssuingAuthority}\n`,
          reservationData.licensePoints !== undefined && reservationData.licensePoints !== null
            ? `Points restants : ${reservationData.licensePoints}`
            : `Points restants : Non applicable (permis étranger)`,
        ],
        margin: [0, 0, 0, 15],
      },

      // Informations du véhicule
      {
        text: 'INFORMATIONS DU VÉHICULE',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Marque et modèle : Peugeot 2008\n`,
          `Année : 2019\n`,
          `Plaque d'immatriculation : FG954MV\n`,
          `Numéro de contrat d'assurance : 100029573215`,
        ],
        margin: [0, 0, 0, 15],
      },

      // Détails de la location
      {
        text: 'DÉTAILS DE LA LOCATION',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Période : Du ${formatDateShort(reservationData.startDate)} au ${formatDateShort(reservationData.endDate)}\n`,
          `Heures : De ${reservationData.startTime} à ${reservationData.endTime}`,
          ...(reservationData.vehicleType ? [`\nType de véhicule : ${reservationData.vehicleType}`] : []),
        ],
        margin: [0, 0, 0, 15],
      },

      // Informations de paiement
      {
        text: 'INFORMATIONS DE PAIEMENT',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Montant total : ${reservationData.amount.toFixed(2)} ${reservationData.currency.toUpperCase()}\n`,
          `Méthode de paiement : Paiement en espèces, PayPal ou Wero à la remise des clés.`,
        ],
        margin: [0, 0, 0, 15],
      },

      // Demandes particulières
      ...(reservationData.specialRequests
        ? [
            {
              text: 'DEMANDES SPÉCIALES',
              fontSize: 14,
              bold: true,
              decoration: 'underline',
              margin: [0, 0, 0, 10],
            },
            {
              fontSize: 11,
              text: reservationData.specialRequests,
              margin: [0, 0, 0, 15],
            },
          ]
        : []),

      // Conditions générales
      {
        text: 'CONDITIONS GÉNÉRALES ET ENGAGEMENTS',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        ol: [
          "Le locataire s'engage à utiliser le véhicule conformément au code de la route et aux lois en vigueur.",
          "Le locataire s'engage à remettre le véhicule en état comme il l'a pris au début de la location.",
          "Le locataire est responsable de toutes les contraventions qui pourraient survenir durant la période de location et s'engage à procéder à la désignation du conducteur conformément aux informations fournies.",
          "Le locataire est responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la période de location.",
          "En cas de contravention, la désignation du conducteur sera effectuée conformément aux informations fournies lors de la réservation (numéro de permis, informations personnelles, copies du permis de conduire).",
          "L'assurance du véhicule est en vigueur selon les termes du contrat d'assurance.",
        ],
        margin: [0, 0, 0, 15],
      },

      // Acceptation des conditions
      ...(reservationData.acceptsResponsibility
        ? [
            {
              text: '✓ Acceptation des conditions',
              fontSize: 11,
              bold: true,
              color: 'blue',
              margin: [0, 0, 0, 5],
            },
            {
              fontSize: 11,
              text: `Le locataire a accepté et signé numériquement ces conditions lors de la réservation le ${formatDate(new Date().toISOString())}.`,
              margin: [0, 0, 0, 15],
            },
          ]
        : []),

      // Signatures
      {
        text: 'SIGNATURES',
        fontSize: 14,
        bold: true,
        decoration: 'underline',
        margin: [0, 20, 0, 10],
      },
      {
        text: 'Locataire :',
        fontSize: 11,
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Nom : ${reservationData.firstName} ${reservationData.lastName}\n`,
          `Date : ${formatDate(new Date().toISOString())}`,
        ],
        margin: [0, 0, 0, 10],
      },
      {
        text: 'Signature : ___________________',
        fontSize: 11,
        margin: [0, 0, 0, 20],
      },
      {
        text: 'Propriétaire :',
        fontSize: 11,
        margin: [0, 0, 0, 10],
      },
      {
        fontSize: 11,
        text: [
          `Nom : JAMEIN NJUNDJA Kevin\n`,
          `Date : ${formatDate(new Date().toISOString())}`,
        ],
        margin: [0, 0, 0, 10],
      },
      {
        text: 'Signature : ___________________',
        fontSize: 11,
        margin: [0, 0, 0, 20],
      },

      // Pied de page
      {
        text: 'Ce document fait office de contrat de location. Veuillez le conserver pour vos archives.',
        fontSize: 9,
        color: 'gray',
        alignment: 'center',
        margin: [0, 20, 0, 5],
      },
      {
        text: 'Pour toute question, contactez le propriétaire via les coordonnées fournies lors de la réservation.',
        fontSize: 9,
        color: 'gray',
        alignment: 'center',
      },
    ],
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      pdfDoc.on('error', (error: Error) => {
        reject(error);
      });

      pdfDoc.end();
    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Génère le nom de fichier pour le contrat PDF
 */
export const generateContractFileName = (reservationId: string): string => {
  return `contrat-location-${reservationId}.pdf`;
};
