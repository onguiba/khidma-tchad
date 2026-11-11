/**
 * Script de test de la base de données KHIDMA Tchad
 * Vérifie la connexion et affiche des statistiques
 */

const { db, initDatabase } = require('./database');

console.log('🔍 Test de connexion à la base de données KHIDMA Tchad...\n');

try {
  // Initialiser la base de données
  initDatabase();
  console.log('✅ Base de données initialisée avec succès\n');

  // Tester les requêtes
  console.log('📊 Statistiques de la base de données:\n');

  // Compter les prestataires
  const providersCount = db.prepare('SELECT COUNT(*) as count FROM providers').get();
  console.log(`   👨‍🔧 Prestataires: ${providersCount.count}`);

  const verifiedProviders = db.prepare('SELECT COUNT(*) as count FROM providers WHERE verified = 1').get();
  console.log(`   ✅ Vérifiés: ${verifiedProviders.count}`);

  const pendingProviders = db.prepare('SELECT COUNT(*) as count FROM providers WHERE verified = 0').get();
  console.log(`   ⏳ En attente: ${pendingProviders.count}\n`);

  // Compter les demandes
  const demandesCount = db.prepare('SELECT COUNT(*) as count FROM demandes').get();
  console.log(`   📋 Demandes: ${demandesCount.count}`);

  const activeDemandesCount = db.prepare("SELECT COUNT(*) as count FROM demandes WHERE status IN ('en_attente', 'devis_recus', 'en_cours')").get();
  console.log(`   🔥 Actives: ${activeDemandesCount.count}`);

  const completedDemandesCount = db.prepare("SELECT COUNT(*) as count FROM demandes WHERE status = 'terminee'").get();
  console.log(`   ✔️ Terminées: ${completedDemandesCount.count}\n`);

  // Compter les devis
  const quotesCount = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
  console.log(`   💰 Devis: ${quotesCount.count}`);

  const acceptedQuotesCount = db.prepare("SELECT COUNT(*) as count FROM quotes WHERE status = 'accepte'").get();
  console.log(`   ✅ Acceptés: ${acceptedQuotesCount.count}\n`);

  // Compter les avis
  const reviewsCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  console.log(`   ⭐ Avis: ${reviewsCount.count}\n`);

  // Afficher quelques prestataires
  console.log('👥 Derniers prestataires inscrits:\n');
  const recentProviders = db.prepare('SELECT name, category, city, verified FROM providers ORDER BY registered_at DESC LIMIT 5').all();
  recentProviders.forEach((p, i) => {
    const status = p.verified ? '✅' : '⏳';
    console.log(`   ${i + 1}. ${status} ${p.name} - ${p.category} (${p.city})`);
  });

  console.log('\n✅ Test de base de données réussi !');
  console.log('🚀 La base de données fonctionne normalement.\n');

} catch (error) {
  console.error('❌ Erreur lors du test de la base de données:');
  console.error(error);
  process.exit(1);
}
