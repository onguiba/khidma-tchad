# 🇹🇩 KHIDMA Tchad - Plateforme de Services au Tchad

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production-success)

## 📋 Description

**KHIDMA Tchad** est la plateforme N°1 de mise en relation entre clients et prestataires de services au Tchad. Trouvez des plombiers, électriciens, informaticiens, agents de nettoyage et artisans vérifiés près de chez vous à N'Djamena, Moundou, Sarh et Abéché.

### ✨ Fonctionnalités principales

- 🔍 **Recherche avancée** de prestataires par catégorie, ville et quartier
- 📤 **Publication de demandes** de services en temps réel
- 💬 **Contact direct** via WhatsApp avec les artisans
- 🛡️ **Vérification IA** des prestataires et validation CNI
- ⭐ **Système d'avis** et de notation clients
- 📊 **Tableau de bord** pour clients, prestataires et administrateurs
- 📱 **Design responsive** optimisé mobile et tablette

---

## 🚀 Déploiement

### **Option 1 : Hébergement Frontend uniquement (Hostinger, Netlify)**

Pour un hébergement web classique (HTML/CSS/JS), le site fonctionne en mode **LocalStorage** :

#### Fichiers à déployer :
```
ProxiTchad/
├── index.html
├── .htaccess
├── css/
├── js/
├── images/
└── pages/
```

#### Configuration Hostinger :
1. Téléchargez le contenu du dossier `ProxiTchad/` dans `public_html/`
2. Vérifiez que `.htaccess` est présent
3. Permissions : fichiers `644`, dossiers `755`

**URL de démonstration** : [Votre site Hostinger]

---

### **Option 2 : Déploiement Full-Stack (Backend + Frontend)**

Pour une expérience complète avec base de données partagée :

#### Backend (Node.js + SQLite)

**Hébergement recommandé** : Railway, Render, Vercel, Heroku

1. **Prérequis** :
   ```bash
   Node.js >= 14.x
   npm >= 6.x
   ```

2. **Installation** :
   ```bash
   cd backend
   npm install
   ```

3. **Configuration** :
   Créez un fichier `.env` :
   ```env
   PORT=3001
   JWT_SECRET=votre_secret_jwt_securise
   NODE_ENV=production
   ```

4. **Démarrage** :
   ```bash
   npm start
   # ou
   node server.js
   ```

5. **URL API** :
   Une fois déployé, mettez à jour `ProxiTchad/js/api.js` ligne 8 :
   ```javascript
   const API_BASE_URL = 'https://votre-backend.railway.app/api';
   ```

#### Frontend
1. Déployez le dossier `ProxiTchad/` sur Netlify, Vercel ou votre hébergeur
2. Le frontend se connectera automatiquement au backend

---

## 💻 Installation Locale

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/khidma-tchad.git
cd khidma-tchad
```

### 2. Lancer le Backend (optionnel)
```bash
cd backend
npm install
npm start
```
Le serveur démarre sur `http://localhost:3001`

### 3. Lancer le Frontend
Ouvrez simplement `ProxiTchad/index.html` dans votre navigateur, ou utilisez un serveur local :

**Avec Python** :
```bash
cd ProxiTchad
python -m http.server 8000
```

**Avec Node.js (live-server)** :
```bash
npm install -g live-server
cd ProxiTchad
live-server
```

Accédez à `http://localhost:8000`

---

## 📁 Structure du Projet

