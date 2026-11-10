/**
 * PROXITCHAD - DONNÉES DE L'APPLICATION (MOCK & CATALOGUE)
 * Catégories, Prestataires vérifiés et Localisations au Tchad
 */

const CATEGORIES_DATA = [
  {
    id: "plomberie",
    name: "Plomberie",
    colorClass: "cat-c-blue",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2h2v2h-4V5H6a2 2 0 0 0-2 2v2h2v4a3 3 0 0 0 3 3h3v2.1a3 3 0 1 0 2 0V18h2a3 3 0 0 0 3-3V9h2V7a2 2 0 0 0-2-2h-4V3h-2z"/></svg>`
  },
  {
    id: "electricite",
    name: "Électricité",
    colorClass: "cat-c-amber",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"/></svg>`
  },
  {
    id: "informatique",
    name: "Informatique",
    colorClass: "cat-c-teal",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><line x1="9" y1="16" x2="9" y2="20"></line><line x1="15" y1="16" x2="15" y2="20"></line></svg>`
  },
  {
    id: "nettoyage",
    name: "Nettoyage & Ordures ménagères",
    colorClass: "cat-c-green",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
  },
  {
    id: "transport",
    name: "Transport & Déménagement",
    colorClass: "cat-c-purple",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
  },
  {
    id: "batiment",
    name: "Bâtiment & Rénovation",
    colorClass: "cat-c-orange",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
  },
  {
    id: "sante",
    name: "Santé & Bien–être",
    colorClass: "cat-c-red",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><line x1="12" y1="8" x2="12" y2="13"></line><line x1="9.5" y1="10.5" x2="14.5" y2="10.5"></line></svg>`
  },
  {
    id: "education",
    name: "Éducation & Formation",
    colorClass: "cat-c-indigo",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`
  },
  {
    id: "evenementiel",
    name: "Événementiel",
    colorClass: "cat-c-magenta",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
  },
  {
    id: "agriculture",
    name: "Agriculture & Élevage",
    colorClass: "cat-c-emerald",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>`
  },
  {
    id: "autres",
    name: "Autres services",
    colorClass: "cat-c-slate",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.2"></circle><circle cx="12" cy="12" r="2.2"></circle><circle cx="19" cy="12" r="2.2"></circle></svg>`
  }
];

const PROVIDERS_DATA = [];

const CITIES_DATA = [
  {
    name: "N'Djamena",
    image: "images/ndjamena.jpg",
    description: "Capitale et principal pôle économique du Tchad",
    quartiers: [
      "Moursal", "Sabangali", "Kabalaye", "Toumaï", "Diguel",
      "Chagoua", "Farcha", "Gassi", "Paris-Congo", "Ridina", "Dembé"
    ]
  },
  {
    name: "Moundou",
    image: "images/moundou.jpg",
    description: "Capitale économique du Sud et pôle industriel",
    quartiers: ["Centre-Ville", "Doyon", "Gueldjem", "Dombao"]
  },
  {
    name: "Sarh",
    image: "images/sarh.jpg",
    description: "Grande cité verte et culturelle du Moyen-Chari",
    quartiers: ["Maïngara", "Kassaï", "Balimba"]
  },
  {
    name: "Abéché",
    image: "images/abeche.jpg",
    description: "Grand carrefour historique et commercial de l'Est",
    quartiers: ["Baguirmi", "Salamate", "Goz-Amir"]
  }
];
