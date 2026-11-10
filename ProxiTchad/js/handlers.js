/**
 * KHIDMA TCHAD - GESTIONNAIRE DES FORMULAIRES & INTERACTIONS BACKEND v2.0
 * Connecte tous les formulaires HTML au backend API réel
 * Remplace/surcharge les handlers legacy de modals.js
 */

// ============================================================
// SURCHARGE DE handleConnexionSubmit — Connexion réelle via API
// ============================================================
const _originalHandleConnexionSubmit = window.handleConnexionSubmit;

window.handleConnexionSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const role = document.getElementById('loginRoleInput')?.value || 'pro';
  const identifier = (form.querySelector('[name="identifier"]')?.value || '').trim();
  const password = (form.querySelector('[name="password"]')?.value || '').trim();
  const btn = document.getElementById('btnLoginSubmit');

  if (!identifier || !password) {
    showToast('⚠️ Veuillez entrer votre identifiant et votre mot de passe.');
    return;
  }

  // Indicateur de chargement
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Connexion en cours...'; }

  try {
    const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

    if (isOnline) {
      // Connexion via l'API backend
      const result = await window.KhidmaAPI.auth.login(identifier, password, role);

      if (btn) { btn.disabled = false; btn.textContent = originalText; }

      if (!result.success) {
        showToast(`❌ ${result.error || 'Connexion échouée. Vérifiez vos identifiants.'}`);
        return;
      }

      const { user, role: userRole } = result.data;
      closeModal('modalConnexion');
      showToast(`✅ Bienvenue ${user.name || user.companyName} ! Connexion réussie.`);

      setTimeout(() => {
        const isPages = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
        const pendingRedirect = sessionStorage.getItem('khidma_redirect_after_login');

        if (pendingRedirect) {
          sessionStorage.removeItem('khidma_redirect_after_login');
          window.location.href = pendingRedirect;
          return;
        }

        if (userRole === 'admin') {
          window.location.href = isPages ? 'admin.html' : 'pages/admin.html';
          return;
        }

        if (typeof updateDevenirPrestataireAuthState === 'function' && window.location.pathname.includes('devenir-prestataire')) {
          updateDevenirPrestataireAuthState();
          return;
        }

        if (userRole === 'pro') {
          window.location.href = isPages ? 'pro.html' : 'pages/pro.html';
        } else {
          window.location.href = isPages ? 'client.html' : 'pages/client.html';
        }
      }, 900);

    } else {
      // Fallback : Connexion locale (mode hors-ligne)
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      if (typeof _originalHandleConnexionSubmit === 'function') {
        _originalHandleConnexionSubmit(e);
      } else {
        // Connexion locale simplifiée
        const pros = typeof getAllProviders === 'function' ? getAllProviders() : [];
        const cleanInput = identifier.replace(/[^0-9]/g, '');
        let found = pros.find(p => {
          const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
          return cleanPhone.includes(cleanInput) || (p.name || '').toLowerCase().includes(identifier.toLowerCase());
        });

        if (found || role === 'client') {
          if (found) {
            localStorage.setItem('proxitchad_current_pro_id', String(found.id));
            localStorage.setItem('proxitchad_active_role', 'pro');
          } else {
            localStorage.setItem('proxitchad_active_role', 'client');
          }
          closeModal('modalConnexion');
          showToast(`✅ Mode hors-ligne : connexion simulée.`);
          const isPages = window.location.pathname.includes('/pages/');
          setTimeout(() => {
            window.location.href = role === 'client'
              ? (isPages ? 'client.html' : 'pages/client.html')
              : (isPages ? 'pro.html' : 'pages/pro.html');
          }, 900);
        } else {
          showToast('❌ Numéro introuvable en mode hors-ligne.');
        }
      }
    }
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
    showToast('❌ Erreur de connexion : ' + err.message);
  }
};

// ============================================================
// SURCHARGE DE handleDemandeSubmit — Création de demande réelle
// ============================================================
const _originalHandleDemandeSubmit = window.handleDemandeSubmit;

