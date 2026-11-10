# KHIDMA TCHAD — Plateforme de Mise en Relation & Services à Domicile

Plateforme complète de services et d'artisanat local pour le Tchad (**N'Djamena, Moundou, Sarh, Abéché**), connectant en temps réel les clients et les artisans certifiés avec vérification d'identité assistée par IA et persistance SQLite.

---

## 🏗️ Architecture Technique

```
KHIDMA TCHAD/
├── backend/
│   ├── server.js               # Serveur Express 5 REST API + Authentification JWT
│   ├── database.js             # Base SQLite (better-sqlite3) & Seeds initiaux
│   ├── khidma_tchad.db         # Fichier de base de données relationnelle SQLite (WAL mode)
│   └── package.json            # Dépendances (express, better-sqlite3, bcryptjs, jsonwebtoken, cors)
├── ProxiTchad/
│   ├── index.html              # Page d'accueil & recherche géolocalisée
│   ├── js/
│   │   ├── api.js              # Couche API client (HTTP + JWT + cache + fallback offline)
│   │   ├── handlers.js         # Gestionnaires d'événements & soumissions réelles
│   │   ├── data.js             # Modèles de données & helpers
│   │   ├── state.js            # Gestion de session
│   │   └── modals.js           # Fenêtres modales & formulaires
│   └── pages/
│       ├── client.html         # Tableau de bord client (demandes, devis, suivi, avis)
│       ├── pro.html            # Espace artisan (missions disponibles, devis, statut)
│       ├── admin.html          # Console d'administration & validation IA des artisans
│       ├── devenir-prestataire.html # Formulaire d'inscription & audit IA temps réel
│       ├── publier-demande.html# Dépôt de demande de service
│       └── services.html       # Catalogue des catégories et prestataires
└── DEMARRER_BACKEND.bat        # Lanceur Windows 1-clic pour le serveur
```

---

## 🚀 Démarrage Rapide

### Option 1 : Double-cliquer sur le fichier Windows
Double-cliquez sur `DEMARRER_BACKEND.bat` à la racine du dossier.

### Option 2 : En ligne de commande
```bash
cd backend
npm start
```

Le serveur démarre immédiatement sur :
👉 **http://localhost:3001**

- L'application web complète est directement accessible sur cette adresse.
- L'API REST répond sur `http://localhost:3001/api/...`.

---

## 🔐 Identifiants des Comptes de Démonstration

| Rôle | Numéro de téléphone | Mot de passe | Accès |
|---|---|---|---|
| **Artisan Vérifié** | `+235 66 12 34 56` | `khidma2025` | Espace Pro (`pages/pro.html`) |
| **Administrateur** | `+235 61 00 00 00` | `admin2025` | Console Admin (`pages/admin.html`) |
| **Client** | `+235 66 24 55 88` | `khidma2025` | Espace Client (`pages/client.html`) |

---

## 📡 Points de Terminaison API (REST)

### 1. Authentification (`/api/auth`)
- `POST /api/auth/login` : Connexion artisan, client ou administrateur. Retourne un token JWT et les informations de profil.
- `POST /api/auth/register-client` : Inscription d'un nouveau compte client.

### 2. Prestataires (`/api/providers`)
- `GET /api/providers` : Liste des artisans vérifiés avec filtres par catégorie, ville, quartier ou recherche textuelle.
- `GET /api/providers/:id` : Profil complet d'un artisan.
- `GET /api/providers/pending` : Liste des artisans en attente de validation (réservé admin).
- `POST /api/providers` : Inscription d'un nouvel artisan avec **évaluation IA automatique** (vérification du préfixe opérateur Airtel/Moov Tchad, pertinence des compétences, scoring de confiance).
- `PUT /api/providers/:id/verify` : Validation ou suspension d'un profil artisan (admin).
- `PUT /api/providers/:id/availability` : Bascule de disponibilité (Disponible / Occupé).
- `PUT /api/providers/:id/photo` : Mise à jour de la photo de profil (base64).
- `POST /api/providers/simulate` : Simulation d'une nouvelle candidature artisan pour les démonstrations.

### 3. Demandes de Service (`/api/demandes`)
- `GET /api/demandes` : Liste des demandes publiées avec filtrage par statut, ville ou catégorie.
- `GET /api/demandes/:id` : Demande spécifique avec l'ensemble des devis reçus.
- `POST /api/demandes` : Création d'un nouveau besoin par un client (génère un identifiant unique `DEM-2026-XXX`).
- `PUT /api/demandes/:id/accept-quote` : Acceptation formelle d'un devis par le client.
- `PUT /api/demandes/:id/complete` : Clôture d'une intervention terminée avec date d'achèvement.
- `POST /api/demandes/:id/review` : Soumission de la note (1 à 5 étoiles) et commentaire avec recalcul automatique de la réputation de l'artisan.

### 4. Devis & Offres (`/api/quotes`)
- `GET /api/quotes` : Consultation des offres et devis déposés.
- `POST /api/quotes` : Dépôt d'une proposition chiffrée par un artisan avec délai d'intervention.

### 5. Statistiques & Références Publiques
- `GET /api/stats` : Statistiques globales en direct (nombre d'artisans vérifiés, interventions réalisées, taux de satisfaction 98.4%).
- `GET /api/categories` : Liste complète des 8 métiers avec compteurs en direct des prestataires actifs.
- `GET /api/cities` : Liste des villes et quartiers tchadiens couverts.
- `GET /api/health` : Contrôle de disponibilité du backend.

---

## 🛡️ Résilience & Mode Hors-Ligne Automatique

La couche client `ProxiTchad/js/api.js` intègre une détection automatique de l'état réseau :
- **En ligne (Serveur actif) :** Toutes les opérations sont persistées dans la base de données relationnelle SQLite avec signature JWT.
- **Hors-ligne (Serveur arrêté) :** Le frontend bascule de manière transparente sur le stockage LocalStorage avec données démo locales pour que l'interface reste toujours exploitable.
