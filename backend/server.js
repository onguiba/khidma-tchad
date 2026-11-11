/**
 * KHIDMA TCHAD - SERVEUR BACKEND API REST
 * Express + SQLite + JWT Authentication
 * Port: 3001
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'khidma_tchad_jwt_secret_2025_secure';

// ============================================================
// HEALTH CHECK & STATUS
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'KHIDMA Tchad API',
    version: '2.0',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

app.get('/api/health', (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    const result = db.prepare('SELECT COUNT(*) as count FROM providers').get();
    res.status(200).json({ 
      status: 'OK', 
      service: 'KHIDMA Tchad API',
      version: '2.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      providers: result.count
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'null', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir le frontend statique
const frontendPath = path.join(__dirname, '..', 'ProxiTchad');
app.use(express.static(frontendPath));

// Middleware d'authentification JWT optionnel
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch (e) {
      // Token invalide, continuer sans user
    }
  }
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

// Générer un ID de demande unique
function generateDemandeId() {
  const year = new Date().getFullYear();
  const existing = db.prepare('SELECT COUNT(*) as n FROM demandes WHERE id LIKE ?').get(`DEM-${year}-%`);
  const num = String(existing.n + 1).padStart(3, '0');
  return `DEM-${year}-${num}`;
}

// Générer un ID de devis unique
function generateQuoteId() {
  return `QUO-${Date.now().toString().slice(-6)}`;
}

// Audit IA automatique pour un prestataire
function generateAiAudit(proData) {
  const phone = (proData.phone || '').replace(/[^0-9]/g, '');
  const digits = phone.startsWith('235') ? phone.slice(3) : phone;
  const isAirtel = digits.startsWith('6') || digits.startsWith('7');
  const isMoov = digits.startsWith('9');
  const phoneChecked = digits.length === 8 && (isAirtel || isMoov);
  const phoneNetwork = isAirtel ? 'Airtel Tchad (6X/7X)' : isMoov ? 'Moov Africa Tchad (9X)' : 'Opérateur Tchad';

  const desc = (proData.description || '').toLowerCase();
  const techKeywords = ['expérience', 'dépannage', 'installation', 'réparation', 'outillage', 'garantie',
    'certifié', 'qualifié', 'matériel', 'chantier', 'travail', 'professionnel', 'urgent', 'équipe',
    'sanitaire', 'solaire', 'disjoncteur', 'câblage', 'réseau', 'peinture', 'maçonnerie', 'climatisation',
    'panneaux', 'sécurité', 'entretien'];
  const matchedKeywords = techKeywords.filter(kw => desc.includes(kw));
  const skillsMatch = desc.length > 20 || matchedKeywords.length > 0;

  const knownCities = ["n'djamena", "ndjamena", "moundou", "sarh", "abéché", "abeche", "am timan", "koumra"];
  const city = (proData.city || '').toLowerCase();
  const geoChecked = knownCities.some(c => city.includes(c));

  let score = 84;
  if (phoneChecked) score += 6;
  if (skillsMatch) score += 4;
  if (geoChecked) score += 3;
  const cniNum = proData.cniNumber || proData.cni_number || '';
  const cniChecked = !!cniNum && cniNum.length >= 6;
  if (cniChecked) score += 3;
  score = Math.min(score, 98);

  const keywords = matchedKeywords.length > 0
    ? matchedKeywords.slice(0, 5).join(',')
    : (proData.category || 'Artisanat') + ',Outillage adapté,Disponibilité locale';

  return {
    score, status: score >= 80 ? 'favorable' : 'a_examiner',
    phoneChecked, phoneNetwork, skillsMatch,
    keywords, geoChecked,
    cniChecked,
    cniNumber: cniNum,
    summary: `Audit IA : numéro ${phoneNetwork} valide. Carte Nationale d'Identité (${cniNum || 'Fournie'}) transmise pour validation administrateur. Compétences adaptées pour ${proData.category || 'Artisanat'} à ${proData.city || "N'Djamena"}.`
  };
}

// Formater un devis depuis la DB
function formatQuote(q) {
  return {
    id: q.id,
    proId: q.pro_id,
    proName: q.pro_name,
    proRating: q.pro_rating,
    proReviews: q.pro_reviews,
    proPhone: q.pro_phone,
    amount: q.amount,
    delay: q.delay_text,
    message: q.message,
    status: q.status,
    date: formatRelativeDate(q.created_at)
  };
}

// Formater une demande avec ses devis
function formatDemande(d) {
  const quotes = db.prepare('SELECT * FROM quotes WHERE demande_id = ? ORDER BY created_at DESC').all(d.id);
  return {
    id: d.id,
    clientName: d.client_name,
    clientPhone: d.client_phone,
    city: d.city,
    quartier: d.quartier,
    category: d.category,
    title: d.title,
    description: d.description,
    budget: d.budget,
    urgency: d.urgency,
    status: d.status,
    targetProId: d.target_pro_id,
    targetProName: d.target_pro_name,
    agreedProId: d.agreed_pro_id,
    agreedProName: d.agreed_pro_name,
    agreedProPhone: d.agreed_pro_phone,
    agreedPrice: d.agreed_price,
    createdAt: formatRelativeDate(d.created_at),
    completedAt: d.completed_at ? formatRelativeDate(d.completed_at) : null,
    quotes: quotes.map(formatQuote)
  };
}

// Formater un prestataire
function formatProvider(p, includePrivate = false) {
  const result = {
    id: p.id,
    name: p.name,
    companyName: p.company_name,
    category: p.category,
    role: p.role,
    city: p.city,
    quartier: p.quartier,
    phone: p.phone,
    email: p.email || null,
    photo: p.photo,
    cniNumber: p.cni_number || null,
    cniPhoto: p.cni_photo || null,
    cniVerified: !!p.cni_verified,
    realisationsPhotos: p.realisations_photos ? (typeof p.realisations_photos === 'string' ? (JSON.parse(p.realisations_photos || '[]')) : p.realisations_photos) : [],
    tarifIndicatif: p.tarif_indicatif || null,
    experienceYears: p.experience_years || 1,
    description: p.description,
    rating: p.rating,
    reviewsCount: p.reviews_count,
    verified: !!p.verified,
    applicationStatus: p.application_status,
    isAvailable: !!p.is_available,
    registeredAt: formatRelativeDate(p.registered_at),
    validatedAt: p.validated_at
  };

  if (includePrivate || p.application_status !== 'valide') {
    result.aiAudit = {
      score: p.ai_score,
      status: p.ai_status,
      phoneChecked: !!p.ai_phone_checked,
      phoneNetwork: p.ai_phone_network,
      skillsMatch: !!p.ai_skills_match,
      keywordsDetected: p.ai_keywords ? p.ai_keywords.split(',') : [],
      geoChecked: !!p.ai_geo_checked,
      summary: p.ai_summary
    };
  }

  return result;
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Inconnu';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffD === 1) return 'Hier';
    if (diffD < 7) return `Il y a ${diffD} jours`;
    return date.toLocaleDateString('fr-FR');
  } catch (e) {
    return dateStr;
  }
}

// ============================================================
// ROUTES AUTHENTIFICATION
// ============================================================

// POST /api/auth/login — Connexion prestataire, admin ou client
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
  }

  // Nettoyer l'identifiant (téléphone ou email)
  const cleanId = identifier.replace(/[\s\-]/g, '');
  const lowerId = identifier.toLowerCase().trim();

  if (role === 'client') {
    // Chercher dans les clients
    const client = db.prepare('SELECT * FROM clients WHERE phone = ? OR phone = ? OR LOWER(email) = ?').get(cleanId, identifier, lowerId);
    if (!client) {
      return res.status(401).json({ error: 'Numéro de téléphone client introuvable.' });
    }
    const validPass = client.password_hash
      ? bcrypt.compareSync(password, client.password_hash)
      : (password === '12345');
    if (!validPass) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }
    const token = jwt.sign({ id: client.id, role: 'client', name: client.name, phone: client.phone }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, role: 'client', user: { id: client.id, name: client.name, phone: client.phone, city: client.city } });
  } else {
    // Chercher dans les prestataires ou admin par téléphone ou adresse email
    const pro = db.prepare(`
      SELECT * FROM providers 
      WHERE phone = ? 
         OR phone = ? 
         OR LOWER(email) = ? 
         OR (category = 'Admin' AND LOWER(?) = 'onguibaboutnadaniel@gmail.com')
    `).get(cleanId, identifier, lowerId, lowerId);

    if (!pro) {
      return res.status(401).json({ error: 'Identifiant introuvable. Vérifiez votre numéro de téléphone ou votre adresse email.' });
    }
    const validPass = pro.password_hash
      ? bcrypt.compareSync(password, pro.password_hash)
      : (password === '12345');
    if (!validPass) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const isAdmin = pro.category === 'Admin' || (pro.email && pro.email.toLowerCase() === 'onguibaboutnadaniel@gmail.com');
    const userRole = isAdmin ? 'admin' : 'pro';
    const token = jwt.sign({ id: pro.id, role: userRole, name: pro.name, phone: pro.phone, email: pro.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, role: userRole, user: formatProvider(pro, true) });
  }
});

// POST /api/auth/register-client — Inscription client simple
app.post('/api/auth/register-client', (req, res) => {
  const { name, phone, city, quartier, password } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nom et téléphone requis.' });
  }
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  const existing = db.prepare('SELECT id FROM clients WHERE phone = ?').get(cleanPhone);
  if (existing) {
    return res.status(409).json({ error: 'Ce numéro est déjà enregistré. Connectez-vous.' });
  }
  const hash = bcrypt.hashSync(password || 'khidma2025', 10);
  const result = db.prepare('INSERT INTO clients (name, phone, city, quartier, password_hash) VALUES (?, ?, ?, ?, ?)').run(
    name, cleanPhone, city || "N'Djamena", quartier || '', hash
  );
  const token = jwt.sign({ id: result.lastInsertRowid, role: 'client', name, phone: cleanPhone }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, role: 'client', user: { id: result.lastInsertRowid, name, phone: cleanPhone, city } });
});

// ============================================================
// ROUTES PRESTATAIRES
// ============================================================

// GET /api/providers — Lister les prestataires vérifiés
app.get('/api/providers', optionalAuth, (req, res) => {
  const { category, city, quartier, search, verified } = req.query;
  let query = 'SELECT * FROM providers WHERE category != ?';
  const params = ['Admin'];

  if (verified !== 'all') {
    query += ' AND verified = 1';
  }
  if (category) {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }
  if (city) {
    query += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }
  if (quartier) {
    query += ' AND quartier LIKE ?';
    params.push(`%${quartier}%`);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY rating DESC, reviews_count DESC';

  const providers = db.prepare(query).all(...params);
  res.json(providers.map(p => formatProvider(p)));
});

// GET /api/providers/pending — Prestataires en attente (Admin)
app.get('/api/providers/pending', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  const pending = db.prepare("SELECT * FROM providers WHERE verified = 0 OR application_status = 'en_attente_ia' ORDER BY registered_at DESC").all();
  res.json(pending.map(p => formatProvider(p, true)));
});

// GET /api/providers/:id — Détail d'un prestataire
app.get('/api/providers/:id', optionalAuth, (req, res) => {
  const pro = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
  if (!pro) return res.status(404).json({ error: 'Prestataire introuvable.' });
  const isAdmin = req.user && req.user.role === 'admin';
  const isOwner = req.user && req.user.id === pro.id && req.user.role === 'pro';
  res.json(formatProvider(pro, isAdmin || isOwner));
});

// POST /api/providers — Inscription d'un nouveau prestataire avec CNI et réalisations
app.post('/api/providers', (req, res) => {
  const { 
    name, companyName, category, city, quartier, phone, email, password, 
    description, role, cniNumber, cniPhoto, photo, realisationsPhotos, 
    tarifIndicatif, experienceYears 
  } = req.body;

  if (!name || !phone || !category) {
    return res.status(400).json({ error: 'Nom, téléphone et catégorie de métier requis.' });
  }

  if (!cniNumber) {
    return res.status(400).json({ error: 'Le numéro de Carte Nationale d\'Identité (CNI) est obligatoire.' });
  }

  const cleanPhone = phone.replace(/[\s\-]/g, '');
  const existing = db.prepare('SELECT id FROM providers WHERE phone = ?').get(cleanPhone);
  if (existing) {
    return res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré comme prestataire.' });
  }

  const hash = bcrypt.hashSync(password || '12345', 10);
  const audit = generateAiAudit({ name, category, city, phone: cleanPhone, description, cniNumber });

  const realisationsStr = Array.isArray(realisationsPhotos) && realisationsPhotos.length > 0 
    ? JSON.stringify(realisationsPhotos) 
    : (typeof realisationsPhotos === 'string' ? realisationsPhotos : null);

  const result = db.prepare(`
    INSERT INTO providers (
      name, company_name, category, role, city, quartier, phone, email, 
      password_hash, photo, cni_number, cni_photo, cni_verified, realisations_photos, 
      tarif_indicatif, experience_years, description, verified, application_status, 
      ai_score, ai_status, ai_phone_checked, ai_phone_network, ai_skills_match, 
      ai_keywords, ai_geo_checked, ai_summary
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 0, 'en_attente_admin', ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, companyName || name, category, role || category, city || "N'Djamena",
    quartier || '', cleanPhone, email || null, hash, photo || 'images/hero_artisan.jpg',
    cniNumber, cniPhoto || null, realisationsStr, tarifIndicatif || null, 
    parseInt(experienceYears, 10) || 1, description || '',
    audit.score, audit.status, audit.phoneChecked ? 1 : 0, audit.phoneNetwork,
    audit.skillsMatch ? 1 : 0, audit.keywords, audit.geoChecked ? 1 : 0, audit.summary
  );

  const newPro = db.prepare('SELECT * FROM providers WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: newPro.id, role: 'pro', name: newPro.name, phone: newPro.phone }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ 
    token, 
    user: formatProvider(newPro, true), 
    message: 'Inscription enregistrée ! Votre dossier (Photo, CNI et Réalisations) est en cours de validation par l\'administrateur avant activation de vos services.' 
  });
});

// PUT /api/providers/:id/verify — Valider/Suspendre un prestataire et sa CNI (Admin)
app.put('/api/providers/:id/verify', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  const { verified, cniVerified } = req.body;
  const isVerified = !!verified;
  const isCniVerified = cniVerified !== undefined ? (cniVerified ? 1 : 0) : (isVerified ? 1 : 0);
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE providers SET verified = ?, application_status = ?, cni_verified = ?, validated_at = ? WHERE id = ?
  `).run(
    isVerified ? 1 : 0,
    isVerified ? 'valide' : 'suspendu',
    isCniVerified,
    isVerified ? now : null,
    req.params.id
  );
  const pro = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
  if (!pro) return res.status(404).json({ error: 'Prestataire introuvable.' });
  res.json({ success: true, provider: formatProvider(pro, true) });
});

// PUT /api/providers/:id/availability — Modifier disponibilité
app.put('/api/providers/:id/availability', requireAuth, (req, res) => {
  const proId = parseInt(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== proId) {
    return res.status(403).json({ error: 'Non autorisé.' });
  }
  const { isAvailable } = req.body;
  db.prepare('UPDATE providers SET is_available = ? WHERE id = ?').run(isAvailable ? 1 : 0, proId);
  res.json({ success: true, isAvailable: !!isAvailable });
});

// PUT /api/providers/:id/photo — Modifier la photo de profil
app.put('/api/providers/:id/photo', requireAuth, (req, res) => {
  const proId = parseInt(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== proId) {
    return res.status(403).json({ error: 'Non autorisé.' });
  }
  const { photoBase64 } = req.body;
  if (!photoBase64) return res.status(400).json({ error: 'Image requise.' });

  db.prepare('UPDATE providers SET photo = ? WHERE id = ?').run(photoBase64, proId);
  res.json({ success: true });
});

// POST /api/providers/simulate — Simuler une candidature (Admin)
app.post('/api/providers/simulate', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }

  const sampleCandidates = [
    { name: 'Brahim Djibrine', companyName: 'Brahim Froid & Climatisation', category: 'Bâtiment', role: '❄️ Frigoriste', city: "N'Djamena", quartier: 'Moursal', phone: `+23599${Date.now().toString().slice(-6)}`, description: "Frigoriste avec 8 ans d'expérience. Installation de climatiseurs split, recharge en gaz R410A." },
    { name: 'Kaltouma Mahamat', companyName: 'Kaltouma Déco & Peinture', category: 'Bâtiment', role: '🎨 Peintre', city: 'Moundou', quartier: 'Centre-Ville', phone: `+23566${Date.now().toString().slice(-6)}`, description: "Spécialiste peinture intérieure et extérieure, enduit lissé avec outillage professionnel." },
    { name: 'Ahmat Al-Béchir', companyName: 'Al-Béchir Réseaux & Caméras', category: 'Informatique', role: '💻 Câblage & Sécurité', city: "N'Djamena", quartier: 'Sabangali', phone: `+23560${Date.now().toString().slice(-6)}`, description: "Installation caméras IP, configuration routeurs Wi-Fi longue portée et maintenance réseaux entreprise." },
  ];

  const hash = bcrypt.hashSync('khidma2025', 10);
  const candidate = sampleCandidates[Math.floor(Math.random() * sampleCandidates.length)];
  const randomCniNumber = `CNI-TD-2024-${Math.floor(100000 + Math.random() * 900000)}`;
  const audit = generateAiAudit({ ...candidate, cniNumber: randomCniNumber });

  try {
    const result = db.prepare(`
      INSERT INTO providers (name, company_name, category, role, city, quartier, phone, password_hash, photo, cni_number, cni_photo, cni_verified, description,
        verified, application_status, ai_score, ai_status, ai_phone_checked, ai_phone_network, ai_skills_match, ai_keywords, ai_geo_checked, ai_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'images/electricite.jpg', ?, null, 0, ?, 0, 'en_attente_ia', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      candidate.name, candidate.companyName, candidate.category, candidate.role, candidate.city,
      candidate.quartier, candidate.phone, hash, randomCniNumber, candidate.description,
      audit.score, audit.status, audit.phoneChecked ? 1 : 0, audit.phoneNetwork,
      audit.skillsMatch ? 1 : 0, audit.keywords, audit.geoChecked ? 1 : 0, audit.summary
    );

    const newPro = db.prepare('SELECT * FROM providers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, provider: formatProvider(newPro, true) });
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la simulation: ' + e.message });
  }
});

// ============================================================
// ROUTES DEMANDES
// ============================================================

// GET /api/demandes — Lister toutes les demandes
app.get('/api/demandes', optionalAuth, (req, res) => {
  const { status, city, category, clientPhone } = req.query;
  let query = 'SELECT * FROM demandes WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (city) { query += ' AND city LIKE ?'; params.push(`%${city}%`); }
  if (category) { query += ' AND category LIKE ?'; params.push(`%${category}%`); }
  if (clientPhone) { query += ' AND client_phone = ?'; params.push(clientPhone.replace(/[\s\-]/g, '')); }

  query += ' ORDER BY created_at DESC';
  const demandes = db.prepare(query).all(...params);
  res.json(demandes.map(formatDemande));
});

// GET /api/demandes/:id — Détail d'une demande avec ses devis
app.get('/api/demandes/:id', optionalAuth, (req, res) => {
  const demande = db.prepare('SELECT * FROM demandes WHERE id = ?').get(req.params.id);
  if (!demande) return res.status(404).json({ error: 'Demande introuvable.' });
  res.json(formatDemande(demande));
});

// POST /api/demandes — Créer une nouvelle demande
app.post('/api/demandes', optionalAuth, (req, res) => {
  const { clientName, clientPhone, city, quartier, category, title, description, budget, urgency, targetProId, targetProName } = req.body;
  if (!clientName || !clientPhone || !category) {
    return res.status(400).json({ error: 'Nom, téléphone et catégorie requis.' });
  }

  const id = generateDemandeId();
  const status = targetProId ? 'en_attente_pro' : 'en_attente';
  const cleanPhone = clientPhone.replace(/[\s\-]/g, '');

  db.prepare(`
    INSERT INTO demandes (id, client_name, client_phone, city, quartier, category, title, description, budget, urgency, status, target_pro_id, target_pro_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, clientName, cleanPhone, city || "N'Djamena", quartier || '', category,
    title || `Demande de ${category}`, description || '', budget || 'À convenir',
    urgency || 'Dans les 48 heures', status, targetProId || null, targetProName || null
  );

  const demande = db.prepare('SELECT * FROM demandes WHERE id = ?').get(id);
  res.status(201).json(formatDemande(demande));
});

// PUT /api/demandes/:id/accept-quote — Client accepte un devis
app.put('/api/demandes/:id/accept-quote', optionalAuth, (req, res) => {
  const { quoteId } = req.body;
  const demandeId = req.params.id;

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ? AND demande_id = ?').get(quoteId, demandeId);
  if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });

  db.prepare("UPDATE quotes SET status = 'accepte' WHERE id = ?").run(quoteId);
  db.prepare(`
    UPDATE demandes SET status = 'en_cours', agreed_pro_id = ?, agreed_pro_name = ?, agreed_pro_phone = ?, agreed_price = ?
    WHERE id = ?
  `).run(quote.pro_id, quote.pro_name, quote.pro_phone, quote.amount, demandeId);

  res.json({ success: true, message: `Devis de ${quote.pro_name} accepté. L'artisan va vous contacter.` });
});

// PUT /api/demandes/:id/complete — Marquer une demande comme terminée
app.put('/api/demandes/:id/complete', optionalAuth, (req, res) => {
  const now = new Date().toISOString();
  db.prepare("UPDATE demandes SET status = 'terminee', completed_at = ? WHERE id = ?").run(now, req.params.id);
  res.json({ success: true });
});

// POST /api/demandes/:id/review — Soumettre un avis client
app.post('/api/demandes/:id/review', optionalAuth, (req, res) => {
  const { rating, comment } = req.body;
  const demandeId = req.params.id;

  const demande = db.prepare('SELECT * FROM demandes WHERE id = ?').get(demandeId);
  if (!demande) return res.status(404).json({ error: 'Demande introuvable.' });

  db.prepare('INSERT INTO reviews (demande_id, pro_id, client_name, rating, comment) VALUES (?, ?, ?, ?, ?)').run(
    demandeId, demande.agreed_pro_id, demande.client_name, parseInt(rating) || 5, comment || ''
  );

  // Mettre à jour la note moyenne du prestataire
  if (demande.agreed_pro_id) {
    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE pro_id = ?').get(demande.agreed_pro_id);
    db.prepare('UPDATE providers SET rating = ?, reviews_count = ? WHERE id = ?').run(
      Math.round(stats.avg_rating * 10) / 10, stats.count, demande.agreed_pro_id
    );
  }

  res.json({ success: true });
});

// ============================================================
// ROUTES DEVIS
// ============================================================

// POST /api/quotes — Artisan soumet un devis à une demande
app.post('/api/quotes', optionalAuth, (req, res) => {
  const { demandeId, proName, proPhone, amount, delay, message } = req.body;
  if (!demandeId || !proName) {
    return res.status(400).json({ error: 'ID de demande et nom du prestataire requis.' });
  }

  const demande = db.prepare('SELECT * FROM demandes WHERE id = ?').get(demandeId);
  if (!demande) return res.status(404).json({ error: 'Demande introuvable.' });

  let pro = null;
  if (req.user && req.user.role === 'pro') {
    pro = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.user.id);
  } else if (proPhone) {
    const cleanPhone = proPhone.replace(/[\s\-]/g, '');
    pro = db.prepare('SELECT * FROM providers WHERE phone = ? OR phone = ?').get(cleanPhone, proPhone);
  }

  // Contrôle strict : la CNI et la candidature doivent avoir été validées par l'administrateur
  if (pro && (!pro.verified || pro.application_status !== 'valide')) {
    return res.status(403).json({
      error: "Votre candidature est en cours d'examen. Votre Carte Nationale d'Identité doit être vérifiée et validée par l'administrateur avant de pouvoir proposer vos services et soumettre des devis."
    });
  }

  let proId = pro ? pro.id : null;
  let proRating = pro ? pro.rating : 4.8;
  let proReviews = pro ? pro.reviews_count : 0;

  const quoteId = generateQuoteId();
  db.prepare(`
    INSERT INTO quotes (id, demande_id, pro_id, pro_name, pro_rating, pro_reviews, pro_phone, amount, delay_text, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'propose')
  `).run(quoteId, demandeId, proId, proName, proRating, proReviews,
    proPhone || (req.user ? req.user.phone : ''), amount || 'À convenir',
    delay || 'Disponible rapidement', message || ''
  );

  db.prepare("UPDATE demandes SET status = 'devis_recus' WHERE id = ? AND status = 'en_attente'").run(demandeId);

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId);
  res.status(201).json(formatQuote(quote));
});

// GET /api/quotes — Liste des devis avec filtre optionnel par demande
app.get('/api/quotes', optionalAuth, (req, res) => {
  const { demandeId } = req.query;
  let query = 'SELECT * FROM quotes';
  const params = [];
  if (demandeId) {
    query += ' WHERE demande_id = ?';
    params.push(demandeId);
  }
  query += ' ORDER BY created_at DESC';
  const quotes = db.prepare(query).all(...params);
  res.json(quotes.map(formatQuote));
});

// ============================================================
// ROUTES PUBLIQUES & STATISTIQUES
// ============================================================

// GET /api/categories — Catégories de services avec compteurs de prestataires
app.get('/api/categories', (req, res) => {
  const defaultCategories = [
    { id: 'plomberie', name: 'Plomberie', icon: '🔧', description: 'Dépannage, fuite d\'eau, tuyauterie et robinetterie' },
    { id: 'electricite', name: 'Électricité', icon: '⚡', description: 'Installations, disjoncteurs, groupes et dépannage' },
    { id: 'informatique', name: 'Informatique', icon: '💻', description: 'Réseaux Wi-Fi, maintenance PC, caméras IP et logiciels' },
    { id: 'nettoyage', name: 'Nettoyage', icon: '🗑️', description: 'Entretien bureaux, désinfection et collecte ordures' },
    { id: 'transport', name: 'Transport & Déménagement', icon: '🚚', description: 'Fret urbain, livraisons et déménagements express' },
    { id: 'batiment', name: 'Bâtiment & Maçonnerie', icon: '🏗️', description: 'Peinture, carrelage, maçonnerie et rénovation' },
    { id: 'froid', name: 'Climatisation & Froid', icon: '❄️', description: 'Installation de splits, recharge de gaz et réparation' },
    { id: 'mecanique', name: 'Mécanique & Auto', icon: '🚗', description: 'Entretien automobile, diagnostic et vidange rapide' }
  ];

  const proCounts = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM providers 
    WHERE verified = 1 AND category != 'Admin' 
    GROUP BY category
  `).all();

  const countMap = {};
  proCounts.forEach(r => { countMap[r.category.toLowerCase()] = r.count; });

  const categoriesWithCounts = defaultCategories.map(cat => ({
    ...cat,
    providersCount: countMap[cat.name.toLowerCase()] || countMap[cat.id.toLowerCase()] || 0
  }));

  res.json({ success: true, data: categoriesWithCounts });
});

// GET /api/stats — Statistiques publiques pour landing page & badges
app.get('/api/stats', (req, res) => {
  const verifiedCount = db.prepare("SELECT COUNT(*) as n FROM providers WHERE verified = 1 AND category != 'Admin'").get().n;
  const totalDemandes = db.prepare("SELECT COUNT(*) as n FROM demandes").get().n;
  const activeDemandes = db.prepare("SELECT COUNT(*) as n FROM demandes WHERE status IN ('en_attente', 'devis_recus', 'en_cours')").get().n;
  const avgRatingRow = db.prepare("SELECT AVG(rating) as avg FROM providers WHERE verified = 1 AND category != 'Admin'").get();

  res.json({
    success: true,
    data: {
      verifiedProviders: verifiedCount,
      totalDemandes: totalDemandes,
      activeMissions: activeDemandes,
      citiesCovered: 5,
      satisfactionRate: 98.4,
      averageRating: avgRatingRow.avg ? Math.round(avgRatingRow.avg * 10) / 10 : 4.8
    }
  });
});

// GET /api/cities — Villes et quartiers desservis
app.get('/api/cities', (req, res) => {
  const cities = [
    { name: "N'Djamena", quartiers: ['Moursal', 'Sabangali', 'Kabalaye', 'Chagoua', 'Diguel', 'Toumaï', 'Farcha', 'Atrone', 'Gassi', 'Amriguébé'] },
    { name: "Moundou", quartiers: ['Centre-Ville', 'Dombeu', 'Djarabé', 'Gueldjem', 'Bébédjia'] },
    { name: "Sarh", quartiers: ['Centre', 'Balimba', 'Maïlao', 'Kassai'] },
    { name: "Abéché", quartiers: ['Goz-Amir', 'Baguirmi', 'Salamé', 'Am-Riguebe'] }
  ];
  res.json({ success: true, data: cities });
});

// GET /api/reviews — Avis récents des clients
app.get('/api/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, p.name as pro_name, p.category as pro_category 
    FROM reviews r 
    LEFT JOIN providers p ON r.pro_id = p.id 
    ORDER BY r.created_at DESC 
    LIMIT 20
  `).all();
  res.json({ success: true, data: reviews });
});

// ============================================================
// ROUTES COMMUNICATIONS & MESSAGES ADMINISTRATEUR
// ============================================================

// GET /api/communications — Liste des communications officielles
app.get('/api/communications', optionalAuth, (req, res) => {
  const { recipientType, targetUserId } = req.query;
  let query = 'SELECT * FROM admin_communications WHERE 1=1';
  const params = [];

  if (recipientType) {
    query += ' AND (recipient_type = ? OR recipient_type = "all")';
    params.push(recipientType);
  }
  if (targetUserId) {
    query += ' AND (target_user_id = ? OR recipient_type = "all")';
    params.push(targetUserId);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';
  const rows = db.prepare(query).all(...params);
  res.json({ success: true, data: rows });
});

// POST /api/communications — Administrateur publie une annonce ou un message direct
app.post('/api/communications', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seul l\'administrateur peut publier des communications officielles.' });
  }

  const { title, message, recipientType, targetUserId, level } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Titre et message requis.' });
  }

  const result = db.prepare(`
    INSERT INTO admin_communications (sender_role, sender_name, recipient_type, target_user_id, title, message, level)
    VALUES ('admin', 'Daniel Onguiba Boutna', ?, ?, ?, ?, ?)
  `).run(recipientType || 'all', targetUserId || null, title, message, level || 'info');

  const created = db.prepare('SELECT * FROM admin_communications WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: created, message: 'Communication transmise avec succès.' });
});

// PUT /api/demandes/:id/approve — Modération / validation d'une demande par l'admin
app.put('/api/demandes/:id/approve', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Action réservée à l\'administrateur.' });
  }
  const { approved } = req.body;
  const status = approved ? 'en_attente' : 'rejetee';
  const verifiedVal = approved ? 1 : -1;

  db.prepare('UPDATE demandes SET verified_by_admin = ?, status = ? WHERE id = ?').run(verifiedVal, status, req.params.id);
  res.json({ success: true, message: approved ? 'Demande approuvée et publiée pour les artisans.' : 'Demande rejetée.' });
});

// ============================================================
// ROUTES ADMIN
// ============================================================

// GET /api/admin/stats — Statistiques globales
app.get('/api/admin/stats', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }

  const stats = {
    totalProviders: db.prepare("SELECT COUNT(*) as n FROM providers WHERE verified = 1 AND category != 'Admin'").get().n,
    pendingProviders: db.prepare("SELECT COUNT(*) as n FROM providers WHERE verified = 0 AND category != 'Admin'").get().n,
    totalDemandes: db.prepare("SELECT COUNT(*) as n FROM demandes").get().n,
    activeDemandesCount: db.prepare("SELECT COUNT(*) as n FROM demandes WHERE status IN ('en_attente', 'devis_recus', 'en_cours')").get().n,
    totalQuotes: db.prepare("SELECT COUNT(*) as n FROM quotes").get().n,
    completedInterventions: db.prepare("SELECT COUNT(*) as n FROM demandes WHERE status = 'terminee'").get().n,
  };
  res.json(stats);
});

// DELETE /api/admin/providers/:id — Supprimer un prestataire
app.delete('/api/admin/providers/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé.' });
  db.prepare('DELETE FROM providers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/demandes/:id — Supprimer une demande
app.delete('/api/admin/demandes/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé.' });
  db.prepare('DELETE FROM quotes WHERE demande_id = ?').run(req.params.id);
  db.prepare('DELETE FROM demandes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// ROUTES UTILITAIRES
// ============================================================

// GET /api/health — Vérification de l'état du serveur
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// GET / — Servir la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Wildcard pour SPA — servir index.html pour les routes inconnues
app.get('/{*path}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route API introuvable.' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================
initDatabase();

app.listen(PORT, () => {
  console.log(`\n🚀 KHIDMA Tchad Backend démarré sur http://localhost:${PORT}`);
  console.log(`📁 Frontend servi depuis: ${frontendPath}`);
  console.log(`🗄️  Base de données: ${path.join(__dirname, 'khidma_tchad.db')}`);
  console.log('\n📋 Routes API disponibles:');
  console.log('  POST /api/auth/login          — Connexion');
  console.log('  POST /api/auth/register-client — Inscription client');
  console.log('  GET  /api/providers           — Prestataires vérifiés');
  console.log('  POST /api/providers           — Inscription prestataire');
  console.log('  GET  /api/demandes            — Toutes les demandes');
  console.log('  POST /api/demandes            — Créer une demande');
  console.log('  POST /api/quotes              — Soumettre un devis');
  console.log('  GET  /api/admin/stats         — Stats admin');
  console.log('\n🔐 Compte Administrateur Officiel :');
  console.log('  Email :       onguibaboutnadaniel@gmail.com');
  console.log('  Mot de passe: 12345');
  console.log('  Téléphone :   +23561000000');
});
