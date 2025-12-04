import axios from 'axios';
import { ReservationFormData } from '@/types/reservation';

interface MakeWebhookPayload {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  reservationData: ReservationFormData;
  contractHTML: string; // Contrat HTML complet à envoyer par email
}

export const sendEmailWebhook = async (
  payload: MakeWebhookPayload
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
  payload: MakeWebhookPayload
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