window.handleDemandeSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;

  const clientName = form.querySelector('[name="clientName"]')?.value || 'Client KHIDMA';
  const title = form.querySelector('[name="title"]')?.value || '';
  const category = form.querySelector('[name="category"]')?.value || 'Bâtiment';
  const urgency = form.querySelector('[name="urgency"]')?.value || 'Dans les 48 heures';
  const city = form.querySelector('[name="city"]')?.value || "N'Djamena";
  const quartier = form.querySelector('[name="quartier"]')?.value || 'Centre';
  const budget = form.querySelector('[name="budget"]')?.value || '15 000 — 30 000 FCFA';
  const description = form.querySelector('textarea')?.value || '';
  const clientPhone = form.querySelector('input[type="tel"]')?.value || '+235 66 00 00 00';

  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Publication en cours...'; }

  const demandeData = {
    clientName, title: title || `Demande de ${category} (${quartier})`,
    category, urgency, city, quartier, budget, description, clientPhone
  };

  try {
    let newDemande;
    const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

    if (isOnline) {
      const result = await window.KhidmaAPI.demandes.create(demandeData);
      if (result.success) {
        newDemande = result.data;
      } else {
        throw new Error(result.error || 'Erreur création demande');
      }
    } else {
      // Fallback LocalStorage
      if (typeof createDemande === 'function') {
        newDemande = createDemande(demandeData);
      }
    }

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    closeModal('modalDemande');
    closeModal('modalClientNewDemand');

    const isPublierPage = window.location.pathname.includes('publier-demande') || window.location.href.includes('publier-demande');

    if (isPublierPage) {
      showToast('🎉 Demande publiée ! Redirection vers votre Espace Client...');
      setTimeout(() => { window.location.href = 'client.html'; }, 1200);
    } else {
      showToast('🎉 Votre demande a été publiée ! Les artisans vont recevoir une notification.');
      form.reset();
      if (typeof renderHomepageMissions === 'function') {
        setTimeout(() => renderHomepageMissions(), 500);
      }
      if (typeof renderClientDemandes === 'function') {
        setTimeout(() => renderClientDemandes(), 500);
      }
    }

  } catch (err) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    showToast('❌ Erreur : ' + err.message);
  }
};

// ============================================================
// SURCHARGE DE handleInscriptionSubmit — Inscription prestataire réelle
// ============================================================
window.handleInscriptionSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;

  const name = (form.querySelector('[name="proName"]')?.value || '').trim();
  const companyName = (form.querySelector('[name="proCompany"]')?.value || name).trim();
  const category = form.querySelector('[name="proCategory"]')?.value || '';
  const experienceYears = form.querySelector('[name="proExperience"]')?.value || '3 à 5 ans';
  const phone = (form.querySelector('[name="proPhone"]')?.value || '').trim();
  const email = (form.querySelector('[name="proEmail"]')?.value || '').trim();
  const city = form.querySelector('[name="proCity"]')?.value || "N'Djamena";
  const quartier = (form.querySelector('[name="proQuartier"]')?.value || '').trim();
  const tarifIndicatif = (form.querySelector('[name="proTarif"]')?.value || '').trim();
  const description = (form.querySelector('[name="proDescription"]')?.value || '').trim();
  const password = form.querySelector('[name="proPassword"]')?.value || '12345';
  const photo = document.getElementById('proPagePhotoBase64')?.value || '';
  const cniNumber = (form.querySelector('[name="proCniNumber"]')?.value || '').trim();
  const cniPhoto = document.getElementById('proPageCniBase64')?.value || '';

  // Récupération des réalisations (photos de chantiers facultatives)
  let realisationsPhotos = [];
  if (window.proRealisationsList && Array.isArray(window.proRealisationsList)) {
    realisationsPhotos = window.proRealisationsList;
  } else {
    try {
      const rawRealisations = document.getElementById('proRealisationsJson')?.value;
      if (rawRealisations) realisationsPhotos = JSON.parse(rawRealisations);
    } catch(err) { realisationsPhotos = []; }
  }

  if (!name || !phone || !category) {
    showToast('⚠️ Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Métier).');
    return;
  }

  // Vérification obligatoire de la Carte Nationale d'Identité
  if (!cniNumber) {
    showToast('⚠️ Le numéro de Carte Nationale d\'Identité (CNI) est obligatoire pour proposer vos services.');
    const cniInput = form.querySelector('[name="proCniNumber"]');
    if (cniInput) { cniInput.focus(); cniInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }

  const submitBtn = form.querySelector('[type="submit"]') || document.getElementById('btnSubmitRegistration');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Enregistrement & transmission CNI...'; }

  try {
    const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();
    let newPro;

    const payload = {
      name, companyName, category, phone, email, city, quartier,
      tarifIndicatif, experienceYears, description, password,
      photo: photo || null,
      cniNumber, cniPhoto: cniPhoto || null,
      realisationsPhotos,
      role: `${category.split('&')[0].trim()}`
    };

    if (isOnline) {
      const result = await window.KhidmaAPI.providers.register(payload);

      if (!result.success) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        showToast(`❌ ${result.error || 'Erreur lors de l\'inscription.'}`);
        return;
      }
      newPro = result.data.user;
    } else {
      // Fallback LocalStorage
      if (typeof registerNewProvider === 'function') {
        newPro = registerNewProvider(payload);
      }
    }

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }

    showToast(`🎉 Candidature reçue ! CNI N° ${cniNumber} transmise à l'administrateur.`);

    // Afficher le panneau d'audit IA si disponible
    _showAiAuditResult(newPro);

    setTimeout(() => {
      window.location.href = 'pro.html';
    }, 2800);

  } catch (err) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    showToast('❌ Erreur : ' + err.message);
  }
};

