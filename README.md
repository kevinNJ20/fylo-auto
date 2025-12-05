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
- 📄 Génération et envoi automatique de contrat de location (PDF)
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
   <!-- Message HTML à copier-coller dans Make.com comme corps de l'email -->

   <div style="max-width:520px; margin:auto; font-family:Arial,Helvetica,sans-serif; background:#fafbfc; border-radius:8px; border:1px solid #e6e8ec; box-shadow:0 2px 8px #0001; overflow:hidden;">
     <div style="background-color:#2742f5; color:#fff; text-align:center; padding:26px 24px 12px;">
       <h2 style="margin:0; font-size:2em; letter-spacing:0.02em;">Confirmation de réservation</h2>
     </div>
     <div style="padding:24px; color:#222;">
       <p style="font-size:1.07em; margin:0 0 14px;">Bonjour <strong>{{1.customerName}}</strong>,</p>
       <p style="margin:0 0 18px;">
         Votre réservation de location de véhicule a été <strong>confirmée</strong> !
       </p>

       <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
         <tr>
           <td style="font-weight:bold; color:#2742f5; padding:6px 0;">Numéro de réservation :</td>
           <td style="padding:6px 0;">{{1.reservationId}}</td>
         </tr>
         <tr>
           <td style="font-weight:bold; color:#2742f5; padding:6px 0; white-space:nowrap;">Début :</td>
           <td style="padding:6px 0;">{{1.reservationData.startDate}} à {{1.reservationData.startTime}}</td>
         </tr>
         <tr>
           <td style="font-weight:bold; color:#2742f5; padding:6px 0; white-space:nowrap;">Fin :</td>
           <td style="padding:6px 0;">{{1.reservationData.endDate}} à {{1.reservationData.endTime}}</td>
         </tr>
         <tr>
           <td style="font-weight:bold; color:#2742f5; padding:6px 0;">Montant :</td>
           <td style="padding:6px 0;">{{1.reservationData.amount}} {{1.reservationData.currency}}</td>
         </tr>
       </table>

       <p style="margin:0 0 18px;">Merci pour votre confiance&nbsp;!</p>
       <p style="color:#555; font-size:0.98em; margin:0;">
         Cordialement,<br>
         <strong>L'équipe Fylo-Auto</strong>
       </p>
     </div>
     <div style="background:#f4f6fa; color:#8c97ac; text-align:center; font-size:0.85em; padding:10px 0 7px; letter-spacing:0.02em;">
       Ce message a été généré automatiquement, merci de ne pas y répondre.
     </div>
   </div>

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

### Scénario 2 : Webhook Envoi de Contrat PDF par Email

**Objectif** : Envoyer le contrat de location complet en format PDF par email au client. Le contrat est généré en PDF professionnel et fait office de contrat officiel.

#### Structure du scénario :

1. **Module 1 : Webhook Custom** (Trigger)
   - Type : Webhook > Custom webhook
   - Méthode : POST
   - Copiez l'URL du webhook générée et ajoutez-la dans `.env.local` comme `MAKE_WEBHOOK_URL_CONTRACT`

2. **Module 2 : Convertir Base64 en Fichier PDF**
   - Type : Tools > Convert Base64 to File
   - Base64 : `{{1.contractPDFBase64}}`
   - Filename : `{{1.contractFileName}}`
   - MIME Type : `{{1.contractFileMimeType}}` (ou `application/pdf`)

3. **Module 3 : Email au Client**
   - Type : Email > Send an Email (Gmail, Outlook, etc.)
   - To : `{{1.customerEmail}}`
   - Subject : `Votre contrat de location - {{1.reservationId}}`
   - **Body** : 
     <div style="font-family: Arial, sans-serif; color:#222; background-color:#f9f9f9; padding:32px; border-radius:10px; max-width:540px; margin:auto; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
       <h2 style="color:#17476b; margin-top:0">Bonjour <span style="color:#2374ab;">{{1.customerName}}</span>,</h2>
       
       <p style="font-size:1.1em; line-height:1.7;">
         Merci pour votre réservation chez <b>Location</b> !<br>
         Vous trouverez en pièce jointe votre <b>contrat de location officiel</b> (réservation n° <span style="color:#2374ab">{{1.reservationId}}</span>).
         <br>
         <span style="color:#17476b;">Nous vous invitons à le lire attentivement et à le conserver précieusement.</span>
       </p>
       
       <p style="font-size:1.05em; margin:24px 0 12px;">
         Pour toute question, n'hésitez pas à nous contacter.<br>
       </p>

       <p style="margin:32px 0 0; font-size:1.1em; color:#2374ab;">
         Cordialement,<br>
         <span style="font-weight:bold;">L'équipe de Location</span>
       </p>
     </div>
   - **Pièce jointe** : Le fichier PDF converti à l'étape précédente

4. **Module 4 : Convertir Base64 en Fichiers Permis** (Pour le propriétaire)
   - **Fichier 1 - Permis Recto** :
     - Type : Tools > Convert Base64 to File
     - Base64 : `{{1.licenseFileRectoBase64}}`
     - Filename : `{{1.licenseFileRectoName}}`
     - MIME Type : `{{1.licenseFileRectoMimeType}}`
   - **Fichier 2 - Permis Verso** :
     - Type : Tools > Convert Base64 to File
     - Base64 : `{{1.licenseFileVersoBase64}}`
     - Filename : `{{1.licenseFileVersoName}}`
     - MIME Type : `{{1.licenseFileVersoMimeType}}`

