# Dockerfile multi-stage pour KHIDMA Tchad
# Stage 1: Backend Node.js + SQLite
FROM node:18-alpine AS backend

# Informations du mainteneur
LABEL maintainer="Daniel Onguiba Boutna <onguibaboutnadaniel@gmail.com>"
LABEL description="KHIDMA Tchad - Plateforme de services au Tchad"
LABEL version="2.0"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances backend
COPY backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code backend
COPY backend/ ./

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data

# Exposer le port backend
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001
ENV JWT_SECRET=khidma_tchad_jwt_secret_2025_production_changez_moi

# Démarrer le serveur
CMD ["node", "server.js"]