// Afficher le résultat de l'audit IA après inscription
function _showAiAuditResult(pro) {
  const audit = pro && pro.aiAudit;
  if (!audit) return;

  const container = document.getElementById('proRegistrationFormContainer');
  if (!container) return;

  const score = audit.score || 94;
  const statusColor = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#ef4444';
  const statusText = score >= 90 ? '✅ Dossier complet — En attente de validation Administrateur' : score >= 75 ? '⚠️ À examiner par l\'administrateur' : '❌ Insuffisant';

  container.innerHTML = `
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:2px solid #86efac; border-radius:18px; padding:28px; text-align:center; animation:fadeUp 0.5s ease;">
      <div style="font-size:50px; margin-bottom:12px;">🪪</div>
      <h3 style="font-size:20px; font-weight:800; color:#14532d; margin-bottom:8px;">Dossier & Carte Nationale d'Identité Transmis !</h3>
      <div style="background:#ffffff; border-radius:12px; padding:16px; margin:16px 0; border:1px solid #bbf7d0;">
        <div style="font-size:38px; font-weight:900; color:${statusColor};">${score}%</div>
        <div style="font-size:13px; color:#166534; font-weight:700;">${statusText}</div>
        <div style="font-size:12px; color:#374151; margin-top:8px; line-height:1.5;">${audit.summary || 'Profil vérifié par IA.'}</div>
        <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:8px; padding:8px 12px; margin-top:10px; font-size:11.5px; color:#92400e; font-weight:700;">
          ⏳ Votre Carte Nationale (N° ${pro.cniNumber || 'enregistrée'}) est soumise à la vérification de l'administrateur. Dès son accord, vous pourrez proposer vos services et envoyer des devis.
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin:12px 0;">
        <div style="background:${audit.phoneChecked ? '#f0fdf4' : '#fef2f2'}; border-radius:8px; padding:10px; border:1px solid ${audit.phoneChecked ? '#bbf7d0' : '#fecaca'};">
          <div style="font-size:16px;">${audit.phoneChecked ? '✅' : '❌'}</div>
          <div style="font-size:11px; font-weight:700; color:#374151;">Téléphone +235</div>
          <div style="font-size:10px; color:#6b7280;">${audit.phoneNetwork || 'N/A'}</div>
        </div>
        <div style="background:#f0fdf4; border-radius:8px; padding:10px; border:1px solid #bbf7d0;">
          <div style="font-size:16px;">🪪</div>
          <div style="font-size:11px; font-weight:700; color:#374151;">Carte Nationale</div>
          <div style="font-size:10px; color:#15803d; font-weight:800;">${pro.cniNumber || 'Fournie'}</div>
        </div>
        <div style="background:${audit.geoChecked ? '#f0fdf4' : '#fef2f2'}; border-radius:8px; padding:10px; border:1px solid ${audit.geoChecked ? '#bbf7d0' : '#fecaca'};">
          <div style="font-size:16px;">${audit.geoChecked ? '✅' : '⚠️'}</div>
          <div style="font-size:11px; font-weight:700; color:#374151;">Localisation</div>
          <div style="font-size:10px; color:#6b7280;">${pro.city || "N'Djamena"}</div>
        </div>
      </div>
      <p style="font-size:13px; color:#166534; font-weight:600;">Redirection vers votre tableau de bord dans 3 secondes...</p>
    </div>
  `;
}

