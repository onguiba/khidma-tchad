========================================================================
   PROXITCHAD — Plateforme de Services au Tchad (Architecture Frontend)
========================================================================

1. STRUCTURE DU PROJET
------------------------------------------------------------------------
ProxiTchad/
├── index.html                   # Page d'accueil principale
├── README.txt                   # Documentation du projet
│
├── css/                         # Architecture modulaire CSS (Design System)
│   ├── variables.css            # Tokens de design (couleurs Tchad, polices, ombres, rayons)
│   ├── base.css                 # Reset CSS, typographie et conteneurs universels
│   ├── components.css           # Cartes catégories, profils prestataires, modales, toasts
│   ├── layout.css               # Header, navigation, Hero banner, sections et footer
│   ├── responsive.css           # Breakpoints & adaptations mobiles et tablettes
│   └── styles.css               # Point d'entrée CSS principal (bundle modulaire)
│
├── js/                          # Architecture JavaScript modulaire
│   ├── data.js                  # Données des 11 catégories, prestataires et quartiers
│   ├── modals.js                # Contrôleur universel des modales (appel, WhatsApp, inscription)
│   ├── search.js                # Moteur de filtrage et recherche instantanée
│   └── app.js                   # Point d'entrée applicatif et écouteurs d'événements
│
├── pages/                       # Pages secondaires modulaires
│   ├── services.html            # Catalogue complet des services avec filtres
│   ├── devenir-prestataire.html # Page d'onboarding et d'inscription pour les artisans
│   ├── publier-demande.html     # Page de dépôt d'un besoin pour les clients
│   └── a-propos.html            # Présentation de ProxiTchad, mission locale et FAQ
│
└── images/                      # Assets visuels optimisés
    ├── hero_artisan.jpg         # Artisan avec le Monument de la Nation (N'Djamena)
    ├── rachid.jpg               # Rachid Plomberie (Moursal)
    ├── electricite.jpg          # Électricité Plus (Sabangali)
    ├── techtchad.jpg            # TechTchad Services (Kabalaye)
    ├── proprete.jpg             # Tchad Propreté (Toumaï)
    ├── transports.jpg           # Transports Express (Diguel)
    └── femme_pro.jpg            # Professionnelle (encart partenaire)

2. COMMENT LANCER LE PROJET ?
------------------------------------------------------------------------
- Double-cliquez simplement sur `index.html`.
- Aucun serveur ni installation Node.js n'est obligatoire pour la prévisualisation.
- Fonctionne directement sur Chrome, Edge, Firefox et Safari.
========================================================================
