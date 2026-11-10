/**
 * KHIDMA TCHAD - COUCHE API FRONTEND v2.0
 * Connexion réelle avec le backend Node.js/Express
 * Remplace le LocalStorage par de vraies requêtes HTTP
 */

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================
// GESTION DU TOKEN JWT & SESSION
// ============================================================
const KhidmaSession = {
  TOKEN_KEY: 'khidma_jwt_token',
  USER_KEY: 'khidma_current_user',
  ROLE_KEY: 'khidma_user_role',

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUser() { 
    try { 
      const u = localStorage.getItem(this.USER_KEY);
      if (u) return JSON.parse(u);
      const old = localStorage.getItem('khidma_auth_user');
      if (old) return JSON.parse(old);
      return null;
    } 
    catch { return null; } 
  },
  getRole() { 
    return localStorage.getItem(this.ROLE_KEY) || 
      (this.getUser() ? this.getUser().role : null) || 
      localStorage.getItem('proxitchad_active_role'); 
  },
  
  setSession(token, user, role) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ROLE_KEY, role);

    // Synchronisation khidma_auth_user (utilisé par modals.js, header, devenir-prestataire)
    const authUser = {
      id: user.id,
      name: user.name || user.companyName || 'Utilisateur',
      phone: user.phone || '',
      email: user.email || '',
      avatar: user.photo ? (user.photo.startsWith('http') || user.photo.startsWith('data:') ? user.photo : (user.photo.startsWith('../') ? user.photo : '../' + user.photo)) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: role,
      provider: user.provider || 'local',
      connectedAt: new Date().toISOString()
    };
    localStorage.setItem('khidma_auth_user', JSON.stringify(authUser));

    // Compatibilité avec l'ancien système
    if (role === 'pro' || role === 'admin') {
      localStorage.setItem('proxitchad_current_pro_id', String(user.id));
      localStorage.setItem('proxitchad_active_role', role === 'admin' ? 'admin' : 'pro');
      localStorage.setItem('KHIDMA Tchad_current_pro_id', String(user.id));
      localStorage.setItem('KHIDMA Tchad_active_role', role === 'admin' ? 'admin' : 'pro');
    } else {
      localStorage.setItem('proxitchad_active_role', 'client');
      localStorage.setItem('KHIDMA Tchad_active_role', 'client');
    }
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem('khidma_auth_user');
    localStorage.removeItem('proxitchad_current_pro_id');
    localStorage.removeItem('proxitchad_active_role');
    localStorage.removeItem('KHIDMA Tchad_current_pro_id');
    localStorage.removeItem('KHIDMA Tchad_active_role');
  },

  isLoggedIn() { return !!this.getToken() || !!localStorage.getItem('khidma_auth_user'); },
  isAdmin() { return this.getRole() === 'admin'; },
  isPro() { return this.getRole() === 'pro' || this.getRole() === 'admin'; },
  isClient() { return this.getRole() === 'client'; },
};

// ============================================================
// CLIENT HTTP — Gestion des requêtes avec retry & fallback
// ============================================================
let _backendAvailable = null; // null = pas encore testé, true/false = résultat

async function checkBackendHealth() {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      signal: AbortSignal.timeout(2000) 
    });
    _backendAvailable = response.ok;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

async function apiRequest(method, endpoint, data = null, requiresAuth = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  
  const token = KhidmaSession.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || `Erreur ${response.status}`);
    }
    
    return { success: true, data: result };
  } catch (err) {
    if (err.name === 'TypeError' || err.name === 'AbortError' || err.message.includes('fetch')) {
      _backendAvailable = false;
      console.warn('⚠️ Backend non disponible, mode hors-ligne activé');
      return { success: false, offline: true, error: 'Backend non disponible. Données locales utilisées.' };
    }
    return { success: false, error: err.message };
  }
}

// ============================================================
// API AUTHENTIFICATION
// ============================================================
const KhidmaAuth = {
  async login(identifier, password, role = 'pro') {
    const result = await apiRequest('POST', '/auth/login', { identifier, password, role });
    if (result.success) {
      KhidmaSession.setSession(result.data.token, result.data.user, result.data.role);
      // Mettre à jour la liste des providers dans localStorage pour compatibilité
      if (result.data.role === 'pro' || result.data.role === 'admin') {
        _syncProvidersCache();
      }
    }
    return result;
  },

  async registerClient(name, phone, city, quartier, password) {
    const result = await apiRequest('POST', '/auth/register-client', { name, phone, city, quartier, password });
    if (result.success) {
      KhidmaSession.setSession(result.data.token, result.data.user, result.data.role);
    }
    return result;
  },

  logout() {
    KhidmaSession.clearSession();
    window.location.href = '../index.html';
  }
};

