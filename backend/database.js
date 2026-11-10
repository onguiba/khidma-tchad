/**
 * KHIDMA TCHAD - BASE DE DONNÉES SQLITE
 * Schéma et configuration des comptes réels
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'khidma_tchad.db');
const db = new Database(DB_PATH);

// Activer les clés étrangères et mode WAL pour la performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================
// CRÉATION DES TABLES
// ============================================================
function initDatabase() {
  // Table des utilisateurs (prestataires + admins)
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      category TEXT NOT NULL,
      role TEXT,
      city TEXT NOT NULL DEFAULT 'N''Djamena',
      quartier TEXT,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT,
      photo TEXT,
      cni_number TEXT,
      cni_photo TEXT,
      cni_verified INTEGER DEFAULT 0,
      realisations_photos TEXT,
      tarif_indicatif TEXT,
      experience_years INTEGER DEFAULT 1,
      description TEXT,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      application_status TEXT DEFAULT 'en_attente_admin',
      ai_score INTEGER DEFAULT 95,
      ai_status TEXT DEFAULT 'favorable',
      ai_phone_checked INTEGER DEFAULT 1,
      ai_phone_network TEXT,
      ai_skills_match INTEGER DEFAULT 1,
      ai_keywords TEXT,
      ai_geo_checked INTEGER DEFAULT 1,
      ai_summary TEXT,
      is_available INTEGER DEFAULT 1,
      registered_at TEXT DEFAULT (datetime('now','localtime')),
      validated_at TEXT
    );
  `);

  // Migrations sécurisées des colonnes si base de données préexistante
  try { db.exec('ALTER TABLE providers ADD COLUMN email TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN cni_number TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN cni_photo TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN cni_verified INTEGER DEFAULT 0'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN realisations_photos TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN tarif_indicatif TEXT'); } catch (e) { }
  try { db.exec('ALTER TABLE providers ADD COLUMN experience_years INTEGER DEFAULT 1'); } catch (e) { }

  // Table des clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      city TEXT DEFAULT 'N''Djamena',
      quartier TEXT,
      password_hash TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Table des demandes de service
  db.exec(`
    CREATE TABLE IF NOT EXISTS demandes (
      id TEXT PRIMARY KEY,
      client_id INTEGER,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      city TEXT NOT NULL,
      quartier TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      budget TEXT,
      urgency TEXT DEFAULT 'Dans les 48 heures',
      status TEXT DEFAULT 'en_attente',
      verified_by_admin INTEGER DEFAULT 1,
      target_pro_id INTEGER,
      target_pro_name TEXT,
      agreed_pro_id INTEGER,
      agreed_pro_name TEXT,
      agreed_pro_phone TEXT,
      agreed_price TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      completed_at TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (target_pro_id) REFERENCES providers(id)
    );
  `);

  // Table des devis / propositions d'artisans
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      demande_id TEXT NOT NULL,
      pro_id INTEGER,
      pro_name TEXT NOT NULL,
      pro_rating REAL DEFAULT 5.0,
      pro_reviews INTEGER DEFAULT 0,
      pro_phone TEXT,
      amount TEXT,
      delay_text TEXT,
      message TEXT,
      status TEXT DEFAULT 'propose',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (demande_id) REFERENCES demandes(id),
      FOREIGN KEY (pro_id) REFERENCES providers(id)
    );
  `);

  // Table des avis clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demande_id TEXT NOT NULL,
      pro_id INTEGER,
      client_name TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (demande_id) REFERENCES demandes(id),
      FOREIGN KEY (pro_id) REFERENCES providers(id)
    );
  `);

  // Table des communications et messages officiels de l'administrateur
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_role TEXT DEFAULT 'admin',
      sender_name TEXT NOT NULL DEFAULT 'Daniel Onguiba Boutna',
      recipient_type TEXT DEFAULT 'all', -- 'all', 'pros', 'clients', 'pro_single'
      target_user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      level TEXT DEFAULT 'info', -- 'info', 'important', 'cni_feedback', 'alerte'
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  try { db.exec('ALTER TABLE demandes ADD COLUMN verified_by_admin INTEGER DEFAULT 1'); } catch (e) { }

  console.log('✅ Base de données SQLite configurée avec table communications.');
  purgeDemoDataAndConfigureAdmin();
}

// ============================================================
// PURGE DES COMPTES ET PUBLICATIONS DE DÉMO & COMPTE ADMIN
// ============================================================
function purgeDemoDataAndConfigureAdmin() {
  console.log('🧹 Purge des comptes et publications de démonstration...');

  // 1. Supprimer toutes les demandes, devis, avis et clients de test
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM quotes;
    DELETE FROM demandes;
    DELETE FROM clients;
  `);

  // 2. Supprimer tous les faux prestataires de démo (garder uniquement si l'admin existe)
  db.exec(`
    DELETE FROM providers 
    WHERE category != 'Admin' 
      AND (email IS NULL OR email != 'onguibaboutnadaniel@gmail.com');
  `);

  // 3. Configurer le compte administrateur officiel :
  // Email : onguibaboutnadaniel@gmail.com
  // Mot de passe : 12345
  const adminHash = bcrypt.hashSync('12345', 10);
  const existingAdmin = db.prepare(`
    SELECT id FROM providers 
    WHERE category = 'Admin' 
       OR email = 'onguibaboutnadaniel@gmail.com' 
       OR phone = '+23561000000'
  `).get();

  if (existingAdmin) {
    db.prepare(`
      UPDATE providers 
      SET name = ?, company_name = ?, category = 'Admin', role = ?, city = ?, quartier = ?, phone = ?, email = ?, password_hash = ?, verified = 1, cni_verified = 1, application_status = 'valide', description = ?
      WHERE id = ?
    `).run(
      'Daniel Onguiba Boutna',
      'KHIDMA Tchad Administration',
      '🛡️ Super Administrateur',
      "N'Djamena",
      'Centre',
      '+23561000000',
      'onguibaboutnadaniel@gmail.com',
      adminHash,
      'Administrateur Général de la plateforme KHIDMA Tchad.',
      existingAdmin.id
    );
    console.log('👑 Compte administrateur mis à jour : onguibaboutnadaniel@gmail.com / 12345');
  } else {
    db.prepare(`
      INSERT INTO providers (
        name, company_name, category, role, city, quartier, phone, email, 
        password_hash, photo, description, rating, reviews_count, verified, 
        cni_verified, application_status, ai_score, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Daniel Onguiba Boutna',
      'KHIDMA Tchad Administration',
      'Admin',
      '🛡️ Super Administrateur',
      "N'Djamena",
      'Centre',
      '+23561000000',
      'onguibaboutnadaniel@gmail.com',
      adminHash,
      'images/hero_artisan.jpg',
      'Administrateur Général de la plateforme KHIDMA Tchad.',
      5.0, 0, 1, 1, 'valide', 100, 1
    );
    console.log('👑 Compte administrateur créé : onguibaboutnadaniel@gmail.com / 12345');
  }

  console.log('✨ Base de données propre : Prête pour les véritables inscriptions.');
}

module.exports = { db, initDatabase, purgeDemoDataAndConfigureAdmin };
