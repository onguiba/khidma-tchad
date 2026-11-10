/**
 * PROXITCHAD - MOTEUR DE RECHERCHE & FILTRAGE
 * Filtrage par catégorie, recherche textuelle et sélection géographique
 */

// Filtrer par catégorie
function filterByCategory(categoryName, element) {
  // Mise à jour visuelle des boutons de catégorie
  document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active-filter'));
  if (element) {
    element.classList.add('active-filter');
  }

  const cards = document.querySelectorAll('.provider-card');
  let matchCount = 0;

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (categoryName === 'all' || cardCategory === categoryName) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const notice = document.getElementById('noResultsNotice');
  if (notice) {
    notice.style.display = matchCount === 0 ? 'block' : 'none';
  }

  // Scroll doux vers la section des prestataires
  const prestatairesSection = document.getElementById('prestataires');
  if (prestatairesSection) {
    prestatairesSection.scrollIntoView({ behavior: 'smooth' });
  }

  if (categoryName !== 'all') {
    showToast(`Filtre : ${categoryName} (${matchCount} professionnel${matchCount > 1 ? 's' : ''})`);
  } else {
    showToast(`Tous les professionnels affichés (${matchCount})`);
  }
}

// Recherche depuis le formulaire du Hero
function handleHeroSearch(event) {
  if (event) event.preventDefault();

  const serviceInput = document.getElementById('serviceSearchInput');
  const cityInput = document.getElementById('citySearchInput');

  const serviceVal = serviceInput ? serviceInput.value.trim().toLowerCase() : '';
  const cityVal = cityInput ? cityInput.value.trim().toLowerCase() : '';

  const cards = document.querySelectorAll('.provider-card');
  let matchCount = 0;

  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    const city = (card.getAttribute('data-city') || '').toLowerCase();
    const quartier = (card.getAttribute('data-quartier') || '').toLowerCase();
    const text = card.innerText.toLowerCase();

    const matchService = !serviceVal || name.includes(serviceVal) || category.includes(serviceVal) || text.includes(serviceVal);
    const matchLocation = !cityVal || city.includes(cityVal) || quartier.includes(cityVal) || text.includes(cityVal);

    if (matchService && matchLocation) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  const notice = document.getElementById('noResultsNotice');
  if (notice) {
    notice.style.display = matchCount === 0 ? 'block' : 'none';
  }

  if (matchCount === 0) {
    showToast('Aucun résultat trouvé pour votre recherche.');
  } else {
    showToast(`${matchCount} professionnel(s) trouvé(s) !`);
  }

  const prestatairesSection = document.getElementById('prestataires');
  if (prestatairesSection) {
    prestatairesSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Placer le focus sur la barre de recherche
function focusSearch() {
  const input = document.getElementById('serviceSearchInput');
  if (input) {
    input.focus();
    const heroEl = document.getElementById('accueil');
    if (heroEl) heroEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Rendu dynamique de la grille des prestataires depuis LocalStorage
function renderProvidersGrid(containerId = 'providersContainer', isSubdir = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allPros = (typeof getAllProviders === 'function') 
    ? getAllProviders() 
    : ((typeof PROVIDERS_DATA !== 'undefined') ? PROVIDERS_DATA : []);

  // FILTRE DE CONFIANCE PROXITCHAD : Seuls les prestataires validés par l'IA / Admin sont visibles sur le site public
  const pros = allPros.filter(p => p.verified === true);

  if (!pros || pros.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:50px 20px; background:#fff; border-radius:16px; border:1px solid #e2e8f0; box-shadow:var(--shadow-sm);">
        <div style="font-size:44px; margin-bottom:12px;">🛡️</div>
        <h3 style="font-size:17px; font-weight:800; color:var(--color-navy-dark); margin-bottom:6px;">Candidatures en cours de vérification par l'IA</h3>
        <p style="font-size:13px; color:var(--color-text-muted); margin-bottom:16px;">Toutes les prestations doivent être auditées et validées par notre équipe avant d'apparaître publiquement.</p>
        <a href="${isSubdir ? 'devenir-prestataire.html' : 'pages/devenir-prestataire.html'}" class="btn btn-yellow" style="padding:10px 20px; font-size:13px; text-decoration:none;">Soumettre ma candidature →</a>
      </div>
    `;
    return;
  }

  container.innerHTML = pros.map((p, idx) => {
    // URL de l'image (base64 ou chemin relatif)
    const photoSrc = (p.photo && (p.photo.startsWith('data:') || p.photo.startsWith('http')))
      ? p.photo
      : (isSubdir ? ('../' + (p.photo || 'images/rachid.jpg')) : (p.photo || 'images/rachid.jpg'));

    const displayName = p.companyName || p.name;
    const phoneRaw = p.phone || "+235 66 00 00 00";
    const phoneClean = phoneRaw.replace(/\s+/g, '');
    const phoneWa = phoneRaw.replace(/[^0-9]/g, '');

    const ratingDisplay = p.rating ? Number(p.rating).toFixed(1) : '5.0';
    const reviewsText = p.reviewsCount && p.reviewsCount > 0 ? `${p.reviewsCount} avis` : `Nouveau`;

    // Étoiles de notation
    const ratingNum = Math.round(parseFloat(ratingDisplay));
    const stars = '★'.repeat(Math.min(ratingNum, 5)) + '☆'.repeat(Math.max(0, 5 - ratingNum));

    const badgeHtml = p.verified 
      ? `<span class="badge-verifie" style="z-index:2;"><svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> Vérifié</span>`
      : `<span class="badge-nouveau" style="z-index:2;">⚡ Nouveau</span>`;

    const escapedName = displayName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const waMsg = encodeURIComponent(`Bonjour ${displayName}, je vous contacte via ProxiTchad pour un service.`);

    // Animation en cascade selon l'index
    const animDelay = Math.min(idx * 0.07, 0.5);

    return `
      <article class="provider-card" 
        data-category="${p.category}" 
        data-city="${p.city || ''}" 
        data-quartier="${p.quartier || ''}" 
        data-name="${displayName}"
        style="animation: fadeUp 0.45s ease ${animDelay}s both;">
        
        <div class="provider-thumbnail-wrap">
          <img src="${photoSrc}" alt="${displayName}" class="provider-thumbnail" 
            style="object-fit:cover; width:100%; height:100%;"
            onerror="this.src='${isSubdir ? '../' : ''}images/rachid.jpg'">
          ${badgeHtml}
        </div>

        <div class="provider-info-body">
          <h3 class="provider-name">${displayName}</h3>

          <div class="provider-rating-score">
            <span style="color:var(--color-star); letter-spacing:-0.5px;">${stars}</span>
            <span style="font-weight:800; color:var(--color-star);">${ratingDisplay}</span>
            <span style="color:var(--color-text-muted); font-size:10.5px;">(${reviewsText})</span>
          </div>

          <div class="provider-category-tag">${p.role || p.category}</div>

          <div class="provider-location-pin">
            <span>📍</span>
            <span>${p.city || "N'Djamena"} — ${p.quartier || "Centre"}</span>
          </div>

          <!-- Numéro de téléphone affiché -->
          <div class="provider-phone-display">
            <span class="provider-phone-label"><span>📞</span> Tél :</span>
            <a href="tel:${phoneClean}" class="provider-phone-val" title="Appeler">
              ${phoneRaw}
            </a>
          </div>

          <!-- Boutons Appel & WhatsApp -->
          <div class="provider-actions-row">
            <button class="btn-green-solid" onclick="contactProvider('${escapedName}', '${phoneRaw}', 'call')" title="Appel direct">
              📞 Appeler
            </button>
            <a href="https://wa.me/${phoneWa}?text=${waMsg}" target="_blank" class="btn-wa-green" title="WhatsApp">
              💬 WhatsApp
            </a>
          </div>

          <!-- Bouton Intervention -->
          <button class="btn-intervention" onclick="openInterventionModal(${p.id}, '${escapedName}')">
            🔵 Demander une intervention
          </button>
        </div>
      </article>
    `;
  }).join('');
}