5. **Module 5 : Email au Propriétaire** (Optionnel mais recommandé)
   - Type : Email > Send an Email (Gmail, Outlook, etc.)
   - To : Votre adresse email (propriétaire)
   - Subject : `Nouvelle réservation - Contrat à signer - {{1.reservationId}}`
   - **Body** : 
     <div style="font-family: Arial, sans-serif; color:#222; background-color:#f3f6fa; padding:32px; border-radius:10px; max-width:600px; margin:auto; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
       <h2 style="color:#17476b; margin-top:0">
         Nouvelle réservation - Contrat à signer
       </h2>
       <p style="font-size:1.1em;">
         Bonjour,<br>
         Une <strong>nouvelle réservation</strong> vient d'être effectuée. <br>
         <span style="color:#2374ab;"><strong>Numéro de réservation :</strong> {{1.reservationId}}</span>
       </p>

       <h3 style="color:#2374ab; margin-top:32px; margin-bottom:12px;">Détails du client :</h3>
       <ul style="margin:0 0 14px 0;padding-left:20px;font-size:1.05em;">
         <li><strong>Nom&nbsp;:</strong> {{1.reservationData.lastName}} {{1.reservationData.firstName}}</li>
         <li><strong>Email&nbsp;:</strong> {{1.reservationData.email}}</li>
         <li><strong>Téléphone&nbsp;:</strong> {{1.reservationData.phone}}</li>
         <li><strong>Date de naissance&nbsp;:</strong> {{1.reservationData.dateOfBirth}}</li>
         <li><strong>Adresse&nbsp;:</strong> {{1.reservationData.address}}, {{1.reservationData.postalCode}} {{1.reservationData.city}}, {{1.reservationData.country}}</li>
       </ul>

       <h3 style="color:#2374ab; margin-top:28px; margin-bottom:12px;">Détails du permis :</h3>
       <ul style="margin:0 0 14px 0;padding-left:20px;font-size:1.05em;">
         <li><strong>Numéro :</strong> {{1.reservationData.licenseNumber}}</li>
         <li><strong>Délivré le :</strong> {{1.reservationData.licenseIssueDate}}</li>
         <li><strong>Expire le :</strong> {{1.reservationData.licenseExpiryDate}}</li>
         <li><strong>Préfecture :</strong> {{1.reservationData.licenseIssuingAuthority}}</li>
         <li><strong>Points restants :</strong> {{1.reservationData.licensePoints}}</li>
         <li><strong>Infractions&nbsp;:</strong> {{#if 1.reservationData.hasViolations}}Oui{{else}}Non{{/if}}</li>
       </ul>

       <h3 style="color:#2374ab; margin-top:28px; margin-bottom:12px;">Détails de la location :</h3>
       <ul style="margin:0 0 14px 0;padding-left:20px;font-size:1.05em;">
         <li><strong>Début&nbsp;:</strong> {{1.reservationData.startDate}} à {{1.reservationData.startTime}}</li>
         <li><strong>Fin&nbsp;:</strong> {{1.reservationData.endDate}} à {{1.reservationData.endTime}}</li>
         <li><strong>Montant&nbsp;:</strong> {{1.reservationData.amount}} {{1.reservationData.currency}}</li>
         <li><strong>Responsabilité acceptée&nbsp;:</strong> {{#if 1.reservationData.acceptsResponsibility}}Oui{{else}}Non{{/if}}</li>
       </ul>

       <p style="margin-top:36px; font-size:1.07em;">
         <span style="color:#17476b;">
           Les documents suivants sont en pièce jointe :<br>
           <ul style="margin:10px 0 0 20px;">
             <li>Contrat PDF généré</li>
             <li>Permis de conduire (recto et verso)</li>
           </ul>
         </span>
       </p>

       <p style="color:#2374ab; margin-top:32px;">Merci de procéder à la vérification et à la signature du contrat.<br>
         <span style="font-size:1em; color:#17476b;">
           --<br>
           <strong>Système de réservation Location</strong>
         </span>
       </p>
     </div>
   - **Pièces jointes** : 
     - Le contrat PDF (converti à l'étape 2)
     - Les deux fichiers permis (convertis à l'étape 4)

**Note** : Le contrat PDF contient toutes les informations nécessaires et peut être imprimé, signé ou sauvegardé par le client et le propriétaire.

#### Structure JSON reçue par le webhook :

```json
{
  "type": "contract_generation",
  "reservationId": "abc123-def456-ghi789",
  "customerEmail": "client@example.com",
  "customerName": "Jean Dupont",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "contractPDFBase64": "JVBERi0xLjQKJeLjz9MKMyAw...",
  "contractFileName": "contrat-location-abc123-def456-ghi789.pdf",
  "contractFileMimeType": "application/pdf",
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

- **Le contrat PDF est complet** : Il contient toutes les informations de la réservation, les conditions générales, et les signatures numériques.
- **Conversion Base64 requise** : Utilisez le module "Convert Base64 to File" de Make.com pour convertir le PDF base64 en fichier avant de l'envoyer en pièce jointe.
- **Format PDF professionnel** : Le contrat est généré en format A4 avec une mise en page professionnelle.
- **Le contrat fait office de document officiel** : Le client peut l'imprimer, le signer, le sauvegarder ou le transférer pour ses archives.

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
- `/lib` - Utilitaires et configurations (génération de contrats PDF, webhooks Make.com, etc.)
- `/types` - Définitions TypeScript
- `/public` - Fichiers statiques

## Technologies utilisées

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Make.com (webhooks pour emails et contrats)
- React Hook Form + Zod (validation de formulaires)
- Génération de contrats PDF

