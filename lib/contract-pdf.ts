import PDFDocument from 'pdfkit';
import { ReservationFormData } from '@/types/reservation';

/**
 * Génère le contrat de location en PDF
 */
export const generateContractPDF = async (
  reservationData: ReservationFormData,
  reservationId: string
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

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

      // En-tête
      doc.fontSize(20).font('Helvetica-Bold').text('CONTRAT DE LOCATION DE VÉHICULE', {
        align: 'center',
      });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica').text(`Numéro de réservation : ${reservationId}`, {
        align: 'center',
      });
      doc.text(`Date du contrat : ${formatDate(new Date().toISOString())}`, {
        align: 'center',
      });
      doc.moveDown(2);

      // Informations du locataire
      doc.fontSize(14).font('Helvetica-Bold').text('INFORMATIONS DU LOCATAIRE', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nom complet : ${reservationData.firstName} ${reservationData.lastName}`);
      doc.text(`Email : ${reservationData.email}`);
      doc.text(`Téléphone : ${reservationData.phone}`);
      doc.text(`Date de naissance : ${formatDate(reservationData.dateOfBirth)}`);
      doc.text(`Adresse : ${reservationData.address}, ${reservationData.postalCode} ${reservationData.city}`);
      doc.text(`Pays : ${reservationData.country}`);
      doc.moveDown(1.5);

      // Informations permis de conduire
      doc.fontSize(14).font('Helvetica-Bold').text('INFORMATIONS PERMIS DE CONDUIRE', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Numéro de permis : ${reservationData.licenseNumber}`);
      doc.text(`Date d'obtention : ${formatDate(reservationData.licenseIssueDate)}`);
      doc.text(`Date d'expiration : ${formatDate(reservationData.licenseExpiryDate)}`);
      doc.text(`Autorité émettrice : ${reservationData.licenseIssuingAuthority}`);
      if (reservationData.licensePoints !== undefined && reservationData.licensePoints !== null) {
        doc.text(`Points restants : ${reservationData.licensePoints}`);
      } else {
        doc.text(`Points restants : Non applicable (permis étranger)`);
      }
      doc.moveDown(1.5);

      // Informations du véhicule
      doc.fontSize(14).font('Helvetica-Bold').text('INFORMATIONS DU VÉHICULE', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Marque et modèle : Peugeot 2008`);
      doc.text(`Année : 2019`);
      doc.text(`Plaque d'immatriculation : FG954MV`);
      doc.text(`Numéro de contrat d'assurance : 100029573215`);
      doc.moveDown(1.5);

      // Détails de la location
      doc.fontSize(14).font('Helvetica-Bold').text('DÉTAILS DE LA LOCATION', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Période : Du ${formatDateShort(reservationData.startDate)} au ${formatDateShort(reservationData.endDate)}`);
      doc.text(`Heures : De ${reservationData.startTime} à ${reservationData.endTime}`);
      if (reservationData.vehicleType) {
        doc.text(`Type de véhicule : ${reservationData.vehicleType}`);
      }
      doc.moveDown(1.5);

      // Informations de paiement
      doc.fontSize(14).font('Helvetica-Bold').text('INFORMATIONS DE PAIEMENT', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Montant total : ${reservationData.amount.toFixed(2)} ${reservationData.currency.toUpperCase()}`);
      doc.text(`Méthode de paiement : Paiement en espèces, PayPal ou Wero à la remise des clés.`);
      doc.moveDown(1.5);

      // Demandes particulières
      if (reservationData.specialRequests) {
        doc.fontSize(14).font('Helvetica-Bold').text('DEMANDES SPÉCIALES', {
          underline: true,
        });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        doc.text(reservationData.specialRequests);
        doc.moveDown(1.5);
      }

      // Conditions générales
      doc.fontSize(14).font('Helvetica-Bold').text('CONDITIONS GÉNÉRALES ET ENGAGEMENTS', {
        underline: true,
      });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text('1. Le locataire s\'engage à utiliser le véhicule conformément au code de la route et aux lois en vigueur.');
      doc.text('2. Le locataire s\'engage à remettre le véhicule en état comme il l\'a pris au début de la location.');
      doc.text('3. Le locataire est responsable de toutes les contraventions qui pourraient survenir durant la période de location et s\'engage à procéder à la désignation du conducteur conformément aux informations fournies.');
      doc.text('4. Le locataire est responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la période de location.');
      doc.text('5. En cas de contravention, la désignation du conducteur sera effectuée conformément aux informations fournies lors de la réservation (numéro de permis, informations personnelles, copies du permis de conduire).');
      doc.text('6. L\'assurance du véhicule est en vigueur selon les termes du contrat d\'assurance.');
      doc.moveDown(1);

      // Acceptation des conditions
      if (reservationData.acceptsResponsibility) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('blue');
        doc.text('✓ Acceptation des conditions');
        doc.font('Helvetica').fillColor('black');
        doc.text(`Le locataire a accepté et signé numériquement ces conditions lors de la réservation le ${formatDate(new Date().toISOString())}.`);
        doc.moveDown(1.5);
      }

      // Signatures
      doc.fontSize(14).font('Helvetica-Bold').text('SIGNATURES', {
        underline: true,
      });
      doc.moveDown(1);
      doc.fontSize(11).font('Helvetica');
      
      // Signature Locataire
      doc.text('Locataire :');
      doc.moveDown(1);
      doc.text(`Nom : ${reservationData.firstName} ${reservationData.lastName}`);
      doc.text(`Date : ${formatDate(new Date().toISOString())}`);
      doc.moveDown(1.5);
      doc.text('Signature : ___________________');
      
      doc.moveDown(2.5);
      
      // Signature Propriétaire
      doc.text('Propriétaire :');
      doc.moveDown(1);
      doc.text('Nom : JAMEIN NJUNDJA Kevin');
      doc.text(`Date : ${formatDate(new Date().toISOString())}`);
      doc.moveDown(1.5);
      doc.text('Signature : ___________________');

      // Pied de page
      doc.fontSize(9).fillColor('gray');
      doc.text('Ce document fait office de contrat de location. Veuillez le conserver pour vos archives.', {
        align: 'center',
      });
      doc.text('Pour toute question, contactez le propriétaire via les coordonnées fournies lors de la réservation.', {
        align: 'center',
      });

      doc.end();
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
