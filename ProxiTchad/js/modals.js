/**
 * PROXITCHAD - GESTION DES MODALES & NOTIFICATIONS TOAST
 * Ouverture, fermeture, interactions de contact et formulaires
 */

// Toast notification globale
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Ouvrir une modale par son ID
function openModal(modalId) {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  const target = document.getElementById(modalId);
  if (target) {
    target.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (modalId === 'modalConnexion' && typeof populateLoginProPresets === 'function') {
      populateLoginProPresets();
    }
  }
}

// Fermer une modale par son ID
function closeModal(modalId) {
  const target = document.getElementById(modalId);
  if (target) {
    target.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Fermer les modales au clic en dehors du cadre
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Échap pour fermer les modales
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// Contacter un prestataire (Appel ou WhatsApp)
function contactProvider(name, phone, channel) {
  if (channel === 'call') {
    const titleEl = document.getElementById('contactModalTitle');
    const subEl = document.getElementById('contactModalSub');
    const nameEl = document.getElementById('contactModalProName');
    const phoneEl = document.getElementById('contactModalPhone');
    const callBtn = document.getElementById('btnDirectCall');
    const waBtn = document.getElementById('btnDirectWhatsApp');

    if (titleEl) titleEl.textContent = 'Appeler ' + name;
    if (subEl) subEl.textContent = 'Numéro de téléphone direct vérifié :';
    if (nameEl) nameEl.textContent = name;
    if (phoneEl) phoneEl.textContent = phone;
    if (callBtn) callBtn.href = 'tel:' + phone.replace(/\s+/g, '');
    if (waBtn) waBtn.href = 'https://wa.me/' + phone.replace(/[^0-9]/g, '');

    openModal('modalContact');
  } else {
    showToast('Ouverture de WhatsApp avec ' + name + '...');
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent('Bonjour ' + name + ', je vous contacte via la plateforme ProxiTchad pour un service.');
    window.open(`https://wa.me/${cleanNumber}?text=${greeting}`, '_blank');
  }
}

// Appliquer un quartier sélectionné
function applyQuartier(quartier) {
  const citySelect = document.getElementById('selectCityField');
  const city = citySelect ? citySelect.value : "N'Djamena";
  const display = quartier === 'Tous les quartiers' ? city : `${city} (${quartier})`;
  
  const headerCity = document.getElementById('headerSelectedCity');
  if (headerCity) headerCity.textContent = display;

  closeModal('modalVille');
  showToast('Zone active : ' + display);

  const cityInput = document.getElementById('citySearchInput');
  if (cityInput) {
    cityInput.value = quartier !== 'Tous les quartiers' ? quartier : city;
  }

  const drawerCity = document.getElementById('drawerSelectedCity');
  if (drawerCity) {
    drawerCity.textContent = display;
  }
}

// 4. Contrôleur du Menu Mobile Coulissant (Off-Canvas Drawer)
function toggleMobileDrawer(open) {
  const drawer = document.getElementById('mobileDrawer');
  if (!drawer) return;

  if (open) {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeMobileDrawer(event) {
  if (event.target.id === 'mobileDrawer') {
    toggleMobileDrawer(false);
  }
}

// Sélection rapide d'une ville depuis une vignette visuelle
function selectCityQuick(cityName) {
  const citySelect = document.getElementById('selectCityField');
  if (citySelect) {
    citySelect.value = cityName;
  }
  updateQuartiersList();
}

// Mettre à jour les quartiers lors du changement de ville
function updateQuartiersList() {
  const citySelect = document.getElementById('selectCityField');
  const pillsContainer = document.getElementById('quartiersPills');
  if (!citySelect || !pillsContainer) return;

  const cityName = citySelect.value;
  const cityObj = CITIES_DATA.find(c => c.name === cityName);

  // Mettre à jour le badge visuel actif si les vignettes de villes existent
  document.querySelectorAll('.city-modal-thumb').forEach(el => {
    if (el.dataset.city === cityName) {
      el.style.borderColor = 'var(--color-yellow)';
      el.style.boxShadow = '0 0 0 2px var(--color-yellow)';
      el.style.transform = 'translateY(-2px)';
    } else {
      el.style.borderColor = '#cbdcf4';
      el.style.boxShadow = 'none';
      el.style.transform = 'none';
    }
  });

  pillsContainer.innerHTML = '';
  if (cityObj && cityObj.quartiers) {
    cityObj.quartiers.forEach(q => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-outline-white';
      btn.style.color = '#0c254e';
      btn.style.borderColor = '#cbdcf4';
      btn.style.borderRadius = '999px';
      btn.style.padding = '6px 14px';
      btn.style.fontSize = '12px';
      btn.textContent = q;
      btn.onclick = () => applyQuartier(q);
      pillsContainer.appendChild(btn);
    });
  }

  // Option tous
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'btn-yellow';
  allBtn.style.borderRadius = '999px';
  allBtn.style.padding = '6px 14px';
  allBtn.style.fontSize = '12px';
  allBtn.textContent = 'Tous les quartiers';
  allBtn.onclick = () => applyQuartier('Tous les quartiers');
  pillsContainer.appendChild(allBtn);
}

// 5. Demande d'intervention ciblée à un professionnel spécifique
function openInterventionModal(proId, proName) {
  const proIdInput = document.getElementById('interventionProId');
  const proNameInput = document.getElementById('interventionProName');
  const modalSub = document.getElementById('interventionModalSub');

  if (proIdInput) proIdInput.value = proId;
  if (proNameInput) proNameInput.value = proName;
  if (modalSub) modalSub.textContent = `Votre demande sera transmise en priorité à ${proName}.`;

  openModal('modalIntervention');
}

function handleDirectInterventionSubmit(e) {
  e.preventDefault();
  const proId = parseInt(document.getElementById('interventionProId').value, 10);
  const proName = document.getElementById('interventionProName').value;
  const clientName = document.getElementById('intervClientName').value;
  const clientPhone = document.getElementById('intervClientPhone').value;
  const city = document.getElementById('intervClientCity').value;
  const quartier = document.getElementById('intervClientQuartier').value;
  const description = document.getElementById('intervClientDesc').value;
  const urgency = document.getElementById('intervClientUrgency').value;

  if (typeof createDemande === 'function') {
    createDemande({
      clientName,
      clientPhone,
      city,
      quartier,
      title: `Intervention sollicitée : ${description.slice(0, 40)}...`,
      description,
      urgency,
      targetProId: proId,
      targetProName: proName
    });
  }

  closeModal('modalIntervention');
  showToast(`✅ Demande transmise à ${proName} ! Il va vous contacter sous peu.`);
  e.target.reset();
}

// Handlers des formulaires de demande
function handleDemandeSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  // Lecture dynamique des champs
  const clientName = form.querySelector('[name="clientName"]')?.value || "Nathalie Ndouba";
  const title = form.querySelector('[name="title"]')?.value || "";
  const category = form.querySelector('[name="category"]')?.value || form.querySelector('select')?.value || "Bâtiment";
  const urgency = form.querySelector('[name="urgency"]')?.value || "Dans les 48 heures";
  const city = form.querySelector('[name="city"]')?.value || "N'Djamena";
  const quartier = form.querySelector('[name="quartier"]')?.value || form.querySelector('input[type="text"]')?.value || "Moursal";
  const budget = form.querySelector('[name="budget"]')?.value || "20 000 — 35 000 FCFA";
  const description = form.querySelector('textarea')?.value || "Intervention demandée au Tchad.";
  const clientPhone = form.querySelector('input[type="tel"]')?.value || "+235 66 00 00 00";

  const newDemande = (typeof createDemande === 'function') ? createDemande({
    clientName,
    title: title || `Demande de ${category} (${quartier})`,
    category,
    urgency,
    city,
    quartier,
    budget,
    description,
    clientPhone
  }) : null;

  closeModal('modalDemande');

  const isPublierPage = window.location.pathname.includes('publier-demande.html') || window.location.href.includes('publier-demande.html');

  if (isPublierPage) {
    showToast('🎉 Votre mission a été diffusée ! Redirection vers votre Espace Client où les artisans vont postuler...');
    setTimeout(() => {
      window.location.href = 'client.html';
    }, 1200);
  } else {
    showToast('🎉 Votre demande a été enregistrée avec succès ! Déjà notifiée aux artisans de votre zone.');
    form.reset();
    if (typeof renderHomepageMissions === 'function') {
      renderHomepageMissions();
      const sec = document.getElementById('missions');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// 6. Ouvrir la modale de candidature rapide (pour artisans voulant postuler à une mission)
function openQuickApplyModal(demandeId, title, budget, category) {
  const currentPro = (typeof getCurrentPro === 'function') ? getCurrentPro() : null;
  const modal = document.getElementById('modalQuickApply');
  if (!modal) {
    // Si la modale n'est pas dans le DOM de la page, rediriger vers pro.html
    const isPagesDir = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = (isPagesDir ? 'pro.html' : 'pages/pro.html') + `?apply=${demandeId}`;
    return;
  }

  document.getElementById('quickApplyDemandeId').value = demandeId;
  document.getElementById('quickApplyMissionTitle').textContent = title || "Demande de service";
  document.getElementById('quickApplyMissionBudget').textContent = `Budget prévu : ${budget || "À convenir"}`;

  // Pré-remplir les données de l'artisan
  const nameInput = document.getElementById('quickApplyProName');
  const phoneInput = document.getElementById('quickApplyProPhone');
  if (nameInput) nameInput.value = currentPro ? (currentPro.companyName || currentPro.name) : "Mon Entreprise Artisan";
  if (phoneInput) phoneInput.value = currentPro ? currentPro.phone : "+235 66 12 34 56";

  openModal('modalQuickApply');
}

// Soumission de la candidature par l'artisan
function handleQuickApplySubmit(e) {
  e.preventDefault();
  const demandeId = document.getElementById('quickApplyDemandeId').value;
  const proName = document.getElementById('quickApplyProName').value;
  const proPhone = document.getElementById('quickApplyProPhone').value;
  const amount = document.getElementById('quickApplyAmount').value;
  const delay = document.getElementById('quickApplyDelay').value;
  const message = document.getElementById('quickApplyMessage').value;

  if (typeof submitProQuote === 'function') {
    submitProQuote(demandeId, {
      proName,
      proPhone,
      amount,
      delay,
      message,
      proRating: 4.9,
      proReviews: 60
    });
  }

  closeModal('modalQuickApply');
  showToast(`🎉 Félicitations ! Votre candidature (${amount}) a été transmise au client !`);

  // Rafraîchir l'affichage
  if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
  if (typeof renderProDashboard === 'function') renderProDashboard();
}

// 7. Rendu dynamique de la grille des missions avec postulants sur l'accueil
async function renderHomepageMissions(filterCat = 'all', clickedBtn = null) {
  const container = document.getElementById('homepageMissionsGrid');
  if (!container) return;

  if (clickedBtn) {
    document.querySelectorAll('.mission-filter-pills .pill-filter').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  let demandes = [];
  try {
    const res = await fetch('http://localhost:3001/api/demandes');
    if (res.ok) {
      demandes = await res.json();
    } else {
      demandes = (typeof getAllDemandes === 'function') ? getAllDemandes() : [];
    }
  } catch (e) {
    demandes = (typeof getAllDemandes === 'function') ? getAllDemandes() : [];
  }

  if (!demandes || demandes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:32px; text-align:center; color:#64748b;">
        <div style="font-size:36px; margin-bottom:8px;">📋</div>
        <p style="font-size:14px; font-weight:700; color:#1e293b; margin-bottom:6px;">Aucune demande enregistrée pour le moment</p>
        <p style="font-size:12.5px; margin-bottom:16px;">Déposez la première demande de service pour recevoir des devis d'artisans qualifiés.</p>
        <button type="button" class="btn btn-yellow" onclick="openModal('modalDemande')" style="font-size:12px; padding:8px 18px;">
          ➕ Publier une demande
        </button>
      </div>
    `;
    return;
  }

  const openDemandes = demandes.filter(d => {
    if (d.status === 'terminee') return false;
    if (filterCat !== 'all' && d.category !== filterCat) return false;
    return true;
  });

  if (openDemandes.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:28px; text-align:center; color:#64748b;">
        <p style="font-size:13.5px; font-weight:600; color:#1e293b; margin:0;">Aucun chantier disponible actuellement dans la catégorie <b>${filterCat}</b>.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = openDemandes.slice(0, 8).map((d, idx) => {
    const quotes = d.quotes || [];
    const count = quotes.length;
    const isHot = count >= 3;

    let applicantsBadge = '';
    if (count === 0) {
      applicantsBadge = `<span class="mission-postulants-badge" style="background:#f1f5f9; color:#475569;">⚡ Nouveau · En attente</span>`;
    } else if (count === 1) {
      applicantsBadge = `<span class="mission-postulants-badge">👤 1 devis déposé</span>`;
    } else {
      applicantsBadge = `<span class="mission-postulants-badge ${isHot ? 'high' : ''}">🔥 ${count} devis déposés</span>`;
    }

    const escapedTitle = (d.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const escapedBudget = (d.budget || 'À convenir').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <article class="mission-card ${isHot ? 'hot-demand' : ''}" style="animation: fadeUp 0.35s ease ${idx * 0.06}s both;">
        <div>
          <div class="mission-top-row">
            <span class="mission-cat-tag">🛠️ ${d.category}</span>
            ${applicantsBadge}
          </div>

          <h3 class="mission-title">${d.title}</h3>
          <p class="mission-desc">${d.description || 'Intervention demandée par le client.'}</p>

          <div class="mission-meta-chips">
            <span class="mission-chip">📍 ${d.quartier ? d.quartier + ' (' + d.city + ')' : d.city}</span>
            <span class="mission-chip budget">💰 ${d.budget || 'À convenir'}</span>
            <span class="mission-chip urgency">⏰ ${d.urgency || 'Normal'}</span>
          </div>
        </div>

        <div class="mission-action-footer">
          <span style="font-size:11px; color:var(--color-text-muted); font-weight:600;">Réf: ${d.id} · ${d.createdAt || 'Récemment'}</span>
          <button type="button" class="btn-postuler-mission" onclick="openQuickApplyModal('${d.id}', '${escapedTitle}', '${escapedBudget}', '${d.category}')">
            💼 Postuler / Proposer un devis →
          </button>
        </div>
      </article>
    `;
  }).join('');
}


// Basculer entre connexion Client et Prestataire
function switchLoginRole(role) {
  const roleInput = document.getElementById('loginRoleInput');
  const tabClient = document.getElementById('tabLoginClient');
  const tabPro = document.getElementById('tabLoginPro');
  const tabAdmin = document.getElementById('tabLoginAdmin');
  const noticePro = document.getElementById('loginNoticePro');
  const identifierLabel = document.getElementById('loginIdentifierLabel');
  const identifierInput = document.getElementById('loginIdentifierInput');
  const passwordInput = document.getElementById('loginPasswordInput');
  const demoPresets = document.getElementById('loginProDemoPresets');
  const btnSubmit = document.getElementById('btnLoginSubmit');

  if (demoPresets) demoPresets.style.display = 'none';
  if (roleInput) roleInput.value = role;

  if (role === 'admin') {
    if (tabAdmin) {
      tabAdmin.style.background = 'var(--color-navy-dark)';
      tabAdmin.style.color = '#f59e0b';
      tabAdmin.style.borderColor = '#f59e0b';
    }
    if (tabPro) {
      tabPro.style.background = '#f1f5f9';
      tabPro.style.color = 'var(--color-navy-dark)';
      tabPro.style.borderColor = 'transparent';
    }
    if (tabClient) {
      tabClient.style.background = '#f1f5f9';
      tabClient.style.color = 'var(--color-navy-dark)';
      tabClient.style.borderColor = 'transparent';
    }
    if (noticePro) {
      noticePro.style.display = 'block';
      noticePro.innerHTML = `🛡️ <b>Espace Administrateur :</b> Gestion globale, validation des CNI et supervision.`;
      noticePro.style.background = '#fef3c7';
      noticePro.style.borderColor = '#fcd34d';
      noticePro.style.color = '#92400e';
    }
    if (identifierLabel) identifierLabel.textContent = "Email Administrateur";
    if (identifierInput) {
      identifierInput.placeholder = "onguibaboutnadaniel@gmail.com";
      identifierInput.value = "onguibaboutnadaniel@gmail.com";
    }
    if (passwordInput && !passwordInput.value) {
      passwordInput.placeholder = "12345";
    }
    if (btnSubmit) btnSubmit.textContent = "Accéder au Tableau de Bord Admin →";
  } else if (role === 'pro') {
    if (tabPro) {
      tabPro.style.background = 'var(--color-navy-dark)';
      tabPro.style.color = 'var(--color-yellow)';
      tabPro.style.borderColor = 'var(--color-yellow)';
    }
    if (tabClient) {
      tabClient.style.background = '#f1f5f9';
      tabClient.style.color = 'var(--color-navy-dark)';
      tabClient.style.borderColor = 'transparent';
    }
    if (tabAdmin) {
      tabAdmin.style.background = '#f1f5f9';
      tabAdmin.style.color = 'var(--color-navy-dark)';
      tabAdmin.style.borderColor = 'transparent';
    }
    if (noticePro) {
      noticePro.style.display = 'block';
      noticePro.innerHTML = `🔧 <b>Espace Prestataire :</b> Connectez-vous avec votre numéro de téléphone pour gérer vos interventions.`;
      noticePro.style.background = '#eff6ff';
      noticePro.style.borderColor = '#bfdbfe';
      noticePro.style.color = '#1e40af';
    }
    if (identifierLabel) identifierLabel.textContent = "Numéro WhatsApp ou Téléphone de l'artisan";
    if (identifierInput) {
      identifierInput.placeholder = "+235 66 12 34 56 ou votre numéro";
      if (identifierInput.value === 'onguibaboutnadaniel@gmail.com') identifierInput.value = '';
    }
    if (btnSubmit) btnSubmit.textContent = "Accéder à mes interventions artisan →";
  } else {
    if (tabClient) {
      tabClient.style.background = 'var(--color-navy-dark)';
      tabClient.style.color = 'var(--color-yellow)';
      tabClient.style.borderColor = 'var(--color-yellow)';
    }
    if (tabPro) {
      tabPro.style.background = '#f1f5f9';
      tabPro.style.color = 'var(--color-navy-dark)';
      tabPro.style.borderColor = 'transparent';
    }
    if (tabAdmin) {
      tabAdmin.style.background = '#f1f5f9';
      tabAdmin.style.color = 'var(--color-navy-dark)';
      tabAdmin.style.borderColor = 'transparent';
    }
    if (noticePro) noticePro.style.display = 'none';
    if (identifierLabel) identifierLabel.textContent = "Numéro de téléphone ou Email du client";
    if (identifierInput) {
      identifierInput.placeholder = "+235 66 24 55 88 ou votre numéro";
      if (identifierInput.value === 'onguibaboutnadaniel@gmail.com') identifierInput.value = '';
    }
    if (btnSubmit) btnSubmit.textContent = "Se connecter à mon Espace Client →";
  }
}

// Fonction de soumission de connexion (asynchrone avec support API et Admin)
async function handleConnexionSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const role = document.getElementById('loginRoleInput')?.value || 'pro';
  const identifier = form.querySelector('[name="identifier"]')?.value?.trim() || '';
  const password = form.querySelector('[name="password"]')?.value || '';

  const isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');

  // 1. Authentification via API Backend
  if (typeof KhidmaAuth !== 'undefined' && KhidmaAuth.login) {
    try {
      const apiResult = await KhidmaAuth.login(identifier, password, role);
      if (apiResult.success) {
        closeModal('modalConnexion');
        const user = apiResult.data.user || {};
        const returnedRole = apiResult.data.role;

        if (returnedRole === 'admin' || user.category === 'Admin') {
          showToast(`🛡️ Bienvenue Administrateur ${user.name || ''} !`);
          setTimeout(() => {
            window.location.href = isInsidePages ? 'admin.html' : 'pages/admin.html';
          }, 700);
          return;
        } else if (returnedRole === 'pro') {
          showToast(`👋 Bonjour ${user.companyName || user.name} !`);
          setTimeout(() => {
            window.location.href = isInsidePages ? 'pro.html' : 'pages/pro.html';
          }, 700);
          return;
        } else {
          showToast(`✅ Bonjour ${user.name} !`);
          setTimeout(() => {
            window.location.href = isInsidePages ? 'client.html' : 'pages/client.html';
          }, 700);
          return;
        }
      } else {
        showToast('❌ ' + (apiResult.error || 'Identifiant ou mot de passe incorrect.'));
        return;
      }
    } catch (err) {
      console.warn('Erreur API login:', err);
    }
  }

  // 2. Fallback Hors Ligne
  const isTargetAdmin = identifier.toLowerCase().includes('onguibaboutna') || identifier.toLowerCase().includes('admin') || role === 'admin';
  if (isTargetAdmin) {
    if (password === '12345') {
      localStorage.setItem('proxitchad_active_role', 'admin');
      localStorage.setItem('khidma_auth_user', JSON.stringify({
        id: 7,
        name: 'Daniel Onguiba Boutna',
        email: 'onguibaboutnadaniel@gmail.com',
        role: 'admin'
      }));
      closeModal('modalConnexion');
      showToast('🛡️ Bienvenue Administrateur !');
      setTimeout(() => {
        window.location.href = isInsidePages ? 'admin.html' : 'pages/admin.html';
      }, 700);
      return;
    } else {
      showToast('❌ Mot de passe administrateur incorrect (12345).');
      return;
    }
  }

  if (role === 'pro') {
    const pros = (typeof getAllProviders === 'function') ? getAllProviders() : [];
    let matchedPro = null;

    if (identifier) {
      const cleanInput = identifier.replace(/[^0-9]/g, '');
      matchedPro = pros.find(p => {
        const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
        return (cleanInput && cleanPhone.includes(cleanInput)) ||
               (p.name && p.name.toLowerCase().includes(identifier.toLowerCase())) ||
               (p.companyName && p.companyName.toLowerCase().includes(identifier.toLowerCase()));
      });
    }

    if (matchedPro) {
      localStorage.setItem('proxitchad_current_pro_id', String(matchedPro.id));
      localStorage.setItem('proxitchad_active_role', 'pro');
      closeModal('modalConnexion');
      showToast(`👋 Bonjour ${matchedPro.companyName || matchedPro.name} !`);
      setTimeout(() => {
        window.location.href = isInsidePages ? 'pro.html' : 'pages/pro.html';
      }, 700);
    } else {
      showToast('⚠️ Compte artisan non trouvé. Veuillez vous inscrire.');
    }
  } else {
    // Connexion Client
    localStorage.setItem('proxitchad_active_role', 'client');
    closeModal('modalConnexion');
    showToast('✅ Connexion réussie ! Redirection...');
    setTimeout(() => {
      window.location.href = isInsidePages ? 'client.html' : 'pages/client.html';
    }, 700);
  }
}


// Gestion du téléversement et compression de photo de profil pour prestataire
function handleProPhotoSelect(event, previewImgId, placeholderId, hiddenInputId, badgeId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  // Validation type
  if (!file.type.match('image.*')) {
    alert("Veuillez sélectionner un fichier image valide (JPG, PNG).");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Compression via Canvas pour LocalStorage optimisé (max 400x400)
      const canvas = document.createElement('canvas');
      const maxDim = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

      // Mise à jour de l'aperçu
      const previewEl = document.getElementById(previewImgId);
      const placeholderEl = document.getElementById(placeholderId);
      const hiddenInput = document.getElementById(hiddenInputId);
      const badgeEl = badgeId ? document.getElementById(badgeId) : null;

      if (previewEl) {
        previewEl.src = compressedDataUrl;
        previewEl.style.display = 'block';
      }
      if (placeholderEl) {
        placeholderEl.style.display = 'none';
      }
      if (hiddenInput) {
        hiddenInput.value = compressedDataUrl;
      }
      if (badgeEl) {
        badgeEl.style.display = 'inline-flex';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Réinitialiser la photo choisie
function resetProPhoto(previewImgId, placeholderId, hiddenInputId, fileInputId, badgeId) {
  const previewEl = document.getElementById(previewImgId);
  const placeholderEl = document.getElementById(placeholderId);
  const hiddenInput = document.getElementById(hiddenInputId);
  const fileInput = document.getElementById(fileInputId);
  const badgeEl = badgeId ? document.getElementById(badgeId) : null;

  if (previewEl) {
    previewEl.src = '';
    previewEl.style.display = 'none';
  }
  if (placeholderEl) {
    placeholderEl.style.display = 'flex';
  }
  if (hiddenInput) {
    hiddenInput.value = '';
  }
  if (fileInput) {
    fileInput.value = '';
  }
  if (badgeEl) {
    badgeEl.style.display = 'none';
  }
}

function handleInscriptionSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  // Extraction des champs du formulaire
  const nameInput = form.querySelector('[name="proName"]') || form.querySelector('input[type="text"]');
  const companyInput = form.querySelector('[name="proCompany"]');
  const catSelect = form.querySelector('select');
  const phoneInput = form.querySelector('input[type="tel"]');
  const citySelect = form.querySelector('[name="proCity"]');
  const quartierInput = form.querySelector('[name="proQuartier"]');
  const descTextarea = form.querySelector('textarea');
  const passwordInput = form.querySelector('[name="proPassword"]') || form.querySelector('input[type="password"]');
  const photoHidden = form.querySelector('input[type="hidden"][name="proPhotoBase64"]') || form.querySelector('#proPhotoBase64');

  const proData = {
    name: nameInput ? nameInput.value : "Artisan ProxiTchad",
    companyName: companyInput ? companyInput.value : (nameInput ? nameInput.value : ""),
    category: catSelect ? catSelect.value : "Bâtiment",
    phone: phoneInput ? phoneInput.value : "+235 66 00 00 00",
    password: passwordInput ? passwordInput.value : "123456",
    city: citySelect ? citySelect.value : "N'Djamena",
    quartier: quartierInput ? quartierInput.value : "Sabangali",
    description: descTextarea ? descTextarea.value : "Prestataire professionnel inscrit sur ProxiTchad.",
    photo: (photoHidden && photoHidden.value) ? photoHidden.value : "images/rachid.jpg"
  };

  // Enregistrement dans le State LocalStorage (statut en_attente_ia par défaut)
  let newPro = null;
  if (typeof registerNewProvider === 'function') {
    newPro = registerNewProvider(proData);
  }

  closeModal('modalInscription');
  showToast('🤖 Candidature transmise ! L\'IA KHIDMA Tchad procède à la vérification de votre compte...');

  const isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
  const targetProUrl = isInsidePages ? 'pro.html' : 'pages/pro.html';

  setTimeout(() => {
    window.location.href = targetProUrl;
  }, 900);
}

/* ============================================================
   AUTHENTIFICATION SOCIALE (GOOGLE & FACEBOOK) & SESSION
============================================================ */

let currentOAuthProvider = 'google';
let currentOAuthRole = 'client';

// Déclencher la modale de sélection de compte Google ou Facebook
function handleSocialLogin(provider) {
  currentOAuthProvider = provider || 'google';
  closeModal('modalConnexion');
  renderSocialAuthModal(currentOAuthProvider);
  openModal('modalSocialAuth');
}

// Construction dynamique de la modale d'authentification sociale
function renderSocialAuthModal(provider) {
  let modal = document.getElementById('modalSocialAuth');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalSocialAuth';
    document.body.appendChild(modal);
  }

  const isGoogle = provider === 'google';
  const brandName = isGoogle ? 'Google' : 'Facebook';
  const brandColor = isGoogle ? '#4285F4' : '#1877F2';
  
  const googleIconSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>`;

  const fbIconSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>`;

  modal.innerHTML = `
    <div class="modal-card" style="max-width:440px; border-radius:18px; padding:28px;">
      <button class="modal-close-btn" onclick="closeModal('modalSocialAuth'); openModal('modalConnexion');">✕</button>
      
      <div style="text-align:center; margin-bottom:18px;">
        <div style="display:inline-flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; background:#f8fafc; border:1px solid #e2e8f0; margin-bottom:10px;">
          ${isGoogle ? googleIconSvg : fbIconSvg}
        </div>
        <h3 class="modal-title" style="font-size:19px; margin-bottom:4px;">Connexion avec ${brandName}</h3>
        <p class="modal-sub" style="margin-bottom:0;">Continuer vers <b>KHIDMA Tchad</b></p>
      </div>

      <div style="background:#f1f5f9; border-radius:12px; padding:4px; display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:16px;">
        <button type="button" id="oauthRoleClient" class="btn" style="border-radius:9px; padding:8px; font-size:12px; font-weight:700; ${currentOAuthRole === 'client' ? 'background:#ffffff; color:var(--color-navy-dark); box-shadow:0 2px 6px rgba(0,0,0,0.06);' : 'background:transparent; color:#64748b;'}" onclick="setOAuthRole('client')">
          👤 Compte Client
        </button>
        <button type="button" id="oauthRolePro" class="btn" style="border-radius:9px; padding:8px; font-size:12px; font-weight:700; ${currentOAuthRole === 'pro' ? 'background:#ffffff; color:var(--color-navy-dark); box-shadow:0 2px 6px rgba(0,0,0,0.06);' : 'background:transparent; color:#64748b;'}" onclick="setOAuthRole('pro')">
          🧰 Compte Prestataire
        </button>
      </div>

      <p style="font-size:12px; font-weight:600; color:var(--color-text-muted); margin-bottom:8px;">
        ${isGoogle ? 'Sélectionnez un compte Google enregistré :' : 'Connectez-vous avec votre profil Facebook :'}
      </p>

      <div class="oauth-account-list">
        <button type="button" class="oauth-account-item" onclick="executeSocialAuth('${provider}', 'Danis Kiss', 'daniskiss@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" class="oauth-avatar" alt="Avatar">
          <div style="flex:1;">
            <div class="oauth-account-name">Danis Kiss</div>
            <div class="oauth-account-email">${isGoogle ? 'daniskiss@gmail.com' : 'Profil Facebook vérifié'}</div>
          </div>
          <span style="font-size:12px; color:var(--color-blue); font-weight:700;">Connecter →</span>
        </button>

        <button type="button" class="oauth-account-item" onclick="executeSocialAuth('${provider}', 'Mahamat Nour', 'mahamat.artisan@gmail.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80')">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" class="oauth-avatar" alt="Avatar">
          <div style="flex:1;">
            <div class="oauth-account-name">Mahamat Nour (Artisan)</div>
            <div class="oauth-account-email">${isGoogle ? 'mahamat.artisan@gmail.com' : 'Profil Facebook actif'}</div>
          </div>
          <span style="font-size:12px; color:var(--color-blue); font-weight:700;">Connecter →</span>
        </button>
      </div>

      <div style="border-top:1px solid #e2e8f0; padding-top:14px; margin-top:8px;">
        <form onsubmit="handleCustomSocialAuthSubmit(event, '${provider}')" style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:11.5px; font-weight:700; color:var(--color-navy-dark);">Ou entrer une adresse e-mail ${brandName} personnalisée :</label>
          <div style="display:flex; gap:6px;">
            <input type="text" id="customSocialEmailInput" class="form-control" placeholder="${isGoogle ? 'votre-nom@gmail.com' : 'votre-nom sur Facebook'}" style="padding:9px 12px; font-size:12.5px;" required>
            <button type="submit" class="btn btn-yellow" style="padding:9px 16px; font-size:12px; white-space:nowrap;">Valider</button>
          </div>
        </form>
      </div>

      <div id="oauthLoadingNotice" style="display:none; text-align:center; padding:12px; margin-top:14px; background:#eff6ff; border-radius:10px; font-size:12.5px; color:#1d4ed8; font-weight:600;">
        ⏳ Authentification sécurisée ${brandName} en cours...
      </div>
    </div>
  `;
}

// Basculer le rôle dans la modale OAuth
function setOAuthRole(role) {
  currentOAuthRole = role;
  const btnClient = document.getElementById('oauthRoleClient');
  const btnPro = document.getElementById('oauthRolePro');
  if (btnClient && btnPro) {
    if (role === 'client') {
      btnClient.style.background = '#ffffff';
      btnClient.style.color = 'var(--color-navy-dark)';
      btnClient.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
      btnPro.style.background = 'transparent';
      btnPro.style.color = '#64748b';
      btnPro.style.boxShadow = 'none';
    } else {
      btnPro.style.background = '#ffffff';
      btnPro.style.color = 'var(--color-navy-dark)';
      btnPro.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
      btnClient.style.background = 'transparent';
      btnClient.style.color = '#64748b';
      btnClient.style.boxShadow = 'none';
    }
  }
}

// Traitement personnalisé du formulaire
function handleCustomSocialAuthSubmit(e, provider) {
  e.preventDefault();
  const input = document.getElementById('customSocialEmailInput');
  const val = input ? input.value.trim() : '';
  if (!val) return;
  const name = val.split('@')[0] || val;
  const email = val.includes('@') ? val : `${val}@${provider === 'google' ? 'gmail.com' : 'facebook.com'}`;
  executeSocialAuth(provider, name, email, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
}

// Exécuter la connexion sociale avec succès et feedback
function executeSocialAuth(provider, name, email, avatar) {
  const loadingEl = document.getElementById('oauthLoadingNotice');
  if (loadingEl) {
    loadingEl.style.display = 'block';
  }

  const role = currentOAuthRole || 'client';
  const isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');

  const userSession = {
    name: name,
    email: email,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    provider: provider,
    role: role,
    connectedAt: new Date().toISOString()
  };

  localStorage.setItem('khidma_auth_user', JSON.stringify(userSession));
  localStorage.setItem('proxitchad_active_role', role);

  if (role === 'pro') {
    const pros = (typeof getAllProviders === 'function') ? getAllProviders() : [];
    if (pros.length > 0) {
      localStorage.setItem('proxitchad_current_pro_id', String(pros[0].id));
    }
  }

  setTimeout(() => {
    closeModal('modalSocialAuth');
    checkAuthStatus();
    showToast(`🎉 Bienvenue ${name} ! Connecté via ${provider === 'google' ? 'Google' : 'Facebook'}.`);
    
    // Si l'utilisateur est déjà sur la page devenir-prestataire.html, déverrouiller immédiatement le formulaire
    if (typeof updateDevenirPrestataireAuthState === 'function') {
      updateDevenirPrestataireAuthState();
      return;
    }

    const pendingRedirect = sessionStorage.getItem('khidma_redirect_after_login');
    if (pendingRedirect) {
      sessionStorage.removeItem('khidma_redirect_after_login');
      setTimeout(() => {
        window.location.href = pendingRedirect;
      }, 700);
      return;
    }

    // Sinon redirection selon rôle
    setTimeout(() => {
      if (role === 'pro') {
        window.location.href = isInsidePages ? 'pro.html' : 'pages/pro.html';
      } else {
        window.location.href = isInsidePages ? 'client.html' : 'pages/client.html';
      }
    }, 900);
  }, 750);
}

// Navigation directe vers la page d'inscription Devenir Prestataire
function handleDevenirPrestataireClick(event) {
  return true;
}

// Vérifier et actualiser les boutons du header en fonction de la session active
function checkAuthStatus() {
  const sessionData = localStorage.getItem('khidma_auth_user');
  const user = sessionData ? JSON.parse(sessionData) : null;
  
  const connexionBtns = document.querySelectorAll('.btn-connexion');
  connexionBtns.forEach(btn => {
    if (user) {
      btn.outerHTML = `
        <div class="user-logged-badge" id="headerUserBadge" onclick="showUserAccountModal()" title="Compte connecté : ${user.name}">
          <img src="${user.avatar}" class="user-logged-avatar" alt="${user.name}">
          <span>${user.name.split(' ')[0]}</span>
          <span style="font-size:10px; opacity:0.8;">▾</span>
        </div>
      `;
    }
  });

  // Mettre à jour aussi dans le drawer mobile si présent
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileDrawer && user) {
    const drawerLogin = mobileDrawer.querySelector('.btn-outline-white');
    if (drawerLogin && drawerLogin.textContent.includes('Connexion')) {
      drawerLogin.outerHTML = `
        <button class="btn btn-outline-white" style="font-size:12px; padding:7px 12px; border-color:var(--color-yellow); color:var(--color-yellow);" onclick="toggleMobileDrawer(false); showUserAccountModal();">
          👤 ${user.name.split(' ')[0]} (${user.role === 'pro' ? 'Pro' : 'Client'})
        </button>
      `;
    }
  }
}

// Modale de gestion du profil connecté et Déconnexion
function showUserAccountModal() {
  const sessionData = localStorage.getItem('khidma_auth_user');
  if (!sessionData) {
    openModal('modalConnexion');
    return;
  }
  const user = JSON.parse(sessionData);

  let modal = document.getElementById('modalUserAccount');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalUserAccount';
    document.body.appendChild(modal);
  }

  const isInsidePages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');

  modal.innerHTML = `
    <div class="modal-card" style="max-width:400px; text-align:center; border-radius:18px; padding:28px;">
      <button class="modal-close-btn" onclick="closeModal('modalUserAccount')">✕</button>
      
      <div style="position:relative; display:inline-block; margin-bottom:14px;">
        <img src="${user.avatar}" alt="${user.name}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid var(--color-yellow); box-shadow:0 4px 14px rgba(0,0,0,0.12);">
        <span style="position:absolute; bottom:0; right:0; background:#22c55e; width:16px; height:16px; border-radius:50%; border:2px solid #ffffff;" title="En ligne"></span>
      </div>

      <h3 class="modal-title" style="margin-bottom:2px; font-size:18px;">${user.name}</h3>
      <p style="font-size:12.5px; color:var(--color-text-muted); margin-bottom:12px;">${user.email}</p>
      
      <div style="display:inline-flex; align-items:center; gap:6px; background:#eff6ff; color:#1d4ed8; padding:5px 12px; border-radius:20px; font-size:11.5px; font-weight:700; margin-bottom:20px;">
        <span>✓ Connecté via ${user.provider === 'google' ? 'Google' : (user.provider === 'facebook' ? 'Facebook' : 'Compte')}</span>
        <span>•</span>
        <span>${user.role === 'pro' ? '🧰 Prestataire' : '👤 Client'}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
        <a href="${isInsidePages ? (user.role === 'pro' ? 'pro.html' : 'client.html') : (user.role === 'pro' ? 'pages/pro.html' : 'pages/client.html')}" class="btn btn-yellow" style="padding:11px; font-size:13px; text-decoration:none;">
          Accéder à mon espace ${user.role === 'pro' ? 'Professionnel 🧰' : 'Client 👤'} →
        </a>
        <a href="${isInsidePages ? (user.role === 'pro' ? 'client.html' : 'pro.html') : (user.role === 'pro' ? 'pages/client.html' : 'pages/pro.html')}" class="btn btn-outline-white" style="background:#f1f5f9; color:var(--color-navy-dark); border-color:#e2e8f0; padding:10px; font-size:12.5px; text-decoration:none;">
          Basculer vers l'espace ${user.role === 'pro' ? 'Client' : 'Prestataire'}
        </a>
      </div>

      <button type="button" class="btn" style="width:100%; padding:10px; background:#fee2e2; color:#dc2626; border-radius:10px; font-size:12.5px; font-weight:700;" onclick="logoutUser()">
        🚪 Se déconnecter de KHIDMA Tchad
      </button>
    </div>
  `;

  openModal('modalUserAccount');
}

// Déconnexion complète
function logoutUser() {
  if (window.KhidmaAPI && window.KhidmaAPI.session) {
    window.KhidmaAPI.session.clearSession();
  }
  localStorage.removeItem('khidma_auth_user');
  localStorage.removeItem('khidma_current_user');
  localStorage.removeItem('khidma_jwt_token');
  localStorage.removeItem('khidma_user_role');
  localStorage.removeItem('proxitchad_active_role');
  localStorage.removeItem('proxitchad_current_pro_id');
  localStorage.removeItem('KHIDMA Tchad_active_role');
  localStorage.removeItem('KHIDMA Tchad_current_pro_id');
  closeModal('modalUserAccount');
  showToast('👋 Vous avez été déconnecté avec succès.');
  setTimeout(() => {
    window.location.reload();
  }, 700);
}

// Initialiser la détection de session au chargement
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});



