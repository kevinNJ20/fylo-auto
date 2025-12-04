# Fylo-Auto - Application de Gestion de Location de Voitures

Application web complète pour la gestion de réservations de location de voitures avec paiement Stripe et intégration Make.com.

## Fonctionnalités

- 📋 Formulaire de réservation complet avec informations client
- 🪪 Upload du permis de conduire
- 📅 Sélection de créneau de réservation
- ✅ Engagement obligatoire du client (remise en état, responsabilité des contraventions/dégâts)
- 💳 Paiement sécurisé via Stripe
- 📧 Envoi automatique d'emails via Make.com
- 📄 Génération et envoi automatique de contrat de location
- 🎨 Interface moderne et responsive

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env.local` avec les variables suivantes :
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_clé_publique_stripe
STRIPE_SECRET_KEY=votre_clé_secrète_stripe
STRIPE_WEBHOOK_SECRET=votre_secret_webhook_stripe (voir ci-dessous)
MAKE_WEBHOOK_URL_EMAIL=url_webhook_make_pour_email
MAKE_WEBHOOK_URL_CONTRACT=url_webhook_make_pour_contrat
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note sur STRIPE_WEBHOOK_SECRET :**
- Les clés Stripe (publishable + secret) suffisent pour créer les paiements
- Le webhook secret est nécessaire pour l'envoi automatique d'emails/contrats après paiement
- **En développement local** : Utilisez Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhook/stripe`) qui affichera un secret
- **En production** : Dans Stripe Dashboard > Developers > Webhooks, créez un endpoint pointant vers `https://votre-domaine.com/api/webhook/stripe` et récupérez le "Signing secret"

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Configuration Make.com

Deux webhooks Make.com sont nécessaires pour automatiser l'envoi d'emails et la génération de contrats.

### Scénario 1 : Webhook Email de Confirmation

**Objectif** : Envoyer un email de confirmation au client après paiement réussi.

#### Structure du scénario :

1. **Module 1 : Webhook Custom** (Trigger)
   - Type : Webhook > Custom webhook
   - Méthode : POST
   - Copiez l'URL du webhook générée et ajoutez-la dans `.env.local` comme `MAKE_WEBHOOK_URL_EMAIL`

2. **Module 2 : Email** (Gmail, Outlook, etc.)
   - Type : Email > Send an Email
   - To : `{{1.customerEmail}}`
   - Subject : `Confirmation de réservation - {{1.reservationId}}`
   - Body : (HTML ou texte)
   ```html
   Bonjour {{1.customerName}},

   Votre réservation de location de véhicule a été confirmée !

   Numéro de réservation : {{1.reservationId}}
   
   Détails de la location :
   - Du {{1.reservationData.startDate}} à {{1.reservationData.startTime}}
   - Au {{1.reservationData.endDate}} à {{1.reservationData.endTime}}
   - Montant payé : {{1.reservationData.amount}} {{1.reservationData.currency}}
   
   Merci pour votre confiance !

   Cordialement,
   L'équipe Fylo-Auto
   ```

#### Structure JSON reçue par le webhook :

```json
{
  "type": "reservation_confirmation",
  "reservationId": "abc123-def456-ghi789",
  "customerEmail": "client@example.com",
  "customerName": "Jean Dupont",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "reservationData": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "client@example.com",
    "phone": "+33612345678",
    "dateOfBirth": "1990-01-15",
    "address": "123 Rue Example",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "licenseNumber": "12 345678 90 12",
    "licenseIssueDate": "2015-03-20",
    "licenseExpiryDate": "2025-03-20",
    "licenseIssuingAuthority": "Préfecture de Paris",
    "licensePoints": 12,
    "hasViolations": false,
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "startTime": "10:00",
    "endTime": "18:00",
    "amount": 11000,
    "currency": "eur",
    "acceptsResponsibility": true
  }
}
```

---

### Scénario 2 : Webhook Envoi de Contrat par Email

**Objectif** : Envoyer le contrat de location complet par email au client. Le contrat est généré en HTML et fait office de contrat officiel.

#### Structure du scénario :

1. **Module 1 : Webhook Custom** (Trigger)
   - Type : Webhook > Custom webhook
   - Méthode : POST
   - Copiez l'URL du webhook générée et ajoutez-la dans `.env.local` comme `MAKE_WEBHOOK_URL_CONTRACT`

2. **Module 2 : Email au Client**
   - Type : Email > Send an Email (Gmail, Outlook, etc.)
   - To : `{{1.customerEmail}}`
   - Subject : `Votre contrat de location - {{1.reservationId}}`
   - **Body (HTML)** : Utilisez directement `{{1.contractHTML}}`
   - **Format** : HTML

C'est tout ! Le contrat HTML contient toutes les informations nécessaires et peut être imprimé ou sauvegardé par le client.

#### Structure JSON reçue par le webhook :

```json
{
  "type": "contract_generation",
  "reservationId": "abc123-def456-ghi789",
  "customerEmail": "client@example.com",
  "customerName": "Jean Dupont",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "contractHTML": "<!DOCTYPE html><html>...contenu HTML complet du contrat...</html>",
  "reservationData": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "client@example.com",
    "phone": "+33612345678",
    "dateOfBirth": "1990-01-15",
    "address": "123 Rue Example",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France",
    "licenseNumber": "12 345678 90 12",
    "licenseIssueDate": "2015-03-20",
    "licenseExpiryDate": "2025-03-20",
    "licenseIssuingAuthority": "Préfecture de Paris",
    "licensePoints": 12,
    "hasViolations": false,
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "startTime": "10:00",
    "endTime": "18:00",
    "amount": 11000,
    "currency": "eur",
    "acceptsResponsibility": true
  }
}
```

#### Notes importantes :

- **Le contrat HTML est complet** : Il contient toutes les informations de la réservation, les conditions générales, et les signatures numériques.
- **Aucune manipulation nécessaire** : Le contrat est prêt à être envoyé directement dans le body de l'email.
- **Format HTML** : Assurez-vous que votre module Email est configuré pour accepter le format HTML (pas seulement texte brut).
- **Le contrat fait office de document officiel** : Le client peut l'imprimer, le sauvegarder ou le transférer pour ses archives.

---

### Configuration des URLs de webhook

1. Dans Make.com, créez les deux scénarios ci-dessus
2. Activez chaque scénario pour générer l'URL du webhook
3. Copiez les URLs et ajoutez-les dans votre fichier `.env.local` :

```env
MAKE_WEBHOOK_URL_EMAIL=https://hook.us1.make.com/xxxxxxxxxxxxx
MAKE_WEBHOOK_URL_CONTRACT=https://hook.us1.make.com/yyyyyyyyyyyyy
```

4. Redéployez l'application pour prendre en compte les nouvelles variables d'environnement

## Structure du projet

- `/app` - Pages et routes de l'application Next.js
- `/components` - Composants React réutilisables
- `/lib` - Utilitaires et configurations (Stripe, PDF, etc.)
- `/types` - Définitions TypeScript
- `/public` - Fichiers statiques

## Technologies utilisées

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Stripe
- jsPDF (génération de contrats)
- React Hook Form + Zod

