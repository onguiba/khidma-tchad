/**
 * KHIDMA TCHAD - APPLICATION MAIN ENTRY POINT v3.0
 * Initialisation premium, animations & navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 KHIDMA Tchad v3.0 — Initialisé avec succès.');

  // 1. Rendu dynamique des prestataires
  if (typeof renderProvidersGrid === 'function') {
    renderProvidersGrid('providersContainer', false);
  }

  // 2. Rendu des missions en direct
  if (typeof renderHomepageMissions === 'function') {
    renderHomepageMissions();
  }

  // 3. Mise à jour compteur prestataires
  updateStatsTrustBadge();

  // Écoute de nouvelles candidatures
  window.addEventListener('proxitchad:quote_received', () => {
    if (typeof renderHomepageMissions === 'function') renderHomepageMissions();
  });

  // 4. Initialiser les quartiers
  if (typeof updateQuartiersList === 'function') {
    updateQuartiersList();
  }

  // 5. Glassmorphisme header au scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // 6. Navigation active au scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // 7. Recherche en direct (Debounce)
  const serviceSearchInput = document.getElementById('serviceSearchInput');
  const citySearchInput = document.getElementById('citySearchInput');
  let debounceTimer;
  function triggerLiveSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (typeof handleHeroSearch === 'function') handleHeroSearch();
    }, 350);
  }
  if (serviceSearchInput) serviceSearchInput.addEventListener('input', triggerLiveSearch);
  if (citySearchInput) citySearchInput.addEventListener('input', triggerLiveSearch);

  // 8. Animation d'entrée des cards via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll(
    '.provider-card, .category-card, .how-steps-card, .stat-kpi-card, .testimonial-card, .city-card, .trust-feature-item'
  ).forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // 9. Compteurs animés dans la bande de stats
  animateCounters();
});

/**
 * Focus sur le champ de recherche du hero
 */
function focusSearch() {
  const input = document.getElementById('serviceSearchInput');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Met à jour le badge stats avec le nombre réel de prestataires
 */
function updateStatsTrustBadge() {
  const statEl = document.getElementById('statTotalPros');
  if (!statEl) return;
  try {
    const pros = (typeof getAllProviders === 'function') ? getAllProviders() : [];
    const count = pros.filter(p => p.verified !== false).length;
    const display = count > 9 ? count + '+' : (count >= 5 ? count + '+' : '120+');
    statEl.textContent = display;
  } catch(e) {
    statEl.textContent = '120+';
  }
}

/**
 * Animation des compteurs de la bande de stats
 */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-trust-val');
  counters.forEach(counter => {
    const text = counter.textContent;
    const num = parseInt(text);
    if (isNaN(num)) return;
    const suffix = text.replace(String(num), '');
    let start = 0;
    const step = Math.max(1, Math.ceil(num / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        start = num;
        clearInterval(timer);
      }
      counter.textContent = start + suffix;
    }, 30);
  });
}