// ============================================================
// SURCHARGE DE handleQuickApplySubmit — Soumission devis via API
// ============================================================
const _originalHandleQuickApplySubmit = window.handleQuickApplySubmit;

window.handleQuickApplySubmit = async function(e) {
  e.preventDefault();

  // Contrôle strict de vérification du prestataire
  const currentPro = (typeof getCurrentPro === 'function') ? getCurrentPro() : (window.KhidmaAPI?.session.getUser());
  if (currentPro && (!currentPro.verified || currentPro.applicationStatus !== 'valide')) {
    showToast("⚠️ Action impossible : Votre Carte Nationale d'Identité doit d'abord être vérifiée et validée par l'administrateur avant de proposer vos services.");
    return;
  }

  const demandeId = document.getElementById('quickApplyDemandeId')?.value;
  const proName = document.getElementById('quickApplyProName')?.value;
  const proPhone = document.getElementById('quickApplyProPhone')?.value;
  const amount = document.getElementById('quickApplyAmount')?.value;
  const delay = document.getElementById('quickApplyDelay')?.value;
  const message = document.getElementById('quickApplyMessage')?.value;

  const btn = e.target.querySelector('[type="submit"]');
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi en cours...'; }

  try {
    const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

    if (isOnline) {
      const result = await window.KhidmaAPI.quotes.submit(demandeId, {
        proName, proPhone, amount, delay, message
      });

      if (!result.success) {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        showToast(`❌ ${result.error || 'Erreur lors de l\'envoi du devis.'}`);
        return;
      }
    } else {
      // Fallback LocalStorage
      if (typeof submitProQuote === 'function') {
        const quoteRes = submitProQuote(demandeId, { proName, proPhone, amount, delay, message, proRating: 4.9, proReviews: 60 });
        if (!quoteRes) {
          if (btn) { btn.disabled = false; btn.textContent = originalText; }
          return;
        }
      }
    }

    if (btn) { btn.disabled = false; btn.textContent = originalText; }
    closeModal('modalQuickApply');
    showToast(`🎉 Candidature (${amount}) transmise avec succès !`);

    // Rafraîchir les vues
    setTimeout(() => {
      if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
      if (typeof renderProDashboard === 'function') renderProDashboard();
      if (typeof renderClientDemandes === 'function') renderClientDemandes();
    }, 500);

  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
    showToast('❌ Erreur : ' + err.message);
  }
};
};

// ============================================================
// SURCHARGE DE handleProLogout — Déconnexion sécurisée
// ============================================================
window.handleProLogout = function() {
  if (window.KhidmaAPI) {
    window.KhidmaAPI.session.clearSession();
  } else {
    localStorage.removeItem('proxitchad_current_pro_id');
    localStorage.removeItem('proxitchad_active_role');
  }
  showToast('👋 Vous avez été déconnecté.');
  setTimeout(() => { window.location.href = '../index.html'; }, 900);
};

// ============================================================
// SURCHARGE handleAdminSimulatePro — Simulation admin via API
// ============================================================
const _originalHandleAdminSimulatePro = window.handleAdminSimulatePro;

window.handleAdminSimulatePro = async function() {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

  if (isOnline) {
    showToast('⏳ Génération d\'une candidature simulée...');
    const result = await window.KhidmaAPI.providers.simulate();
    if (result.success) {
      showToast(`✅ Candidature simulée : ${result.data.provider.name} — Score IA: ${result.data.provider.aiAudit?.score || '94'}%`);
      if (typeof renderAdminDashboard === 'function') {
        setTimeout(() => renderAdminDashboard(), 500);
      }
    } else {
      showToast(`❌ ${result.error || 'Erreur simulation.'}`);
    }
  } else {
    if (typeof _originalHandleAdminSimulatePro === 'function') _originalHandleAdminSimulatePro();
    else if (typeof simulatePendingProvider === 'function') simulatePendingProvider();
    showToast('⚡ Candidature simulée en mode hors-ligne.');
    if (typeof renderAdminDashboard === 'function') setTimeout(() => renderAdminDashboard(), 500);
  }
};