// ============================================================
// API PRESTATAIRES
// ============================================================
const KhidmaProviders = {
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL: 30000, // 30 secondes

  async getAll(filters = {}) {
    // Cache frais disponible ?
    if (this._cache && Date.now() - this._cacheTime < this.CACHE_TTL && Object.keys(filters).length === 0) {
      return { success: true, data: this._cache };
    }

    const params = new URLSearchParams(filters).toString();
    const result = await apiRequest('GET', `/providers${params ? '?' + params : ''}`);
    
    if (result.success) {
      this._cache = result.data;
      this._cacheTime = Date.now();
      // Synchroniser avec localStorage pour compatibilité
      localStorage.setItem('proxitchad_providers_v2', JSON.stringify(result.data.map(_mapToLegacyProvider)));
    } else if (result.offline) {
      // Fallback sur LocalStorage
      const local = _getLegacyProviders();
      return { success: true, data: local, offline: true };
    }
    return result;
  },

  async getPending() {
    const result = await apiRequest('GET', '/providers/pending');
    return result;
  },

  async register(data) {
    const result = await apiRequest('POST', '/providers', data);
    if (result.success) {
      this._cache = null; // Invalider le cache
      KhidmaSession.setSession(result.data.token, result.data.user, 'pro');
    }
    return result;
  },

  async verify(proId, verified, cniVerified = null) {
    const payload = { verified };
    if (cniVerified !== null) payload.cniVerified = cniVerified;
    const result = await apiRequest('PUT', `/providers/${proId}/verify`, payload);
    if (result.success) this._cache = null;
    return result;
  },

  async setAvailability(proId, isAvailable) {
    return await apiRequest('PUT', `/providers/${proId}/availability`, { isAvailable });
  },

  async updatePhoto(proId, photoBase64) {
    return await apiRequest('PUT', `/providers/${proId}/photo`, { photoBase64 });
  },

  async simulate() {
    const result = await apiRequest('POST', '/providers/simulate', {});
    if (result.success) this._cache = null;
    return result;
  },

  getCurrentPro() {
    return KhidmaSession.getUser();
  }
};

// ============================================================
// API DEMANDES
// ============================================================
const KhidmaDemandes = {
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL: 10000, // 10 secondes

  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const result = await apiRequest('GET', `/demandes${params ? '?' + params : ''}`);
    
    if (result.success) {
      this._cache = result.data;
      this._cacheTime = Date.now();
      // Synchroniser avec localStorage
      localStorage.setItem('proxitchad_demandes_v2', JSON.stringify(result.data));
    } else if (result.offline) {
      return { success: true, data: _getLegacyDemandes(), offline: true };
    }
    return result;
  },

  async getOne(id) {
    const result = await apiRequest('GET', `/demandes/${id}`);
    return result;
  },

  async create(demandeData) {
    const result = await apiRequest('POST', '/demandes', demandeData);
    if (result.success) {
      this._cache = null;
      // Aussi sauvegarder en localStorage pour compatibilité
      const local = _getLegacyDemandes();
      local.unshift(result.data);
      localStorage.setItem('proxitchad_demandes_v2', JSON.stringify(local));
    } else if (result.offline) {
      // Fallback LocalStorage
      if (typeof createDemande === 'function') {
        const d = createDemande(demandeData);
        return { success: true, data: d, offline: true };
      }
    }
    return result;
  },

  async acceptQuote(demandeId, quoteId) {
    const result = await apiRequest('PUT', `/demandes/${demandeId}/accept-quote`, { quoteId });
    if (result.success) this._cache = null;
    return result;
  },

  async complete(demandeId) {
    const result = await apiRequest('PUT', `/demandes/${demandeId}/complete`, {});
    if (result.success) this._cache = null;
    return result;
  },

  async submitReview(demandeId, rating, comment) {
    return await apiRequest('POST', `/demandes/${demandeId}/review`, { rating, comment });
  }
};