```
KHIDMA-TCHAD/
│
├── ProxiTchad/                 # Frontend (HTML/CSS/JS)
│   ├── index.html              # Page d'accueil
│   ├── .htaccess               # Configuration Apache
│   │
│   ├── css/                    # Styles
│   │   ├── base.css            # Styles de base
│   │   ├── components.css      # Composants UI
│   │   ├── dashboard.css       # Tableaux de bord
│   │   ├── layout.css          # Mise en page
│   │   ├── responsive.css      # Media queries
│   │   ├── styles.css          # Styles principaux
│   │   └── variables.css       # Variables CSS
│   │
│   ├── js/                     # Scripts JavaScript
│   │   ├── api.js              # Communication API/LocalStorage
│   │   ├── app.js              # Initialisation
│   │   ├── data.js             # Données de démonstration
│   │   ├── handlers.js         # Gestionnaires d'événements
│   │   ├── modals.js           # Gestion des modales
│   │   ├── search.js           # Recherche et filtres
│   │   └── state.js            # Gestion d'état
│   │
│   ├── images/                 # Images et photos
│   │
│   └── pages/                  # Pages HTML
│       ├── a-propos.html       # À propos
│       ├── admin.html          # Dashboard admin
│       ├── client.html         # Espace client
│       ├── devenir-prestataire.html
│       ├── pro.html            # Espace prestataire
│       ├── publier-demande.html
│       └── services.html       # Liste des services
│
├── backend/                    # Backend Node.js (optionnel)
│   ├── server.js               # Serveur Express
│   ├── database.js             # Configuration SQLite
│   ├── package.json            # Dépendances Node.js
│   └── khidma_tchad.db         # Base de données SQLite
│
├── .gitignore                  # Fichiers ignorés par Git
├── README.md                   # Documentation
└── DEMARRER_BACKEND.bat        # Script Windows pour démarrer le backend

```

---

## 🔐 Comptes de Démonstration

### Administrateur
- **Email** : `onguibaboutnadaniel@gmail.com`
- **Mot de passe** : `12345`

### Prestataire
- **Téléphone** : `+235 66 XX XX XX` (voir base de données)
- **Mot de passe** : `12345`

### Client
- **Téléphone** : Créez un compte depuis l'interface

---

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** / **CSS3** (avec Variables CSS)
- **JavaScript Vanilla** (ES6+)
- **LocalStorage API** (mode hors-ligne)
- **Fetch API** (communication backend)

### Backend (optionnel)
- **Node.js** / **Express.js**
- **SQLite** (base de données)
- **JWT** (authentification)
- **bcrypt.js** (hachage mots de passe)
- **CORS** (sécurité cross-origin)

---

## 📱 Catégories de Services

1. 🔧 **Plomberie** - Dépannage, fuites, tuyauterie
2. ⚡ **Électricité** - Installations, disjoncteurs, groupes
3. 💻 **Informatique** - Réseaux Wi-Fi, maintenance PC, caméras IP
4. 🗑️ **Nettoyage** - Entretien bureaux, désinfection
5. 🚚 **Transport** - Fret urbain, livraisons, déménagements
6. 🏗️ **Bâtiment** - Maçonnerie, peinture, carrelage
7. ❤️ **Santé** - Assistance médicale à domicile
8. 📚 **Éducation** - Cours particuliers, formations
9. 🎉 **Événementiel** - Organisation mariages, cérémonies
10. 🌾 **Agriculture** - Conseil agricole, outillage

---

## 🌍 Villes Couvertes

- **N'Djamena** (capitale)
- **Moundou**
- **Sarh**
- **Abéché**

---

## 🔄 Mise à Jour

Pour mettre à jour votre installation locale :

```bash
git pull origin main
cd backend
npm install  # Si dépendances modifiées
```

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Daniel Onguiba Boutna**
- Email : onguibaboutnadaniel@gmail.com
- Localisation : N'Djamena, Tchad 🇹🇩

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : onguibaboutnadaniel@gmail.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/khidma-tchad/issues)

---

## 🎯 Roadmap

- [ ] Application mobile (React Native)
- [ ] Système de paiement mobile money
- [ ] Chat en temps réel entre clients et prestataires
- [ ] Géolocalisation GPS des artisans
- [ ] Notifications push
- [ ] Support multilingue (Français, Arabe)
- [ ] Module de facturation automatique

---

**Made with ❤️ in Chad 🇹🇩**