// ============================================================
// SURCHARGE toggleProviderVerification — Via API
// ============================================================
window.toggleProviderVerification = async function(proId, verified, cniVerified = null) {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

  if (isOnline) {
    const result = await window.KhidmaAPI.providers.verify(proId, verified, cniVerified);
    if (result.success) {
      const status = verified ? 'validé ✅ (Carte d\'Identité certifiée)' : 'refusé / suspendu ❌';
      showToast(`Candidature : Prestataire ${status} !`);
      if (typeof renderAdminDashboard === 'function') setTimeout(() => renderAdminDashboard(), 400);
      return true;
    } else {
      showToast(`❌ ${result.error || 'Erreur de validation.'}`);
      return false;
    }
  } else {
    // Fallback LocalStorage
    const pros = JSON.parse(localStorage.getItem('proxitchad_providers_v2') || '[]');
    const pro = pros.find(p => p.id == proId);
    if (pro) {
      pro.verified = verified;
      pro.cniVerified = cniVerified !== null ? !!cniVerified : !!verified;
      pro.applicationStatus = verified ? 'valide' : 'suspendu';
      localStorage.setItem('proxitchad_providers_v2', JSON.stringify(pros));
    }
    showToast(`Candidature ${verified ? 'validée (CNI approuvée)' : 'refusée/suspendue'} (mode hors-ligne).`);
    if (typeof renderAdminDashboard === 'function') setTimeout(() => renderAdminDashboard(), 400);
    return true;
  }
};

// Gestionnaires de téléversement de la Carte Nationale d'Identité (CNI)
window.handleProCniSelect = function(event, previewId, placeholderId, base64Id, badgeId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    const hiddenInput = document.getElementById(base64Id);
    const badge = document.getElementById(badgeId);

    if (preview) {
      preview.src = dataUrl;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (hiddenInput) hiddenInput.value = dataUrl;
    if (badge) {
      badge.textContent = '✓ Document CNI chargé';
      badge.style.display = 'inline-flex';
    }
    showToast('🪪 Pièce d\'identité CNI chargée avec succès.');
  };
  reader.readAsDataURL(file);
};

window.resetProCni = function(previewId, placeholderId, base64Id, fileInputId, badgeId) {
  const preview = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  const hiddenInput = document.getElementById(base64Id);
  const fileInput = document.getElementById(fileInputId);
  const badge = document.getElementById(badgeId);

  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
  if (hiddenInput) hiddenInput.value = '';
  if (fileInput) fileInput.value = '';
  if (badge) badge.style.display = 'none';
};

// ============================================================
// SURCHARGE acceptQuote — Via API
// ============================================================
window.acceptQuote = async function(demandeId, quoteId) {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

  if (isOnline) {
    const result = await window.KhidmaAPI.demandes.acceptQuote(demandeId, quoteId);
    if (result.success) {
      showToast(`✅ ${result.data.message || 'Devis accepté !'}`);
      if (typeof renderClientDemandes === 'function') setTimeout(() => renderClientDemandes(), 400);
      return true;
    } else {
      showToast(`❌ ${result.error || 'Erreur.'}`);
      return false;
    }
  } else {
    // Fallback LocalStorage
    const demandes = JSON.parse(localStorage.getItem('proxitchad_demandes_v2') || '[]');
    const demande = demandes.find(d => d.id === demandeId);
    if (demande) {
      const quote = (demande.quotes || []).find(q => q.id === quoteId);
      if (quote) {
        quote.status = 'accepte';
        demande.status = 'en_cours';
        demande.agreedProName = quote.proName;
        demande.agreedPrice = quote.amount;
        localStorage.setItem('proxitchad_demandes_v2', JSON.stringify(demandes));
      }
    }
    showToast('✅ Devis accepté (mode hors-ligne).');
    if (typeof renderClientDemandes === 'function') setTimeout(() => renderClientDemandes(), 400);
    return true;
  }
};

