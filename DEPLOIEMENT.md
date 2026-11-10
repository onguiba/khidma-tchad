# 🚀 Guide de Déploiement - KHIDMA Tchad

## 📌 Options de Déploiement

### **Option 1 : Hostinger (Frontend uniquement) - RECOMMANDÉ POUR DÉMARRER**

✅ **Avantages** : Rapide, facile, pas de serveur à gérer
⚠️ **Limitations** : Données stockées localement dans le navigateur

#### Étapes :

1. **Préparer les fichiers**
   - Copiez **tout le contenu** du dossier `ProxiTchad/`
   - Vous devez avoir : `index.html`, `.htaccess`, `css/`, `js/`, `images/`, `pages/`

2. **Connexion à Hostinger**
   - Allez sur https://hpanel.hostinger.com
   - Cliquez sur "File Manager"
   - Accédez au dossier `public_html/`

3. **Upload**
   - Supprimez les fichiers par défaut dans `public_html/`
   - Téléchargez tous les fichiers du dossier `ProxiTchad/`
   - ⚠️ Vérifiez que `.htaccess` est bien présent (fichier caché)

4. **Vérifier**
   - Allez sur votre nom de domaine : `https://votre-site.com`
   - Vous devriez voir la page d'accueil KHIDMA Tchad

5. **En cas de problème "Not Found"**
   ```
   Vérifiez :
   - Le fichier index.html existe bien à la racine
   - Le fichier .htaccess est présent
   - Les permissions : fichiers 644, dossiers 755
   ```

---

### **Option 2 : Netlify (Frontend uniquement) - ULTRA RAPIDE**

✅ **Avantages** : Déploiement en 1 clic depuis GitHub, HTTPS gratuit
⚠️ **Limitations** : Données stockées localement dans le navigateur

#### Étapes :

1. **Créer un compte Netlify**
   - Allez sur https://netlify.com
   - Connectez-vous avec GitHub

2. **Nouveau site**
   - Cliquez "Add new site" → "Import an existing project"
   - Sélectionnez votre repo GitHub `khidma-tchad`

3. **Configuration de build**
   ```
   Build command: (laisser vide)
   Publish directory: ProxiTchad
   ```

4. **Déployer**
   - Cliquez "Deploy site"
   - Votre site sera en ligne en 2 minutes sur une URL type : `https://khidma-tchad.netlify.app`

5. **Domaine personnalisé (optionnel)**
   - Dans les paramètres Netlify → Domain management
   - Ajoutez votre propre domaine

---

### **Option 3 : Full-Stack (Backend + Frontend) - PRODUCTION COMPLÈTE**

✅ **Avantages** : Base de données partagée, données synchronisées entre utilisateurs
💰 **Coût** : Gratuit avec Railway/Render (limites), ou payant

---

## 🔧 Backend sur Railway.app

#### 1. Préparer le Backend

Créez un fichier `backend/package.json` avec :
```json
{
  "name": "khidma-tchad-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "better-sqlite3": "^9.2.2"
  }
}
```

#### 2. Créer un compte Railway

- Allez sur https://railway.app
- Connectez-vous avec GitHub

#### 3. Nouveau projet

- Cliquez "New Project" → "Deploy from GitHub repo"
- Sélectionnez `khidma-tchad`

#### 4. Configuration

Dans les settings Railway :
```
Root Directory: backend
Start Command: npm start
```

Variables d'environnement :
```
PORT=3001
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
NODE_ENV=production
```

#### 5. Déployer

- Railway va automatiquement détecter Node.js
- Votre API sera disponible sur : `https://khidma-tchad-production.up.railway.app`

#### 6. Connecter le Frontend au Backend

Dans `ProxiTchad/js/api.js`, modifiez la ligne 7 :
```javascript
const API_BASE_URL = 'https://khidma-tchad-production.up.railway.app/api';
```

Puis redéployez le frontend sur Netlify/Hostinger.

---

## 🔧 Backend sur Render.com (Alternative)

#### 1. Créer un compte Render
- Allez sur https://render.com
- Connectez-vous avec GitHub

#### 2. Nouveau Web Service
- Cliquez "New +" → "Web Service"
- Connectez votre repo `khidma-tchad`

#### 3. Configuration
```
Name: khidma-tchad-backend
Environment: Node
Region: Frankfurt (le plus proche de l'Afrique)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

#### 4. Variables d'environnement
```
PORT=3001
JWT_SECRET=votre_secret_securise
NODE_ENV=production
```

#### 5. Plan gratuit
- Sélectionnez "Free" (mais le service s'endort après 15 min d'inactivité)
- Ou "Starter" ($7/mois) pour un service 24/7

---

## 📊 Comparaison des Options

| Plateforme | Coût | Backend | Base de données | SSL | Complexité |
|------------|------|---------|-----------------|-----|------------|
| **Hostinger** | €2-5/mois | ❌ | ❌ LocalStorage | ✅ | ⭐ Facile |
| **Netlify** | Gratuit | ❌ | ❌ LocalStorage | ✅ | ⭐ Très facile |
| **Railway** | Gratuit* | ✅ | ✅ SQLite | ✅ | ⭐⭐ Moyen |
| **Render** | Gratuit* | ✅ | ✅ SQLite | ✅ | ⭐⭐ Moyen |
| **Vercel** | Gratuit | ✅ | ⚠️ Serverless | ✅ | ⭐⭐⭐ Avancé |

*Limites sur plan gratuit : Railway ($5 crédit/mois), Render (service s'endort)

---

## ✅ Checklist de Déploiement

### Avant de déployer :
- [ ] Tester le site en local
- [ ] Vérifier tous les liens et images
- [ ] Valider le formulaire de contact
- [ ] Tester sur mobile et desktop
- [ ] Vérifier la base de données (si backend)

### Après le déploiement :
- [ ] Tester toutes les pages
- [ ] Vérifier l'inscription prestataire
- [ ] Tester la publication de demande
- [ ] Vérifier l'espace admin
- [ ] Tester sur différents navigateurs (Chrome, Safari, Firefox)
- [ ] Vérifier la vitesse de chargement

---

## 🆘 Problèmes Courants

### "Not Found" sur Hostinger
**Solution** : Vérifiez que `index.html` et `.htaccess` sont à la racine de `public_html/`

### Images ne s'affichent pas
**Solution** : Vérifiez les chemins relatifs et les permissions (644)

### Backend ne répond pas
**Solution** : 
- Vérifiez les logs sur Railway/Render
- Testez l'URL directement : `https://votre-backend.com/api/health`

### Erreur CORS
**Solution** : Dans `backend/server.js`, vérifiez que votre domaine frontend est dans la liste `cors.origin`

---

## 📞 Support

Besoin d'aide ? Contactez :
- 📧 Email : onguibaboutnadaniel@gmail.com
- 🐛 GitHub Issues : https://github.com/votre-username/khidma-tchad/issues

---

**Bonne chance avec votre déploiement ! 🚀🇹🇩**
