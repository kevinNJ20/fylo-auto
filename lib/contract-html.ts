import { ReservationFormData } from '@/types/reservation';

/**
 * Génère le contrat de location en HTML pour être envoyé par email
 */
export const generateContractHTML = (
  reservationData: ReservationFormData,
  reservationId: string
): string => {
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

  const amount = (reservationData.amount / 100).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat de Location - ${reservationId}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .contract-container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #2563eb;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .info-row {
            margin: 8px 0;
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            min-width: 180px;
        }
        .terms-section {
            background-color: #f9fafb;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin: 30px 0;
        }
        .terms-section ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .terms-section li {
            margin: 10px 0;
        }
        .signature-section {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
        }
        .signature-box {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        .acceptance-notice {
            background-color: #dbeafe;
            border: 1px solid #93c5fd;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .contract-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .contract-number {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
        }
        @media print {
            body {
                background-color: white;
            }
            .contract-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="contract-header">
            <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
            <div class="contract-number">
                <strong>Numéro de réservation :</strong> ${reservationId}<br>
                <strong>Date du contrat :</strong> ${formatDate(new Date().toISOString())}
            </div>
        </div>

        <div class="info-section">
            <h2>INFORMATIONS DU LOCATAIRE</h2>
            <div class="info-row">
                <span class="info-label">Nom complet :</span>
                ${reservationData.firstName} ${reservationData.lastName}
            </div>
            <div class="info-row">
                <span class="info-label">Email :</span>
                ${reservationData.email}
            </div>
            <div class="info-row">
                <span class="info-label">Téléphone :</span>
                ${reservationData.phone}
            </div>
            <div class="info-row">
                <span class="info-label">Date de naissance :</span>
                ${formatDate(reservationData.dateOfBirth)}
            </div>
            <div class="info-row">
                <span class="info-label">Adresse :</span>
                ${reservationData.address}, ${reservationData.postalCode} ${reservationData.city}
            </div>
            <div class="info-row">
                <span class="info-label">Pays :</span>
                ${reservationData.country}
            </div>
        </div>

        <div class="info-section">
            <h2>INFORMATIONS PERMIS DE CONDUIRE</h2>
            <div class="info-row">
                <span class="info-label">Numéro de permis :</span>
                ${reservationData.licenseNumber}
            </div>
            <div class="info-row">
                <span class="info-label">Date d'obtention :</span>
                ${formatDate(reservationData.licenseIssueDate)}
            </div>
            <div class="info-row">
                <span class="info-label">Date d'expiration :</span>
                ${formatDate(reservationData.licenseExpiryDate)}
            </div>
            <div class="info-row">
                <span class="info-label">Autorité émettrice :</span>
                ${reservationData.licenseIssuingAuthority}
            </div>
            ${reservationData.licensePoints !== undefined && reservationData.licensePoints !== null 
              ? `<div class="info-row">
                   <span class="info-label">Points restants :</span>
                   ${reservationData.licensePoints}
                 </div>`
              : `<div class="info-row">
                   <span class="info-label">Points restants :</span>
                   Non applicable (permis étranger)
                 </div>`
            }
        </div>

        <div class="info-section">
            <h2>DÉTAILS DE LA LOCATION</h2>
            <div class="info-row">
                <span class="info-label">Période :</span>
                Du ${formatDateShort(reservationData.startDate)} au ${formatDateShort(reservationData.endDate)}
            </div>
            <div class="info-row">
                <span class="info-label">Heures :</span>
                De ${reservationData.startTime} à ${reservationData.endTime}
            </div>
            ${reservationData.vehicleType 
              ? `<div class="info-row">
                   <span class="info-label">Type de véhicule :</span>
                   ${reservationData.vehicleType}
                 </div>`
              : ''
            }
        </div>

        <div class="info-section">
            <h2>INFORMATIONS DE PAIEMENT</h2>
            <div class="info-row">
                <span class="info-label">Montant total :</span>
                <strong>${amount} ${reservationData.currency.toUpperCase()}</strong>
            </div>
        </div>

        ${reservationData.specialRequests
          ? `<div class="info-section">
               <h2>DEMANDES SPÉCIALES</h2>
               <p>${reservationData.specialRequests}</p>
             </div>`
          : ''
        }

        <div class="terms-section">
            <h2>CONDITIONS GÉNÉRALES ET ENGAGEMENTS</h2>
            <ol>
                <li>Le locataire s'engage à utiliser le véhicule conformément au code de la route et aux lois en vigueur.</li>
                <li>Le locataire s'engage à remettre le véhicule en état comme il l'a pris au début de la location.</li>
                <li>Le locataire est responsable de toutes les contraventions qui pourraient survenir durant la période de location et s'engage à procéder à la désignation du conducteur conformément aux informations fournies.</li>
                <li>Le locataire est responsable de tous les dégâts, pertes ou vols qui pourraient avoir lieu durant la période de location.</li>
                <li>En cas de contravention, la désignation du conducteur sera effectuée conformément aux informations fournies lors de la réservation (numéro de permis, informations personnelles, copies du permis de conduire).</li>
                <li>L'assurance du véhicule est en vigueur selon les termes du contrat d'assurance.</li>
            </ol>
        </div>

        ${reservationData.acceptsResponsibility
          ? `<div class="acceptance-notice">
               <strong>✓ Acceptation des conditions</strong><br>
               Le locataire a accepté et signé numériquement ces conditions lors de la réservation le ${formatDate(new Date().toISOString())}.
             </div>`
          : ''
        }

        <div class="signature-section">
            <h2>SIGNATURES</h2>
            <div class="signature-box">
                <p><strong>Locataire :</strong></p>
                <p>Nom : ${reservationData.firstName} ${reservationData.lastName}</p>
                <p>Date : ${formatDate(new Date().toISOString())}</p>
                <p style="margin-top: 30px;">Signature : ___________________</p>
            </div>
            <div class="signature-box">
                <p><strong>Propriétaire :</strong></p>
                <p style="margin-top: 50px;">Signature : ___________________</p>
            </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
            <p>Ce document fait office de contrat de location. Veuillez le conserver pour vos archives.</p>
            <p>Pour toute question, contactez le propriétaire via les coordonnées fournies lors de la réservation.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

