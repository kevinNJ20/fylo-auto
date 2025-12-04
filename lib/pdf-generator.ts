import jsPDF from 'jspdf';
import { ReservationFormData } from '@/types/reservation';

export const generateRentalContract = async (
  reservationData: ReservationFormData,
  reservationId: string
): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Fonction pour ajouter du texte avec saut de ligne
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > doc.internal.pageSize.getHeight() - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
  };

  // Titre
  addText('CONTRAT DE LOCATION DE VÉHICULE', 16, true);
  yPosition += 10;

  // Informations du contrat
  addText(`Numéro de réservation: ${reservationId}`, 10);
  addText(`Date du contrat: ${new Date().toLocaleDateString('fr-FR')}`, 10);
  yPosition += 5;

  // Section Locataire
  addText('INFORMATIONS DU LOCATAIRE', 12, true);
  yPosition += 5;
  addText(`Nom: ${reservationData.firstName} ${reservationData.lastName}`);
  addText(`Email: ${reservationData.email}`);
  addText(`Téléphone: ${reservationData.phone}`);
  addText(`Date de naissance: ${new Date(reservationData.dateOfBirth).toLocaleDateString('fr-FR')}`);
  addText(`Adresse: ${reservationData.address}, ${reservationData.postalCode} ${reservationData.city}`);
  yPosition += 5;

  // Section Permis de conduire
  addText('INFORMATIONS PERMIS DE CONDUIRE', 12, true);
  yPosition += 5;
  addText(`Numéro de permis: ${reservationData.licenseNumber}`);
  addText(`Date d'obtention: ${new Date(reservationData.licenseIssueDate).toLocaleDateString('fr-FR')}`);
  addText(`Date d'expiration: ${new Date(reservationData.licenseExpiryDate).toLocaleDateString('fr-FR')}`);
  addText(`Autorité émettrice: ${reservationData.licenseIssuingAuthority}`);
  if (reservationData.licensePoints !== undefined && reservationData.licensePoints !== null) {
    addText(`Points restants: ${reservationData.licensePoints}`);
  } else {
    addText(`Points restants: Non applicable (permis étranger)`);
  }
  yPosition += 5;

  // Section Réservation
  addText('DÉTAILS DE LA LOCATION', 12, true);
  yPosition += 5;
  addText(`Période: du ${new Date(reservationData.startDate).toLocaleDateString('fr-FR')} à ${new Date(reservationData.endDate).toLocaleDateString('fr-FR')}`);
  addText(`Heures: ${reservationData.startTime} - ${reservationData.endTime}`);
  yPosition += 5;

  // Section Paiement
  addText('INFORMATIONS DE PAIEMENT', 12, true);
  yPosition += 5;
  addText(`Montant total: ${(reservationData.amount / 100).toFixed(2)} ${reservationData.currency.toUpperCase()}`);
  yPosition += 10;

  // Conditions générales
  addText('CONDITIONS GÉNÉRALES ET ENGAGEMENTS', 12, true);
  yPosition += 5;
  addText('1. Le locataire s\'engage à utiliser le véhicule conformément au code de la route.');
  addText('2. Le locataire s\'engage à remettre le véhicule en état comme il l\'a pris au début de la location.');
  addText('3. Le locataire est responsable de toutes les contraventions qui pourraient survenir durant la période de location et s\'engage à procéder à la désignation du conducteur conformément aux informations fournies.');
  addText('4. Le locataire est responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la période de location.');
  addText('5. En cas de contravention, la désignation du conducteur sera effectuée conformément aux informations fournies lors de la réservation.');
  addText('6. L\'assurance du véhicule est en vigueur selon les termes du contrat d\'assurance.');
  yPosition += 5;
  
  // Confirmation d'acceptation
  if (reservationData.acceptsResponsibility) {
    addText('Le locataire a accepté et signé numériquement ces conditions lors de la réservation.', 10, true);
    addText(`Date d'acceptation: ${new Date().toLocaleDateString('fr-FR')}`, 10);
  }
  yPosition += 10;

  // Signatures
  addText('SIGNATURES', 12, true);
  yPosition += 20;
  addText('Locataire: ___________________', 10);
  yPosition += 10;
  addText('Propriétaire: ___________________', 10);

  // Générer le blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const generateContractFileName = (reservationId: string): string => {
  return `contrat-location-${reservationId}.pdf`;
};