// ============================================================
// SURCHARGE completeIntervention — Via API
// ============================================================
window.completeIntervention = async function(demandeId) {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

  if (isOnline) {
    const result = await window.KhidmaAPI.demandes.complete(demandeId);
    if (result.success) {
      showToast('✅ Intervention marquée comme terminée !');
      if (typeof renderClientDemandes === 'function') setTimeout(() => renderClientDemandes(), 400);
      return true;
    }
  }
  // Fallback
  const demandes = JSON.parse(localStorage.getItem('proxitchad_demandes_v2') || '[]');
  const demande = demandes.find(d => d.id === demandeId);
  if (demande) {
    demande.status = 'terminee';
    localStorage.setItem('proxitchad_demandes_v2', JSON.stringify(demandes));
  }
  showToast('✅ Intervention terminée (mode hors-ligne).');
  if (typeof renderClientDemandes === 'function') setTimeout(() => renderClientDemandes(), 400);
  return true;
};

// ============================================================
// SURCHARGE submitClientReview — Via API
// ============================================================
window.submitClientReview = async function(demandeId, rating, comment) {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();

  if (isOnline) {
    const result = await window.KhidmaAPI.demandes.submitReview(demandeId, rating, comment);
    return result.success;
  }
  // Fallback LocalStorage
  const demandes = JSON.parse(localStorage.getItem('proxitchad_demandes_v2') || '[]');
  const demande = demandes.find(d => d.id === demandeId);
  if (demande) {
    demande.review = { rating: parseInt(rating) || 5, comment: comment || '', date: "À l'instant" };
    localStorage.setItem('proxitchad_demandes_v2', JSON.stringify(demandes));
  }
  return true;
};

// ============================================================
// SURCHARGE handleProChangePhoto — Via API
// ============================================================
window.handleProChangePhoto = async function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const img = new Image();
    img.onload = async function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400;
      let { width, height } = img;
      if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
      else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

      // Mettre à jour l'affichage
      const avatar = document.getElementById('proProfileAvatar');
      if (avatar) avatar.src = dataUrl;

      // Sauvegarder via API
      const user = window.KhidmaAPI?.session.getUser();
      const proId = user?.id || localStorage.getItem('proxitchad_current_pro_id');

      const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();
      if (isOnline && proId) {
        await window.KhidmaAPI.providers.updatePhoto(proId, dataUrl);
        showToast('📷 Photo de profil mise à jour !');
      } else {
        // Fallback localStorage
        if (typeof updateCurrentProPhoto === 'function') updateCurrentProPhoto(dataUrl);
        showToast('📷 Photo mise à jour localement.');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// ============================================================
// SURCHARGE toggleProAvailability — Via API
// ============================================================
window.toggleProAvailability = async function() {
  const pill = document.getElementById('proAvailabilityPill');
  const dot = document.getElementById('proAvailabilityDot');
  const text = document.getElementById('proAvailabilityText');

  const currentlyAvailable = text && text.textContent.trim() === 'Disponible';
  const newAvailability = !currentlyAvailable;

  // Mise à jour UI immédiate
  if (text) text.textContent = newAvailability ? 'Disponible' : 'Indisponible';
  if (pill) {
    pill.style.background = newAvailability ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)';
    pill.style.borderColor = newAvailability ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)';
  }
  if (dot) {
    dot.style.background = newAvailability ? '#22c55e' : '#ef4444';
    dot.style.animation = newAvailability ? 'pulse-ring 2s ease-in-out infinite' : 'none';
  }

  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();
  if (isOnline) {
    const user = window.KhidmaAPI.session.getUser();
    if (user) {
      await window.KhidmaAPI.providers.setAvailability(user.id, newAvailability);
    }
  } else {
    localStorage.setItem('proxitchad_pro_available', newAvailability ? '1' : '0');
  }

  showToast(newAvailability ? '✅ Vous êtes maintenant disponible pour de nouvelles interventions.' : '🔕 Vous êtes maintenant indisponible.');
};