// ============================================================
// API DEVIS
// ============================================================
const KhidmaQuotes = {
  async submit(demandeId, data) {
    const result = await apiRequest('POST', '/quotes', { demandeId, ...data });
    if (result.success) {
      KhidmaDemandes._cache = null;
    } else if (result.offline) {
      if (typeof submitProQuote === 'function') {
        const q = submitProQuote(demandeId, data);
        return { success: true, data: q, offline: true };
      }
    }
    return result;
  }
};

// ============================================================
// API ADMIN
// ============================================================
const KhidmaAdmin = {
  async getStats() {
    const result = await apiRequest('GET', '/admin/stats');
    if (!result.success && result.offline) {
      // Statistiques calculées depuis localStorage
      const demandes = _getLegacyDemandes();
      const providers = _getLegacyProviders();
      return {
        success: true, data: {
          totalProviders: providers.filter(p => p.verified).length,
          pendingProviders: providers.filter(p => !p.verified).length,
          totalDemandes: demandes.length,
          activeDemandesCount: demandes.filter(d => ['en_attente','devis_recus','en_cours'].includes(d.status)).length,
          totalQuotes: demandes.reduce((sum, d) => sum + (d.quotes ? d.quotes.length : 0), 0),
          completedInterventions: demandes.filter(d => d.status === 'terminee').length,
        }, offline: true
      };
    }
    return result;
  },

  async deleteProvider(id) {
    return await apiRequest('DELETE', `/admin/providers/${id}`);
  },

  async deleteDemande(id) {
    return await apiRequest('DELETE', `/admin/demandes/${id}`);
  }
};

// ============================================================
// HELPERS DE COMPATIBILITÉ LEGACY (LocalStorage)
// ============================================================
function _getLegacyProviders() {
  try {
    const stored = localStorage.getItem('proxitchad_providers_v2');
    if (stored) return JSON.parse(stored);
    return typeof PROVIDERS_DATA !== 'undefined' ? PROVIDERS_DATA : [];
  } catch { return []; }
}

function _getLegacyDemandes() {
  try {
    const stored = localStorage.getItem('proxitchad_demandes_v2');
    if (stored) return JSON.parse(stored);
    return typeof INITIAL_DEMANDES !== 'undefined' ? INITIAL_DEMANDES : [];
  } catch { return []; }
}

// Mapper format API vers format legacy
function _mapToLegacyProvider(p) {
  return {
    id: p.id, name: p.name, companyName: p.companyName, category: p.category,
    role: p.role, city: p.city, quartier: p.quartier, phone: p.phone,
    email: p.email || null,
    photo: p.photo, cniNumber: p.cniNumber, cniPhoto: p.cniPhoto, cniVerified: p.cniVerified,
    realisationsPhotos: p.realisationsPhotos || [],
    tarifIndicatif: p.tarifIndicatif || null,
    experienceYears: p.experienceYears || null,
    description: p.description, rating: p.rating,
    reviewsCount: p.reviewsCount, verified: p.verified,
    applicationStatus: p.applicationStatus, isAvailable: p.isAvailable,
    aiAudit: p.aiAudit, registeredAt: p.registeredAt
  };
}

// Syncing des providers depuis API vers LocalStorage
async function _syncProvidersCache() {
  try {
    const result = await apiRequest('GET', '/providers');
    if (result.success) {
      localStorage.setItem('proxitchad_providers_v2', JSON.stringify(result.data.map(_mapToLegacyProvider)));
    }
  } catch (e) { /* Silencieux */ }
}

// ============================================================
// SURCHARGE DES FONCTIONS LEGACY (Bridge Pattern)
// Ces fonctions remplacent les fonctions originales de state.js
// quand le backend est disponible
// ============================================================

// Surcharge de getAllProviders()
const _originalGetAllProviders = typeof getAllProviders !== 'undefined' ? getAllProviders : null;
window.getAllProviders = function() {
  return _getLegacyProviders();
};

// Surcharge de getVerifiedProviders()
window.getVerifiedProviders = function() {
  return _getLegacyProviders().filter(p => p.verified === true);
};

// Surcharge de getAllDemandes()
window.getAllDemandes = function() {
  return _getLegacyDemandes();
};

// Surcharge de createDemande() — version async-safe
window.createDemandeAPI = async function(demandeData) {
  const result = await KhidmaDemandes.create(demandeData);
  if (result.success) return result.data;
  // Fallback synchrone
  if (typeof createDemande === 'function') return createDemande(demandeData);
  return null;
};

