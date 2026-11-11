# 🐳 Guide Docker - KHIDMA Tchad

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation Docker](#installation-docker)
3. [Déploiement Local](#déploiement-local)
4. [Déploiement Production](#déploiement-production)
5. [Commandes Utiles](#commandes-utiles)
6. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Installer Docker

#### Windows
1. Téléchargez [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Installez et redémarrez votre ordinateur
3. Vérifiez l'installation :
```bash
docker --version
docker-compose --version
```

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Vérifier
docker --version
docker-compose --version
```

#### macOS
1. Téléchargez [Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop/)
2. Installez et lancez Docker Desktop
3. Vérifiez :
```bash
docker --version
docker-compose --version
```

---

## 🚀 Déploiement Local

### 1. Configuration

Créez un fichier `.env` à la racine :
```bash
cp .env.example .env
```

Modifiez `.env` avec vos paramètres :
```env
PORT=3001
JWT_SECRET=votre_secret_jwt_tres_securise
NODE_ENV=production
API_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:80,http://localhost:3001
DATABASE_PATH=./khidma_tchad.db
LOG_LEVEL=info
```

### 2. Construire et Démarrer

```bash
# Construire les images Docker
docker-compose build

# Démarrer les conteneurs
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 3. Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:3001/api
- **Health Check** : http://localhost:3001/health

### 4. Tester la base de données

```bash
# Entrer dans le conteneur backend
docker-compose exec backend sh

# Tester la base de données
node test-db.js

# Sortir
exit
```

### 5. Arrêter l'application

```bash
# Arrêter les conteneurs
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

---

## 🌐 Déploiement Production

### Option 1 : VPS avec Docker (DigitalOcean, Linode, etc.)

#### Étape 1 : Connexion SSH au serveur
```bash
ssh root@votre-serveur-ip
```

#### Étape 2 : Installer Docker sur le serveur
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

#### Étape 3 : Cloner le projet
```bash
git clone https://github.com/onguiba/khidma-tchad.git
cd khidma-tchad
```

#### Étape 4 : Configuration production
```bash
# Créer le fichier .env
nano .env
```

Contenu du `.env` pour production :
```env
PORT=3001
JWT_SECRET=CHANGEZ_MOI_SECRET_TRES_LONG_ET_SECURISE_12345
NODE_ENV=production
API_URL=https://votre-domaine.com/api
CORS_ORIGIN=https://votre-domaine.com
DATABASE_PATH=./khidma_tchad.db
LOG_LEVEL=info
```

#### Étape 5 : Démarrer avec Docker
```bash
docker-compose up -d
```

#### Étape 6 : Configurer Nginx (reverse proxy)

Créez `/etc/nginx/sites-available/khidma-tchad` :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez et redémarrez :
```bash
sudo ln -s /etc/nginx/sites-available/khidma-tchad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Étape 7 : SSL avec Let's Encrypt (optionnel mais recommandé)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

### Option 2 : Railway.app (Recommandé - Facile)

#### Étape 1 : Créer un compte Railway
- Allez sur https://railway.app
- Connectez-vous avec GitHub

#### Étape 2 : Nouveau projet
- Cliquez "New Project"
- Sélectionnez "Deploy from GitHub repo"
- Choisissez `khidma-tchad`

#### Étape 3 : Railway détectera automatiquement Docker
Railway utilisera le `Dockerfile` pour construire votre application.

#### Étape 4 : Variables d'environnement
Dans les settings Railway, ajoutez :
```
PORT=3001
JWT_SECRET=votre_secret_securise
NODE_ENV=production
```

#### Étape 5 : Domaine
Railway vous donnera une URL type : `khidma-tchad-production.up.railway.app`

#### Étape 6 : Mettre à jour le frontend
Dans `ProxiTchad/js/api.js`, l'URL sera détectée automatiquement grâce à notre configuration dynamique !

---

### Option 3 : Render.com

#### Étape 1 : Créer un compte Render
- Allez sur https://render.com
- Connectez-vous avec GitHub

#### Étape 2 : Nouveau Web Service
- Cliquez "New +" → "Web Service"
- Connectez votre repo `khidma-tchad`

#### Étape 3 : Configuration
```
Name: khidma-tchad
Environment: Docker
Region: Frankfurt (proche de l'Afrique)
Branch: main
```

#### Étape 4 : Variables d'environnement
```
PORT=3001
JWT_SECRET=votre_secret
NODE_ENV=production
```

#### Étape 5 : Déployer
Render construira automatiquement votre image Docker.

---

## 📦 Commandes Docker Utiles

### Gestion des conteneurs
```bash
# Lister les conteneurs actifs
docker ps

# Lister tous les conteneurs
docker ps -a

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Arrêter tous les conteneurs
docker-compose down
```

### Gestion des images
```bash
# Lister les images
docker images

# Supprimer une image
docker rmi nom_image

# Nettoyer les images non utilisées
docker image prune -a
```

### Accéder au conteneur
```bash
# Backend
docker-compose exec backend sh
docker-compose exec backend node test-db.js

# Frontend
docker-compose exec frontend sh
```

### Base de données
```bash
# Sauvegarder la base de données
docker-compose exec backend cp khidma_tchad.db /tmp/backup.db
docker cp khidma-backend:/tmp/backup.db ./backup-$(date +%Y%m%d).db

# Restaurer la base de données
docker cp ./backup-20250101.db khidma-backend:/app/khidma_tchad.db
docker-compose restart backend
```

### Monitoring
```bash
# Statistiques des conteneurs
docker stats

# Inspecter un conteneur
docker inspect khidma-backend

# Health check
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

---

## 🔥 Mise à jour de l'application

```bash
# 1. Arrêter les conteneurs
docker-compose down

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Reconstruire les images
docker-compose build --no-cache

# 4. Redémarrer
docker-compose up -d

# 5. Vérifier les logs
docker-compose logs -f
```

---

## 🐛 Dépannage

### Le conteneur backend ne démarre pas
```bash
# Voir les logs détaillés
docker-compose logs backend

# Vérifier la base de données
docker-compose exec backend ls -la
docker-compose exec backend node test-db.js
```

### Le frontend ne se charge pas
```bash
# Vérifier Nginx
docker-compose logs frontend

# Vérifier que les fichiers sont bien montés
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### Erreur "port already in use"
```bash
# Trouver le processus utilisant le port
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Base de données corrompue
```bash
# Restaurer depuis une sauvegarde
docker cp ./backup.db khidma-backend:/app/khidma_tchad.db
docker-compose restart backend

# Ou réinitialiser (⚠️ perte de données)
docker-compose down -v
rm backend/khidma_tchad.db*
docker-compose up -d
```

### Problèmes de performance
```bash
# Voir l'utilisation des ressources
docker stats

# Augmenter les limites dans docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

---

## ✅ Checklist de Déploiement

### Avant le déploiement
- [ ] Tester en local avec Docker
- [ ] Vérifier la base de données (`node test-db.js`)
- [ ] Changer le `JWT_SECRET` en production
- [ ] Configurer les variables d'environnement
- [ ] Tester tous les endpoints API

### Après le déploiement
- [ ] Vérifier le health check : `/health` et `/api/health`
- [ ] Tester la création de compte prestataire
- [ ] Tester la publication de demande
- [ ] Vérifier l'espace admin
- [ ] Configurer le SSL (HTTPS)
- [ ] Mettre en place des sauvegardes automatiques

---

## 📞 Support

Besoin d'aide ?
- 📧 Email : onguibaboutnadaniel@gmail.com
- 🐙 GitHub Issues : https://github.com/onguiba/khidma-tchad/issues

---

## ⚠️ Note importante sur Hostinger

**Hostinger ne supporte PAS Docker** sur l'hébergement web standard.

Pour Hostinger, deux options :

### Option A : Frontend uniquement (actuel)
- Déployez uniquement `ProxiTchad/` sur Hostinger
- Le site fonctionne en mode LocalStorage
- Pas de partage de données entre utilisateurs

### Option B : Backend séparé
- Frontend sur Hostinger
- Backend sur Railway/Render (Docker)
- Modifiez l'URL API dans `api.js`

**Recommandation** : Utilisez Railway ou Render pour le déploiement complet avec Docker.

---

**Made with ❤️ and 🐳 Docker**