// ============================================================
// SURCHARGE handleSocialLogin — OAuth simulé
// ============================================================
window.handleSocialLogin = function(provider) {
  const mockNames = {
    google: ['Mahamat Hassan', 'Fatimé Zara', 'Rachid Ali', 'Aïcha Moussa'],
    facebook: ['Djibrine Tahir', 'Kaltouma Brahim', 'Ahmat Youssouf', 'Zainab Ali']
  };
  const names = mockNames[provider] || mockNames.google;
  const randomName = names[Math.floor(Math.random() * names.length)];
  const mockPhone = '+235 66 ' + Math.floor(10 + Math.random() * 90) + ' ' + Math.floor(10 + Math.random() * 90) + ' ' + Math.floor(10 + Math.random() * 90);

  // Simuler une session OAuth
  const oauthRole = localStorage.getItem('khidma_oauth_pending_role') || 'client';
  localStorage.removeItem('khidma_oauth_pending_role');

  // Créer une session temporaire
  localStorage.setItem('proxitchad_active_role', oauthRole);
  if (oauthRole === 'pro') {
    // Pré-remplir le formulaire d'inscription si disponible
    const nameInput = document.querySelector('[name="proName"]');
    if (nameInput) nameInput.value = randomName;
    closeModal('modalConnexion');
    showToast(`✅ Compte ${provider === 'google' ? 'Google' : 'Facebook'} lié : ${randomName}. Complétez votre profil ci-dessous.`);
    const badge = document.getElementById('proAuthSuccessBadge');
    const gate = document.getElementById('proAuthRequiredGate');
    const overlay = document.getElementById('proFormLockedOverlay');
    if (badge) { badge.style.display = 'flex'; document.getElementById('connectedUserName').textContent = randomName; }
    if (gate) gate.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  } else {
    closeModal('modalConnexion');
    showToast(`✅ Connecté avec ${provider === 'google' ? 'Google' : 'Facebook'} : ${randomName}`);
    const isPages = window.location.pathname.includes('/pages/');
    setTimeout(() => { window.location.href = isPages ? 'client.html' : 'pages/client.html'; }, 900);
  }
};

window.setOAuthRole = function(role) {
  localStorage.setItem('khidma_oauth_pending_role', role);
};

window.logoutUser = function() {
  if (window.KhidmaAPI) window.KhidmaAPI.session.clearSession();
  else { localStorage.removeItem('proxitchad_current_pro_id'); localStorage.removeItem('proxitchad_active_role'); }
  window.location.reload();
};

// ============================================================
// RÉINITIALISATION DES DONNÉES BACKEND
// Bascule de l'état d'initialisation quand l'API est prête
// ============================================================
window.addEventListener('khidma:api_ready', async function(e) {
  const isOnline = e.detail && e.detail.online;

  if (isOnline) {
    // Synchroniser toutes les données depuis le backend
    try {
      const [providersResult, demandesResult] = await Promise.all([
        window.KhidmaAPI.providers.getAll(),
        window.KhidmaAPI.demandes.getAll()
      ]);

      if (providersResult.success) {
        // Rafraîchir affichages si actifs
        if (typeof renderProvidersGrid === 'function') renderProvidersGrid('providersContainer', false);
        if (typeof updateStatsTrustBadge === 'function') updateStatsTrustBadge();
      }

      if (demandesResult.success) {
        if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
        if (typeof renderClientDemandes === 'function') renderClientDemandes();
        if (typeof renderProDashboard === 'function') renderProDashboard();
        if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
      }

      // Afficher badge de statut connecté
      _showBackendStatusBadge(true);
    } catch (err) {
      console.warn('Synchronisation partielle:', err.message);
    }
  } else {
    _showBackendStatusBadge(false);
  }
});

function _showBackendStatusBadge(online) {
  // Badge discret dans le coin inférieur droit pour indiquer le statut backend
  let badge = document.getElementById('khidma-backend-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'khidma-backend-badge';
    badge.style.cssText = `
      position: fixed; bottom: 80px; right: 16px; z-index: 9999;
      background: ${online ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)'};
      color: #fff; padding: 6px 12px; border-radius: 999px;
      font-size: 11px; font-weight: 700; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      backdrop-filter: blur(8px); transition: all 0.3s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    document.body.appendChild(badge);
    // Auto-masquer après 5 secondes
    setTimeout(() => { if (badge) badge.style.opacity = '0'; }, 5000);
    setTimeout(() => { if (badge) badge.remove(); }, 5500);
  }
  badge.textContent = online ? '🟢 Backend connecté' : '🟡 Mode hors-ligne';
}

console.log('🔌 Handlers formulaires backend chargés.');
