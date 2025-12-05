import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReservationFormData } from '@/types/reservation';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
  },
  textBold: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 20,
  },
  signatureSection: {
    marginTop: 20,
  },
  footer: {
    fontSize: 9,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

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

  // Composant React pour le document PDF
  const ContractDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CONTRAT DE LOCATION DE VÉHICULE</Text>
        <Text style={styles.subtitle}>Numéro de réservation : {reservationId}</Text>
        <Text style={styles.subtitle}>Date du contrat : {formatDate(new Date().toISOString())}</Text>

        <Text style={styles.sectionTitle}>INFORMATIONS DU LOCATAIRE</Text>
        <Text style={styles.text}>Nom complet : {reservationData.firstName} {reservationData.lastName}</Text>
        <Text style={styles.text}>Email : {reservationData.email}</Text>
        <Text style={styles.text}>Téléphone : {reservationData.phone}</Text>
        <Text style={styles.text}>Date de naissance : {formatDate(reservationData.dateOfBirth)}</Text>
        <Text style={styles.text}>Adresse : {reservationData.address}, {reservationData.postalCode} {reservationData.city}</Text>
        <Text style={styles.text}>Pays : {reservationData.country}</Text>

        <Text style={styles.sectionTitle}>INFORMATIONS PERMIS DE CONDUIRE</Text>
        <Text style={styles.text}>Numéro de permis : {reservationData.licenseNumber}</Text>
        <Text style={styles.text}>Date d'obtention : {formatDate(reservationData.licenseIssueDate)}</Text>
        <Text style={styles.text}>Date d'expiration : {formatDate(reservationData.licenseExpiryDate)}</Text>
        <Text style={styles.text}>Autorité émettrice : {reservationData.licenseIssuingAuthority}</Text>
        <Text style={styles.text}>
          Points restants : {reservationData.licensePoints !== undefined && reservationData.licensePoints !== null
            ? reservationData.licensePoints
            : 'Non applicable (permis étranger)'}
        </Text>

        <Text style={styles.sectionTitle}>INFORMATIONS DU VÉHICULE</Text>
        <Text style={styles.text}>Marque et modèle : Peugeot 2008</Text>
        <Text style={styles.text}>Année : 2019</Text>
        <Text style={styles.text}>Plaque d'immatriculation : FG954MV</Text>
        <Text style={styles.text}>Numéro de contrat d'assurance : 100029573215</Text>

        <Text style={styles.sectionTitle}>DÉTAILS DE LA LOCATION</Text>
        <Text style={styles.text}>
          Période : Du {formatDateShort(reservationData.startDate)} au {formatDateShort(reservationData.endDate)}
        </Text>
        <Text style={styles.text}>Heures : De {reservationData.startTime} à {reservationData.endTime}</Text>
        {reservationData.vehicleType && (
          <Text style={styles.text}>Type de véhicule : {reservationData.vehicleType}</Text>
        )}

        <Text style={styles.sectionTitle}>INFORMATIONS DE PAIEMENT</Text>
        <Text style={styles.text}>
          Montant total : {reservationData.amount.toFixed(2)} {reservationData.currency.toUpperCase()}
        </Text>
        <Text style={styles.text}>Méthode de paiement : Paiement en espèces, PayPal ou Wero à la remise des clés.</Text>

        {reservationData.specialRequests && (
          <>
            <Text style={styles.sectionTitle}>DEMANDES SPÉCIALES</Text>
            <Text style={styles.text}>{reservationData.specialRequests}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>CONDITIONS GÉNÉRALES ET ENGAGEMENTS</Text>
        <Text style={styles.listItem}>
          1. Le locataire s'engage à utiliser le véhicule conformément au code de la route et aux lois en vigueur.
        </Text>
        <Text style={styles.listItem}>
          2. Le locataire s'engage à remettre le véhicule en état comme il l'a pris au début de la location.
        </Text>
        <Text style={styles.listItem}>
          3. Le locataire est responsable de toutes les contraventions qui pourraient survenir durant la période de location et s'engage à procéder à la désignation du conducteur conformément aux informations fournies.
        </Text>
        <Text style={styles.listItem}>
          4. Le locataire est responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la période de location.
        </Text>
        <Text style={styles.listItem}>
          5. En cas de contravention, la désignation du conducteur sera effectuée conformément aux informations fournies lors de la réservation (numéro de permis, informations personnelles, copies du permis de conduire).
        </Text>
        <Text style={styles.listItem}>
          6. L'assurance du véhicule est en vigueur selon les termes du contrat d'assurance.
        </Text>

        {reservationData.acceptsResponsibility && (
          <>
            <Text style={[styles.textBold, { color: 'blue', marginTop: 10 }]}>✓ Acceptation des conditions</Text>
            <Text style={styles.text}>
              Le locataire a accepté et signé numériquement ces conditions lors de la réservation le{' '}
              {formatDate(new Date().toISOString())}.
            </Text>
          </>
        )}

        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>SIGNATURES</Text>
          <Text style={styles.text}>Locataire :</Text>
          <Text style={styles.text}>Nom : {reservationData.firstName} {reservationData.lastName}</Text>
          <Text style={styles.text}>Date : {formatDate(new Date().toISOString())}</Text>
          <Text style={styles.text}>Signature : ___________________</Text>

          <Text style={[styles.text, { marginTop: 20 }]}>Propriétaire :</Text>
          <Text style={styles.text}>Nom : JAMEIN NJUNDJA Kevin</Text>
          <Text style={styles.text}>Date : {formatDate(new Date().toISOString())}</Text>
          <Text style={styles.text}>Signature : ___________________</Text>
        </View>

        <Text style={styles.footer}>
          Ce document fait office de contrat de location. Veuillez le conserver pour vos archives.
        </Text>
        <Text style={styles.footer}>
          Pour toute question, contactez le propriétaire via les coordonnées fournies lors de la réservation.
        </Text>
      </Page>
    </Document>
  );

  // Générer le PDF
  const pdfDoc = pdf(<ContractDocument />);
  const blob = await pdfDoc.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Génère le nom de fichier pour le contrat PDF
 */
export const generateContractFileName = (reservationId: string): string => {
  return `contrat-location-${reservationId}.pdf`;
};

