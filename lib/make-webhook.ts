import axios from 'axios';
import { ReservationFormData } from '@/types/reservation';

interface EmailWebhookPayload {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  reservationData: ReservationFormData;
}

interface ContractWebhookPayload {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  reservationData: ReservationFormData;
  contractHTML: string; // Contrat HTML complet à envoyer par email
  licenseFileRectoBase64?: string; // Permis recto en base64
  licenseFileRectoName?: string; // Nom du fichier recto
  licenseFileRectoMimeType?: string; // Type MIME du fichier recto
  licenseFileVersoBase64?: string; // Permis verso en base64
  licenseFileVersoName?: string; // Nom du fichier verso
  licenseFileVersoMimeType?: string; // Type MIME du fichier verso
}

export const sendEmailWebhook = async (
  payload: EmailWebhookPayload
): Promise<void> => {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_EMAIL;
  
  if (!webhookUrl) {
    console.error('MAKE_WEBHOOK_URL_EMAIL n\'est pas configuré');
    throw new Error('Configuration webhook email manquante');
  }

  try {
    await axios.post(webhookUrl, {
      type: 'reservation_confirmation',
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du webhook email:', error);
    throw error;
  }
};

export const sendContractWebhook = async (
  payload: ContractWebhookPayload
): Promise<void> => {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_CONTRACT;
  
  if (!webhookUrl) {
    console.error('MAKE_WEBHOOK_URL_CONTRACT n\'est pas configuré');
    throw new Error('Configuration webhook contrat manquante');
  }

  try {
    await axios.post(webhookUrl, {
      type: 'contract_generation',
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du webhook contrat:', error);
    throw error;
  }
};

