# Fylo-Auto - Application de Gestion de Location de Voitures

Application web complète pour la gestion de réservations de location de voitures avec intégration Make.com.

## Fonctionnalités

- 📋 Formulaire de réservation complet avec informations client
- 🪪 Upload du permis de conduire (recto et verso) avec vérification IA automatique
- 🤖 Vérification intelligente des permis avec OpenAI Vision (authenticité, validité, expiration)
- 💰 Calcul automatique du prix de location basé sur les dates, saison et marché (Turo, Getaround)
- 📅 Sélection de créneau de réservation
- ✅ Engagement obligatoire du client (remise en état, responsabilité des contraventions/dégâts)
- 💵 Paiement en espèces, PayPal ou Wero lors de la remise des clés
- 📧 Envoi automatique d'emails via Make.com
- 📄 Génération et envoi automatique de contrat de location (HTML)
- 📊 Logs détaillés de toutes les réservations
- 🎨 Interface moderne et responsive

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env.local` avec les variables suivantes :
```
OPENAI_API_KEY=votre_clé_api_openai
MAKE_WEBHOOK_URL_EMAIL=url_webhook_make_pour_email
MAKE_WEBHOOK_URL_CONTRACT=url_webhook_make_pour_contrat
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Notes :**
- **OPENAI_API_KEY** : Clé API OpenAI (gpt-4o-mini) pour la vérification des permis et le calcul des prix. Obtenez-la sur [platform.openai.com](https://platform.openai.com/api-keys)
- Les webhooks Make.com sont nécessaires pour l'envoi automatique d'emails et de contrats après chaque réservation.

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Logs et Monitoring

L'application génère des logs détaillés pour chaque réservation :

- **Toutes les données saisies** par le locataire sont loggées
- **Informations sur les fichiers uploadés** (nom, taille, type)
- **Statut des webhooks Make.com** (succès/échec)
- **Durée de traitement** de chaque réservation

**Sur Vercel :**
- Accédez aux logs via le dashboard Vercel > Votre projet > Logs
- Les logs incluent toutes les données de réservation pour faciliter le suivi
- Recherchez "=== NOUVELLE RÉSERVATION ===" pour trouver les nouvelles réservations

## Configuration Make.com

Deux webhooks Make.com sont nécessaires pour automatiser l'envoi d'emails et la génération de contrats.

### Scénario 1 : Webhook Email de Confirmation

**Objectif** : Envoyer un email de confirmation au client après enregistrement de la réservation.

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
   - Montant : {{1.reservationData.amount}} {{1.reservationData.currency}}
   
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
    "amount": 110,
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

3. **Module 3 : Email au Propriétaire** (Optionnel mais recommandé)
   - Type : Email > Send an Email (Gmail, Outlook, etc.)
   - To : Votre adresse email (propriétaire)
   - Subject : `Nouvelle réservation - Contrat à signer - {{1.reservationId}}`
   - **Body** : Message personnalisé avec les détails de la réservation
   - **Pièces jointes** : 
     - **Fichier 1** : Permis recto
       - Nom : `{{1.licenseFileRectoName}}`
       - Contenu : Décoder `{{1.licenseFileRectoBase64}}` depuis base64
       - Type MIME : `{{1.licenseFileRectoMimeType}}`
     - **Fichier 2** : Permis verso
       - Nom : `{{1.licenseFileVersoName}}`
       - Contenu : Décoder `{{1.licenseFileVersoBase64}}` depuis base64
       - Type MIME : `{{1.licenseFileVersoMimeType}}`

**Note** : Dans Make.com, pour ajouter les pièces jointes, utilisez le module "Convert Base64 to File" ou "Create File from Base64" pour convertir les champs `licenseFileRectoBase64` et `licenseFileVersoBase64` en fichiers avant de les joindre à l'email.

Le contrat HTML contient toutes les informations nécessaires et peut être imprimé ou sauvegardé par le client.

#### Structure JSON reçue par le webhook :

```json
{
  "type": "contract_generation",
  "reservationId": "abc123-def456-ghi789",
  "customerEmail": "client@example.com",
  "customerName": "Jean Dupont",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "contractHTML": "<!DOCTYPE html><html>...contenu HTML complet du contrat...</html>",
  "licenseFileRectoBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "licenseFileRectoName": "permis_recto.jpg",
  "licenseFileRectoMimeType": "image/jpeg",
  "licenseFileVersoBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "licenseFileVersoName": "permis_verso.jpg",
  "licenseFileVersoMimeType": "image/jpeg",
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
    "amount": 110,
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
- `/lib` - Utilitaires et configurations (génération de contrats HTML, webhooks Make.com, etc.)
- `/types` - Définitions TypeScript
- `/public` - Fichiers statiques

## Technologies utilisées

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Make.com (webhooks pour emails et contrats)
- React Hook Form + Zod (validation de formulaires)
- Génération de contrats HTML