// Surcharge de getCurrentPro()
window.getCurrentPro = function() {
  const sessionUser = KhidmaSession.getUser();
  if (sessionUser && (KhidmaSession.isPro() || sessionUser.companyName || sessionUser.category)) {
    return sessionUser;
  }
  const pros = _getLegacyProviders();
  const currentId = localStorage.getItem('proxitchad_current_pro_id') || localStorage.getItem('KHIDMA Tchad_current_pro_id');
  if (currentId) {
    const found = pros.find(p => String(p.id) === String(currentId));
    if (found) return found;
  }
  return pros[0] || null;
};

// Surcharge de submitProQuote() — version async-safe
const _legacySubmitProQuote = typeof submitProQuote === 'function' ? submitProQuote : null;
window.submitProQuote = async function(demandeId, quoteData) {
  const isOnline = window.KhidmaAPI && await window.KhidmaAPI.checkHealth();
  if (isOnline) {
    const result = await KhidmaQuotes.submit(demandeId, quoteData);
    if (result.success) return result.data;
  }
  if (_legacySubmitProQuote) return _legacySubmitProQuote(demandeId, quoteData);
  return null;
};
window.submitProQuoteAPI = window.submitProQuote;

// Surcharge de acceptQuote()
window.acceptQuoteAPI = async function(demandeId, quoteId) {
  const result = await KhidmaDemandes.acceptQuote(demandeId, quoteId);
  if (!result.success) {
    // Fallback LocalStorage
    if (typeof acceptQuote === 'function') acceptQuote(demandeId, quoteId);
  }
  return result.success;
};

// Surcharge de registerNewProvider()
window.registerNewProviderAPI = async function(data) {
  const result = await KhidmaProviders.register(data);
  if (result.success) {
    return result.data.user;
  }
  // Fallback
  if (typeof registerNewProvider === 'function') return registerNewProvider(data);
  return null;
};

// Surcharge de toggleProviderVerification()
window.toggleProviderVerificationAPI = async function(proId, verified) {
  const result = await KhidmaProviders.verify(proId, verified);
  if (!result.success) {
    // Fallback LocalStorage
    if (typeof toggleProviderVerification === 'function') toggleProviderVerification(proId, verified);
  }
  return result.success;
};

// Surcharge de simulatePendingProvider()
window.simulatePendingProviderAPI = async function() {
  const result = await KhidmaProviders.simulate();
  if (result.success) {
    // Rafraîchir le cache local
    await _syncProvidersCache();
    return result.data.provider;
  }
  if (typeof simulatePendingProvider === 'function') return simulatePendingProvider();
  return null;
};

// ============================================================
// INITIALISATION — Chargement en parallèle au démarrage
// ============================================================
(async function initKhidmaAPI() {
  // Vérifier la disponibilité du backend
  const isOnline = await checkBackendHealth();
  
  if (isOnline) {
    console.log('✅ Backend KHIDMA Tchad connecté — Mode API activé');
    
    // Synchroniser les données en arrière-plan
    Promise.all([
      KhidmaProviders.getAll(),
      KhidmaDemandes.getAll()
    ]).then(() => {
      console.log('📊 Données synchronisées depuis le backend.');
      // Rafraîchir les vues si elles sont actives
      if (typeof renderProvidersGrid === 'function') renderProvidersGrid('providersContainer', false);
      if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
      if (typeof renderClientDemandes === 'function') renderClientDemandes();
      if (typeof renderProDashboard === 'function') renderProDashboard();
      if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
    }).catch(err => {
      console.warn('Synchronisation partielle:', err.message);
    });
  } else {
    console.warn('⚠️ Backend non disponible — Mode hors-ligne (LocalStorage)');
  }

  // Exposer globalement
  window.KhidmaAPI = {
    session: KhidmaSession,
    auth: KhidmaAuth,
    providers: KhidmaProviders,
    demandes: KhidmaDemandes,
    quotes: KhidmaQuotes,
    admin: KhidmaAdmin,
    isOnline: () => _backendAvailable,
    checkHealth: checkBackendHealth
  };

  // Déclencher l'événement d'initialisation
  window.dispatchEvent(new CustomEvent('khidma:api_ready', { detail: { online: isOnline } }));
})();
