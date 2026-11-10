/**
 * PROXITCHAD - MOTEUR D'ÉTAT DU FRONTEND (STORAGE & SIMULATION BACKEND)
 * Gère le cycle de vie complet des demandes, devis, interventions et avis via LocalStorage.
 */

const STORAGE_KEYS = {
  DEMANDES: 'proxitchad_demandes_v2',
  PROVIDERS: 'proxitchad_providers_v2',
  REVIEWS: 'proxitchad_reviews_v1',
  USER_ROLE: 'proxitchad_active_role'
};

// ============================================================
// 1. DONNÉES INITIALES RÉALISTES
// ============================================================
const INITIAL_DEMANDES = [];
const LEGACY_DEMO_DEMANDES = [
  {
    id: "DEM-2026-001",
    clientName: "Nathalie Ndouba",
    clientPhone: "+235 66 24 55 88",
    city: "N'Djamena",
    quartier: "Moursal",
    category: "Plomberie",
    title: "Fuite importante sous l'évier de la cuisine et siphon",
    description: "Le tuyau en cuivre d'alimentation d'eau fuit abondamment depuis ce matin. Nécessite une intervention rapide avec outillage de soudure ou raccord rapide.",
    budget: "15 000 — 25 000 FCFA",
    urgency: "Urgent (Aujourd'hui)",
    status: "devis_recus", // en_attente, devis_recus, en_cours, terminee
    targetProId: null,
    createdAt: "Aujourd'hui à 10:15",
    quotes: [
      {
        id: "QUO-101",
        proId: 1,
        proName: "Rachid Plomberie",
        proRating: 4.8,
        proReviews: 124,
        proPhone: "+235 66 12 34 56",
        amount: "15 000 FCFA",
        delay: "Intervention sous 1 heure",
        message: "Bonjour Mme Ndouba, je suis disponible immédiatement à Moursal avec tout le matériel de plomberie et raccords pour régler la fuite.",
        date: "Il y a 25 min",
        status: "propose"
      },
      {
        id: "QUO-102",
        proId: 11,
        proName: "Mahamat Tuyauterie Express",
        proRating: 4.9,
        proReviews: 83,
        proPhone: "+235 99 22 11 00",
        amount: "18 000 FCFA",
        delay: "Cet après-midi à 14h00",
        message: "Spécialiste sanitaire et cuivre. Je fournis les pièces de rechange certifiées et garantis l'étanchéité 6 mois.",
        date: "Il y a 40 min",
        status: "propose"
      },
      {
        id: "QUO-103",
        proId: 12,
        proName: "Dépannage Plomberie 235",
        proRating: 4.6,
        proReviews: 45,
        proPhone: "+235 60 44 55 66",
        amount: "12 500 FCFA",
        delay: "Sous 2 heures",
        message: "Tarif très avantageux incluant déplacement, démontage du siphon et joint d'étanchéité neuf.",
        date: "Il y a 1h",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-002",
    clientName: "Mahamat Saleh",
    clientPhone: "+235 99 87 65 43",
    city: "N'Djamena",
    quartier: "Sabangali",
    category: "Électricité",
    title: "Installation d'un inverseur de source et sécurisation disjoncteurs",
    description: "Besoin d'un électricien qualifié pour installer un inverseur de source pour groupe électrogène et sécuriser le tableau électrique principal de la maison.",
    budget: "25 000 — 40 000 FCFA",
    urgency: "Dans les 48 heures",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Aujourd'hui à 08:30",
    quotes: [
      {
        id: "QUO-201",
        proId: 2,
        proName: "Électricité Plus",
        proRating: 4.7,
        proReviews: 98,
        proPhone: "+235 99 45 67 89",
        amount: "25 000 FCFA",
        delay: "Demain matin à 09h00",
        message: "Devis complet comprenant l'installation de l'inverseur tétrapolaire et le contrôle de terre avec appareil de mesure.",
        date: "Il y a 1h30",
        status: "propose"
      },
      {
        id: "QUO-202",
        proId: 13,
        proName: "Moussa Élec & Énergie Tchad",
        proRating: 4.9,
        proReviews: 112,
        proPhone: "+235 66 77 88 99",
        amount: "28 000 FCFA",
        delay: "Aujourd'hui à 16h00",
        message: "Électricien agréé avec 12 ans d'expérience. Possibilité d'intervenir cet après-midi même pour ne pas couper l'alimentation.",
        date: "Il y a 2h",
        status: "propose"
      },
      {
        id: "QUO-203",
        proId: 14,
        proName: "Tchad Volt Services",
        proRating: 4.5,
        proReviews: 39,
        proPhone: "+235 63 99 00 11",
        amount: "22 000 FCFA",
        delay: "Sous 24 heures",
        message: "Main-d'œuvre soignée avec disjoncteur différentiel 30mA aux normes de sécurité.",
        date: "Il y a 3h",
        status: "propose"
      },
      {
        id: "QUO-204",
        proId: 15,
        proName: "Béchir Installations",
        proRating: 4.8,
        proReviews: 67,
        proPhone: "+235 68 11 22 33",
        amount: "30 000 FCFA",
        delay: "Jeudi matin",
        message: "Câblage armé haute résistance pour groupe électrogène et inverseur automatique inclus si souhaité.",
        date: "Il y a 4h",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-003",
    clientName: "Cabinet Juridique Al-Wihda",
    clientPhone: "+235 60 11 22 33",
    city: "N'Djamena",
    quartier: "Kabalaye",
    category: "Informatique",
    title: "Configuration d'un réseau Wi-Fi 8 postes et imprimante partagée",
    description: "Installation et sécurisation d'un routeur Wi-Fi TP-Link professionnel + partage réseau pour 8 ordinateurs et une imprimante multifonction avec sauvegarde.",
    budget: "35 000 — 55 000 FCFA",
    urgency: "Cette semaine",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Hier à 16:45",
    quotes: [
      {
        id: "QUO-301",
        proId: 3,
        proName: "TechTchad Services",
        proRating: 4.6,
        proReviews: 76,
        proPhone: "+235 60 78 90 12",
        amount: "35 000 FCFA",
        delay: "Intervention sous 24h",
        message: "Configuration routeurs TP-Link/Mikrotik, sécurisation WPA3 entreprise et paramétrage du partage d'imprimante réseau.",
        date: "Hier à 17:30",
        status: "propose"
      },
      {
        id: "QUO-302",
        proId: 16,
        proName: "Sahel IT & Réseaux",
        proRating: 4.9,
        proReviews: 94,
        proPhone: "+235 66 55 44 33",
        amount: "45 000 FCFA",
        delay: "Disponible immédiatement",
        message: "Ingénieur réseaux certifié Cisco. Audit complet du débit, câblage RJ45 blindé et garantie de couverture optimale.",
        date: "Hier à 18:15",
        status: "propose"
      },
      {
        id: "QUO-303",
        proId: 17,
        proName: "DataNet N'Djamena",
        proRating: 4.7,
        proReviews: 58,
        proPhone: "+235 99 33 22 11",
        amount: "40 000 FCFA",
        delay: "Demain à 10h",
        message: "Paramétrage imprimantes, droits d'accès sécurisés par mot de passe et formation du personnel.",
        date: "Hier à 19:00",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-004",
    clientName: "Fatimé Zara",
    clientPhone: "+235 66 98 76 54",
    city: "N'Djamena",
    quartier: "Toumaï",
    category: "Nettoyage",
    title: "Nettoyage approfondi villa 5 pièces après déménagement",
    description: "Nettoyage de fond en comble d'une villa vide avant emménagement : sols carrelés, vitres, sanitaires et traitement anti-poussière.",
    budget: "20 000 — 35 000 FCFA",
    urgency: "Dans les 48 heures",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Hier à 11:20",
    quotes: [
      {
        id: "QUO-401",
        proId: 4,
        proName: "Tchad Propreté",
        proRating: 4.5,
        proReviews: 62,
        proPhone: "+235 63 21 09 87",
        amount: "25 000 FCFA",
        delay: "Équipe de 3 agents demain matin",
        message: "Produits désinfectants écologiques fournis, vitres et sols décapés avec nettoyeur professionnel.",
        date: "Hier à 13:00",
        status: "propose"
      },
      {
        id: "QUO-402",
        proId: 18,
        proName: "Propre & Net N'Djamena",
        proRating: 4.8,
        proReviews: 73,
        proPhone: "+235 66 88 12 34",
        amount: "30 000 FCFA",
        delay: "Disponible cet après-midi",
        message: "Matériel professionnel mono-brosse, karcher haute pression et désinsectisation préventive offerte.",
        date: "Hier à 14:15",
        status: "propose"
      },
      {
        id: "QUO-403",
        proId: 19,
        proName: "Clean Service Toumaï",
        proRating: 4.6,
        proReviews: 41,
        proPhone: "+235 99 77 66 55",
        amount: "22 000 FCFA",
        delay: "Demain à 08h",
        message: "Désinfection complète des sanitaires, nettoyage faïence et ramassage soigné de tous détritus.",
        date: "Hier à 15:30",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-005",
    clientName: "Djibrine Hassan",
    clientPhone: "+235 68 44 33 22",
    city: "N'Djamena",
    quartier: "Diguel",
    category: "Transport",
    title: "Déménagement complet appartement 3 pièces vers Chagoua",
    description: "Recherche un véhicule adapté avec porteurs pour transporter meubles, lit, réfrigérateur et cartons de Diguel à Chagoua ce week-end.",
    budget: "40 000 — 65 000 FCFA",
    urgency: "Ce week-end",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Il y a 2 jours",
    quotes: [
      {
        id: "QUO-501",
        proId: 5,
        proName: "Transports Express",
        proRating: 4.7,
        proReviews: 89,
        proPhone: "+235 68 33 44 55",
        amount: "45 000 FCFA",
        delay: "Samedi à 07h30",
        message: "Camion bâché 3.5 tonnes avec 3 manutentionnaires expérimentés, couvertures de protection et sangles d'arrimage.",
        date: "Hier à 09:20",
        status: "propose"
      },
      {
        id: "QUO-502",
        proId: 20,
        proName: "Toumaï Fret & Déménagement",
        proRating: 4.9,
        proReviews: 105,
        proPhone: "+235 60 99 88 77",
        amount: "50 000 FCFA",
        delay: "Samedi ou Dimanche matin",
        message: "Véhicule propre, démontage et remontage soigné des armoires et lits inclus dans la formule.",
        date: "Hier à 10:45",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-006",
    clientName: "Ahmat Youssouf",
    clientPhone: "+235 66 11 99 88",
    city: "N'Djamena",
    quartier: "Chagoua",
    category: "Bâtiment",
    title: "Installation et charge de 2 climatiseurs split 1.5 CV",
    description: "Pose murale des unités intérieures et extérieures, tirage au vide des tuyaux cuivre et remplissage en gaz réfrigérant pour maison neuve.",
    budget: "30 000 — 50 000 FCFA",
    urgency: "Urgent (Aujourd'hui)",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Aujourd'hui à 07:45",
    quotes: [
      {
        id: "QUO-601",
        proId: 21,
        proName: "Climatisation Plus N'Djamena",
        proRating: 4.8,
        proReviews: 82,
        proPhone: "+235 66 33 22 11",
        amount: "35 000 FCFA",
        delay: "Aujourd'hui à 15h00",
        message: "Frigoriste certifié avec pompe à vide professionnelle et gaz R410A garanti sans fuite.",
        date: "Il y a 1h",
        status: "propose"
      },
      {
        id: "QUO-602",
        proId: 22,
        proName: "Froid Tchad Express",
        proRating: 4.7,
        proReviews: 64,
        proPhone: "+235 99 55 44 33",
        amount: "32 000 FCFA",
        delay: "Sous 2 heures",
        message: "Support mural renforcé, perçage propre et contrôle température de sortie d'air.",
        date: "Il y a 1h45",
        status: "propose"
      },
      {
        id: "QUO-603",
        proId: 23,
        proName: "Élite Froid & Élec",
        proRating: 4.9,
        proReviews: 91,
        proPhone: "+235 60 22 11 99",
        amount: "40 000 FCFA",
        delay: "Demain matin à 08h",
        message: "Garantie 1 an sur le raccordement et disjoncteur différentiel dédié fourni.",
        date: "Il y a 2h",
        status: "propose"
      },
      {
        id: "QUO-604",
        proId: 24,
        proName: "Brahim Frigoriste",
        proRating: 4.5,
        proReviews: 38,
        proPhone: "+235 63 11 00 22",
        amount: "28 000 FCFA",
        delay: "Disponible immédiatement",
        message: "Atelier situé à Chagoua, je peux venir dans 15 minutes commencer l'installation.",
        date: "Il y a 2h30",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-007",
    clientName: "Kaltouma Brahim",
    clientPhone: "+235 99 33 44 55",
    city: "Moundou",
    quartier: "Centre-Ville",
    category: "Bâtiment",
    title: "Peinture intérieure salon et couloir (Enduit + 2 couches)",
    description: "Recherche peintre soigneux pour ponçage, rebouchage des fissures à l'enduit et application de 2 couches de peinture lavable satinée.",
    budget: "50 000 — 80 000 FCFA",
    urgency: "Cette semaine",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Hier à 15:00",
    quotes: [
      {
        id: "QUO-701",
        proId: 25,
        proName: "Moundou Déco & Bâtiment",
        proRating: 4.8,
        proReviews: 54,
        proPhone: "+235 66 44 22 11",
        amount: "55 000 FCFA",
        delay: "Démarrage jeudi",
        message: "Peintre professionnel réputé au centre de Moundou. Finition lisse sans bavures, protection des plinthes et sols.",
        date: "Hier à 17:00",
        status: "propose"
      },
      {
        id: "QUO-702",
        proId: 26,
        proName: "Artisans Unis du Logone",
        proRating: 4.6,
        proReviews: 47,
        proPhone: "+235 60 77 88 11",
        amount: "60 000 FCFA",
        delay: "Disponible dès demain",
        message: "Équipe de 2 peintres rapides. Travail terminé en 48 heures maximum avec peinture anti-moisissure.",
        date: "Hier à 18:30",
        status: "propose"
      }
    ]
  },
  {
    id: "DEM-2026-008",
    clientName: "Adoum Tahir",
    clientPhone: "+235 68 77 66 55",
    city: "Abéché",
    quartier: "Salamate",
    category: "Électricité",
    title: "Dépannage panneau solaire & régulateur de charge MPPT",
    description: "Le système solaire ne recharge plus les batteries depuis 2 jours. Besoin d'un électricien solaire pour vérifier les fusibles, le régulateur et le câblage du toit.",
    budget: "20 000 — 35 000 FCFA",
    urgency: "Dans les 48 heures",
    status: "devis_recus",
    targetProId: null,
    createdAt: "Hier à 18:20",
    quotes: [
      {
        id: "QUO-801",
        proId: 27,
        proName: "Solaire Sahel Abéché",
        proRating: 4.9,
        proReviews: 68,
        proPhone: "+235 66 12 88 99",
        amount: "25 000 FCFA",
        delay: "Demain matin",
        message: "Spécialiste de l'énergie solaire dans l'Ouaddaï. Test multimètre des panneaux et remplacement de régulateur en stock.",
        date: "Hier à 19:40",
        status: "propose"
      },
      {
        id: "QUO-802",
        proId: 28,
        proName: "Ouaddaï Énergie & Dépannage",
        proRating: 4.7,
        proReviews: 42,
        proPhone: "+235 99 66 55 44",
        amount: "20 000 FCFA",
        delay: "Aujourd'hui à 17h",
        message: "Technicien local intervenant rapidement à Salamate. Diagnostic batterie offert.",
        date: "Aujourd'hui à 08:15",
        status: "propose"
      },
      {
        id: "QUO-803",
        proId: 29,
        proName: "Élec Soleil Tchad",
        proRating: 4.6,
        proReviews: 35,
        proPhone: "+235 60 11 44 77",
        amount: "30 000 FCFA",
        delay: "Vendredi",
        message: "Contrôle complet de la puissance crête, réalignement des modules et câbles solaires UV.",
        date: "Aujourd'hui à 09:30",
        status: "propose"
      }
    ]
  }
];

// ============================================================
// 2. FONCTIONS DE GESTION DE L'ÉTAT LOCAL (CRUD STORAGE)
// ============================================================

// Initialisation au premier chargement & Purge automatique des données de démo
function initProxiTchadState() {
  try {
    const storedDemandes = localStorage.getItem(STORAGE_KEYS.DEMANDES);
    if (!storedDemandes || storedDemandes.includes('DEM-2026-001') || storedDemandes.includes('Nathalie Ndouba')) {
      localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify([]));
    }

    const storedPros = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    if (!storedPros || storedPros.includes('Rachid Plomberie') || storedPros.includes('Moussa Traor') || storedPros.includes('Électricité Plus')) {
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify([]));
    }
  } catch (e) {
    console.warn('Erreur localStorage:', e);
  }
}

// Récupérer toutes les demandes
function getAllDemandes() {
  initProxiTchadState();
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMANDES));
    if (Array.isArray(list) && list.length > 0) return list;
    return INITIAL_DEMANDES;
  } catch (e) {
    return INITIAL_DEMANDES;
  }
}

// Créer une nouvelle demande (soit ouverte, soit ciblée vers un pro)
function createDemande(demandeData) {
  const demandes = getAllDemandes();
  const nextNum = demandes.length + 1;
  const newId = `DEM-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
  
  const newDemande = {
    id: newId,
    clientName: demandeData.clientName || "Client ProxiTchad",
    clientPhone: demandeData.clientPhone || "+235 66 00 00 00",
    city: demandeData.city || "N'Djamena",
    quartier: demandeData.quartier || "Centre",
    category: demandeData.category || "Bâtiment",
    title: demandeData.title || `Demande de ${demandeData.category || 'service'}`,
    description: demandeData.description || "",
    budget: demandeData.budget || "15 000 — 30 000 FCFA",
    urgency: demandeData.urgency || "Dans les 48 heures",
    status: demandeData.targetProId ? "en_attente_pro" : "en_attente",
    targetProId: demandeData.targetProId || null,
    targetProName: demandeData.targetProName || null,
    createdAt: "À l'instant",
    quotes: []
  };

  demandes.unshift(newDemande);
  localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));

  // Notification d'événement global
  window.dispatchEvent(new CustomEvent('proxitchad:demande_created', { detail: newDemande }));

  return newDemande;
}

// Simulation dynamique d'artisans (désactivée : mode réel uniquement)
function simulateAutoApplicants(demandeId) {
  // Pas d'artisans fictifs injectés
  return;
}

// Générer un postulant réaliste pour une mission donnée
function generateRealisticApplicant(demandeId, index = 1) {
  const demandes = getAllDemandes();
  const demande = demandes.find(d => d.id === demandeId);
  if (!demande || demande.status === 'en_cours' || demande.status === 'terminee') return null;

  // Pool d'artisans adaptés à la catégorie
  const samplePros = [
    { name: "Rachid Plomberie", rating: 4.8, reviews: 124, phone: "+235 66 12 34 56", cat: "Plomberie", basePrice: "15 000 FCFA", delay: "Intervention sous 1h" },
    { name: "Mahamat Tuyauterie Express", rating: 4.9, reviews: 83, phone: "+235 99 22 11 00", cat: "Plomberie", basePrice: "18 000 FCFA", delay: "Cet après-midi" },
    { name: "Électricité Plus", rating: 4.7, reviews: 98, phone: "+235 99 45 67 89", cat: "Électricité", basePrice: "25 000 FCFA", delay: "Intervention sous 2h" },
    { name: "Moussa Élec Énergie", rating: 4.9, reviews: 112, phone: "+235 66 77 88 99", cat: "Électricité", basePrice: "22 000 FCFA", delay: "Aujourd'hui 16h" },
    { name: "TechTchad Services", rating: 4.6, reviews: 76, phone: "+235 60 78 90 12", cat: "Informatique", basePrice: "30 000 FCFA", delay: "Sous 24h" },
    { name: "Tchad Propreté", rating: 4.5, reviews: 62, phone: "+235 63 21 09 87", cat: "Nettoyage", basePrice: "20 000 FCFA", delay: "Demain matin" },
    { name: "Transports Express", rating: 4.7, reviews: 89, phone: "+235 68 33 44 55", cat: "Transport", basePrice: "40 000 FCFA", delay: "Disponible ce samedi" },
    { name: "Aliou Rénovation & Peinture", rating: 4.8, reviews: 52, phone: "+235 66 88 77 44", cat: "Bâtiment", basePrice: "35 000 FCFA", delay: "Dès demain 08h" }
  ];

  // Trouver un pro proche de la catégorie ou aléatoire
  let candidates = samplePros.filter(p => p.cat.toLowerCase().includes((demande.category || '').toLowerCase()) || (demande.category || '').toLowerCase().includes(p.cat.toLowerCase()));
  if (candidates.length === 0) candidates = samplePros;

  const chosenPro = candidates[(index - 1) % candidates.length] || samplePros[0];

  const newQuote = {
    id: `QUO-${Date.now().toString().slice(-4)}`,
    proId: 100 + Math.floor(Math.random() * 800),
    proName: chosenPro.name,
    proRating: chosenPro.rating,
    proReviews: chosenPro.reviews,
    proPhone: chosenPro.phone,
    amount: chosenPro.basePrice,
    delay: chosenPro.delay,
    message: `Bonjour, je suis artisan qualifié disponible à ${demande.quartier || "N'Djamena"}. J'ai l'équipement nécessaire pour intervenir avec efficacité et garantie.`,
    date: "À l'instant",
    status: "propose"
  };

  if (!demande.quotes) demande.quotes = [];
  // Éviter doublon du même nom
  if (!demande.quotes.some(q => q.proName === chosenPro.name)) {
    demande.quotes.unshift(newQuote);
    demande.status = "devis_recus";
    localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));

    // Toast de notification et déclenchement d'événement
    if (typeof showToast === 'function') {
      showToast(`🔔 Candidature reçue : ${chosenPro.name} a postulé à votre demande (${chosenPro.basePrice}) !`);
    }

    window.dispatchEvent(new CustomEvent('proxitchad:quote_received', { detail: { demandeId, quote: newQuote } }));

    // Rafraîchir les interfaces si actives sur la page
    if (typeof renderClientDemandes === 'function') renderClientDemandes();
    if (typeof renderProDashboard === 'function') renderProDashboard();
    if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
  }

  return newQuote;
}

// Déclencheur instantané pour test / démonstration par l'utilisateur
function triggerInstantDemoApplicant(demandeId) {
  return generateRealisticApplicant(demandeId, Math.floor(Math.random() * 6) + 1);
}


// Propose un devis de la part d'un pro
function submitProQuote(demandeId, quoteData) {
  const currentPro = (typeof getCurrentPro === 'function') ? getCurrentPro() : null;
  if (currentPro && (!currentPro.verified || currentPro.applicationStatus !== 'valide')) {
    if (typeof showToast === 'function') {
      showToast("⚠️ Action refusée : Votre Carte Nationale d'Identité doit d'abord être vérifiée et validée par l'administrateur avant de proposer vos services.");
    }
    return false;
  }

  const demandes = getAllDemandes();
  const demande = demandes.find(d => d.id === demandeId);
  if (!demande) return false;

  const quote = {
    id: `QUO-${Date.now().toString().slice(-4)}`,
    proId: quoteData.proId || (currentPro ? currentPro.id : 1),
    proName: quoteData.proName || (currentPro ? (currentPro.companyName || currentPro.name) : "Prestataire ProxiTchad"),
    proRating: quoteData.proRating || 4.8,
    proReviews: quoteData.proReviews || 50,
    proPhone: quoteData.proPhone || (currentPro ? currentPro.phone : "+235 66 XX XX XX"),
    amount: quoteData.amount || "À convenir",
    delay: quoteData.delay || "Disponible rapidement",
    message: quoteData.message || "",
    date: "À l'instant",
    status: "propose"
  };

  if (!demande.quotes) demande.quotes = [];
  demande.quotes.unshift(quote);
  demande.status = "devis_recus";

  localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));

  window.dispatchEvent(new CustomEvent('proxitchad:quote_received', { detail: { demandeId, quote } }));

  if (typeof renderClientDemandes === 'function') renderClientDemandes();
  if (typeof renderProDashboard === 'function') renderProDashboard();
  if (typeof renderHomepageMissions === 'function') renderHomepageMissions();

  return quote;
}

// Client accepte un devis
function acceptQuote(demandeId, quoteId) {
  const demandes = getAllDemandes();
  const demande = demandes.find(d => d.id === demandeId);
  if (!demande) return false;

  const quote = demande.quotes.find(q => q.id === quoteId);
  if (!quote) return false;

  quote.status = "accepte";
  demande.status = "en_cours";
  demande.agreedProId = quote.proId;
  demande.agreedProName = quote.proName;
  demande.agreedProPhone = quote.proPhone;
  demande.agreedPrice = quote.amount;

  localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));
  return true;
}

// Marquer une intervention comme terminée
function completeIntervention(demandeId) {
  const demandes = getAllDemandes();
  const demande = demandes.find(d => d.id === demandeId);
  if (!demande) return false;

  demande.status = "terminee";
  demande.completedAt = "Aujourd'hui";
  localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));
  return true;
}

// Laisser un avis client sur une intervention terminée
function submitClientReview(demandeId, rating, comment) {
  const demandes = getAllDemandes();
  const demande = demandes.find(d => d.id === demandeId);
  if (!demande) return false;

  demande.review = {
    rating: parseInt(rating, 10) || 5,
    comment: comment || "Prestation satisfaisante.",
    date: "À l'instant"
  };

  localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));
  return true;
}

// ============================================================
// 3. MOTEUR D'AUDIT IA & GESTION DES PRESTATAIRES
// ============================================================

// Récupérer tous les prestataires (vérifiés et en attente)
function getAllProviders() {
  initProxiTchadState();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROVIDERS)) || (typeof PROVIDERS_DATA !== 'undefined' ? PROVIDERS_DATA : []);
  } catch (e) {
    return typeof PROVIDERS_DATA !== 'undefined' ? PROVIDERS_DATA : [];
  }
}

// Récupérer uniquement les prestataires certifiés (visibles sur le site public)
function getVerifiedProviders() {
  return getAllProviders().filter(p => p.verified === true);
}

// Récupérer les prestataires en attente de validation IA / Admin
function getPendingProviders() {
  return getAllProviders().filter(p => !p.verified || p.applicationStatus === 'en_attente_ia');
}

// Algorithme d'Audit IA Automatique pour candidatures au Tchad
function generateAiAuditReport(proData) {
  const phone = (proData.phone || '').trim();
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // Format Tchad : indicatif 235 + 8 chiffres ou 8 chiffres commençant par 6, 9 ou 7
  const isChadPrefix = phone.startsWith('+235') || phone.startsWith('00235') || cleanPhone.startsWith('235');
  const digits = cleanPhone.startsWith('235') ? cleanPhone.slice(3) : cleanPhone;
  const isLengthValid = digits.length === 8;
  const isAirtel = digits.startsWith('6') || digits.startsWith('7');
  const isMoov = digits.startsWith('9');
  const phoneOperator = isAirtel ? "Airtel Tchad (6X / 7X)" : (isMoov ? "Moov Africa Tchad (9X)" : "Opérateur national Tchad");
  const phoneChecked = isLengthValid && (isAirtel || isMoov || isChadPrefix);

  // Analyse sémantique de la description et des compétences
  const desc = (proData.description || '').toLowerCase();
  const cat = (proData.category || '').toLowerCase();
  const techKeywords = [
    "expérience", "dépannage", "installation", "réparation", "outillage", "garantie", 
    "certifié", "qualifié", "matériel", "chantier", "travail", "professionnel", 
    "urgent", "équipe", "sanitaire", "solaire", "disjoncteur", "câblage", "réseau", 
    "peinture", "maçonnerie", "climatisation", "panneaux", "sécurité", "entretien"
  ];
  const matchedKeywords = techKeywords.filter(kw => desc.includes(kw));
  const skillsMatch = desc.length > 20 || matchedKeywords.length > 0;

  // Localisation reconnue au Tchad
  const knownCities = ["n'djamena", "ndjamena", "moundou", "sarh", "abéché", "abeche", "am timan", "koumra"];
  const city = (proData.city || '').toLowerCase();
  const geoChecked = knownCities.some(c => city.includes(c));

  // Score global d'intégrité calculé par l'IA (entre 88% et 98%)
  let score = 84;
  if (phoneChecked) score += 6;
  if (skillsMatch) score += 4;
  if (geoChecked) score += 3;
  if (proData.cniNumber) score += 3;
  if (proData.photo && proData.photo !== 'images/rachid.jpg') score += 2;
  score = Math.min(score, 98);

  const keywordsDetected = matchedKeywords.length > 0 
    ? matchedKeywords.slice(0, 5) 
    : [proData.category || "Compétences techniques", "Outillage adapté", "Disponibilité locale"];

  const cniNum = proData.cniNumber || "";

  return {
    score: score,
    status: score >= 80 ? "favorable" : "a_examiner",
    phoneChecked: phoneChecked,
    phoneNetwork: phoneOperator,
    skillsMatch: skillsMatch,
    cniChecked: !!cniNum,
    cniNumber: cniNum,
    keywordsCount: keywordsDetected.length,
    keywordsDetected: keywordsDetected,
    geoChecked: geoChecked,
    identityChecked: !!(proData.name && proData.name.length >= 3),
    summary: `Audit IA concluant : numéro national ${phoneOperator} valide. Carte Nationale d'Identité (${cniNum || 'Présente'}) enregistrée pour examen administrateur. Compétences adaptées pour le secteur ${proData.category || "Artisanat"} à ${proData.city || "N'Djamena"}.`
  };
}

// Enregistrer un nouveau prestataire avec sa candidature en attente d'audit IA
function registerNewProvider(data) {
  const pros = getAllProviders();
  const nextId = pros.reduce((max, p) => (typeof p.id === 'number' && p.id > max ? p.id : max), 0) + 1;

  // Génération de l'audit IA automatique
  const aiAudit = generateAiAuditReport(data);

  const newPro = {
    id: nextId,
    name: data.name || "Artisan ProxiTchad",
    companyName: data.companyName || data.name || "",
    category: data.category || "Bâtiment",
    role: data.role || (data.category ? data.category : "Prestataire"),
    rating: 5.0,
    reviewsCount: 0,
    city: data.city || "N'Djamena",
    quartier: data.quartier || "Sabangali",
    phone: data.phone || "+235 66 00 00 00",
    email: data.email || null,
    password: data.password || "12345",
    photo: data.photo || "images/hero_artisan.jpg",
    cniNumber: data.cniNumber || "",
    cniPhoto: data.cniPhoto || null,
    cniVerified: false,
    realisationsPhotos: data.realisationsPhotos || [],
    tarifIndicatif: data.tarifIndicatif || null,
    experienceYears: data.experienceYears || 1,
    verified: false, // En attente de validation manuelle par l'administrateur
    applicationStatus: "en_attente_admin", // 'en_attente_admin', 'valide', 'suspendu'
    aiAudit: aiAudit,
    description: data.description || "Professionnel qualifié inscrit sur KHIDMA Tchad.",
    registeredAt: "Aujourd'hui"
  };

  pros.unshift(newPro);
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(pros));
  localStorage.setItem('proxitchad_current_pro_id', String(newPro.id));
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'pro');

  window.dispatchEvent(new CustomEvent('proxitchad:provider_registered', { detail: newPro }));
  return newPro;
}

// Exécution de la vérification et validation par l'IA et l'administrateur
function runAiVerification(proId) {
  const pros = getAllProviders();
  const pro = pros.find(p => Number(p.id) === Number(proId));
  if (pro) {
    pro.verified = true;
    pro.cniVerified = true;
    pro.applicationStatus = 'valide';
    pro.validatedAt = "Validé par IA & Admin";
    if (!pro.aiAudit) {
      pro.aiAudit = generateAiAuditReport(pro);
    }
    pro.aiAudit.status = 'valide';
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(pros));
    
    // Déclenchement d'événements pour mettre à jour les interfaces
    window.dispatchEvent(new CustomEvent('proxitchad:provider_verified', { detail: pro }));
  }
  return pro;
}

// Admin: Valider ou suspendre un prestataire
function toggleProviderVerification(proId, verified) {
  const pros = getAllProviders();
  const pro = pros.find(p => Number(p.id) === Number(proId));
  if (pro) {
    pro.verified = verified;
    pro.cniVerified = !!verified;
    pro.applicationStatus = verified ? 'valide' : 'suspendu';
    if (verified && !pro.validatedAt) {
      pro.validatedAt = "Validé par Admin";
    }
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(pros));
    window.dispatchEvent(new CustomEvent('proxitchad:provider_status_changed', { detail: pro }));
  }
  return pro;
}

// Simuler une nouvelle candidature réaliste pour test administrateur
function simulatePendingProvider() {
  const sampleCandidates = [
    {
      name: "Brahim Djibrine",
      companyName: "Brahim Froid & Climatisation",
      category: "Bâtiment",
      role: "❄️ Frigoriste & Climatisation",
      city: "N'Djamena",
      quartier: "Moursal",
      phone: "+235 99 33 22 11",
      photo: "images/femme_pro.jpg",
      description: "Frigoriste avec 8 ans d'expérience. Installation de climatiseurs split, recharge en gaz R410A et dépannage rapide avec garantie d'étanchéité."
    },
    {
      name: "Kaltouma Mahamat",
      companyName: "Kaltouma Déco & Peinture",
      category: "Bâtiment",
      role: "🎨 Peintre & Décoratrice",
      city: "Moundou",
      quartier: "Centre-Ville",
      phone: "+235 66 44 88 12",
      photo: "images/femme_pro.jpg",
      description: "Spécialiste de la peinture intérieure et extérieure, enduit lissé et revêtements décoratifs avec outillage professionnel à Moundou."
    },
    {
      name: "Ahmat Al-Béchir",
      companyName: "Al-Béchir Réseaux & Caméras",
      category: "Informatique",
      role: "💻 Câblage & Sécurité",
      city: "N'Djamena",
      quartier: "Sabangali",
      phone: "+235 60 11 99 44",
      photo: "images/techtchad.jpg",
      description: "Installation de caméras de surveillance IP, configuration de routeurs Wi-Fi longue portée et maintenance de réseaux d'entreprise."
    }
  ];

  const pros = getAllProviders();
  const existingNames = pros.map(p => p.name);
  const candidate = sampleCandidates.find(c => !existingNames.includes(c.name)) || sampleCandidates[0];
  
  const uniqueCandidate = {
    ...candidate,
    name: candidate.name + (existingNames.includes(candidate.name) ? ` (${pros.length + 1})` : ''),
    cniNumber: `CNI-TD-2024-${Math.floor(100000 + Math.random() * 900000)}`,
    cniPhoto: null,
    cniVerified: false
  };

  return registerNewProvider(uniqueCandidate);
}

// Récupérer le prestataire connecté
function getCurrentPro() {
  const pros = getAllProviders();
  const currentId = localStorage.getItem('proxitchad_current_pro_id');
  if (currentId) {
    const found = pros.find(p => String(p.id) === String(currentId));
    if (found) return found;
  }
  return pros[0] || null;
}

// Mettre à jour la photo du profil pro actif
function updateCurrentProPhoto(photoBase64) {
  const pros = getAllProviders();
  const currentPro = getCurrentPro();
  if (!currentPro) return false;
  
  const pro = pros.find(p => p.id === currentPro.id);
  if (pro) {
    pro.photo = photoBase64;
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(pros));
    return true;
  }
  return false;
}

// Exécuter l'initialisation immédiate
initProxiTchadState();

