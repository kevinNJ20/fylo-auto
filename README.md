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

Deux webhooks Make.com sont nécessaires :

1. **Webhook Email** : Pour envoyer l'email de confirmation après paiement
2. **Webhook Contrat** : Pour générer et envoyer le contrat de location

Les webhooks recevront les données JSON avec toutes les informations de la réservation.

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

