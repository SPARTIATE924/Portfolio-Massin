// ============================================
// PORTFOLIO TECH/CYBERSÉCURITÉ - MAIN JS
// Navigation & Interactive Features
// ============================================

// ============================================
// SECURITY: HTML Escape function to prevent XSS
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Sanitize URL to prevent javascript: protocol attacks
function sanitizeUrl(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url, window.location.origin);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (e) {}
  return '#';
}

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // 1. ACTIVE NAVIGATION HIGHLIGHTING
  // ============================================
  highlightActiveNav();

  // ============================================
  // 2. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  setupSmoothScroll();

  // ============================================
  // 3. FADE IN ANIMATIONS ON SCROLL
  // ============================================
  setupScrollAnimations();

  // ============================================
  // 4. MOBILE MENU CLOSE ON LINK CLICK
  // ============================================
  setupMobileMenuClose();
  // 5. PROJECT FILTERS (page: projets.html)
  setupProjectFilters();
  // 6. RSS FEEDS (page: vt.html)
  setupRSSFeeds();
  // 7. THEME TOGGLE (bright/dark preview)
  setupThemeToggle();
  // 8. PALETTE SELECTOR (presets)
  setupPaletteSelector();
});

/**
 * Highlight the active page in navigation
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');

    // Check if link matches current page
    if (linkHref === currentPage ||
        (currentPage === 'index.html' && linkHref === '/') ||
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');

      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        const headerOffset = 80; // Account for fixed header
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Setup scroll-triggered animations
 */
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Close mobile menu when clicking a link
 */
function setupMobileMenuClose() {
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Trigger Alpine.js to close the menu
      // This works with Alpine's x-data="{ mobileMenuOpen: false }"
      const menuToggle = document.querySelector('[x-data]');
      if (menuToggle && window.Alpine) {
        // Close the menu via Alpine
        menuToggle.__x.$data.mobileMenuOpen = false;
      }
    });
  });
}

/**
 * Setup project filters on projets.html
 */
function setupProjectFilters() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const buttons = Array.from(filterBar.querySelectorAll('.filter-btn'));
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.project-card'));

  function applyFilter(filter) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

    cards.forEach(card => {
      const tech = (card.dataset.tech || '').toLowerCase();
      if (filter === 'all' || tech.includes(filter)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Default: show all
  applyFilter('all');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });
}

/**
 * Setup RSS feeds for vt.html (client-side aggregator using a CORS proxy)
 */
function setupRSSFeeds() {
  const rssContainer = document.getElementById('rssContainer');
  const feedSelect = document.getElementById('feedSelect');
  const refreshBtn = document.getElementById('refreshFeeds');
  const rssStatus = document.getElementById('rssStatus');

  if (!rssContainer || !feedSelect || !refreshBtn) return;

  const FEEDS = {
    zdnet: { title: 'ZDNet Security', url: 'https://www.zdnet.com/topic/security/rss.xml' },
    thehackernews: { title: 'The Hacker News', url: 'https://thehackernews.com/rss' },
    krebsonsecurity: { title: 'KrebsOnSecurity', url: 'https://krebsonsecurity.com/feed/' },
    arstechnica: { title: 'Ars Technica Security', url: 'https://feeds.arstechnica.com/arstechnica/security' }
  };

  const PROXY = 'https://api.allorigins.win/raw?url='; // CORS proxy: free, no key required
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
  const LOCAL_JSON = 'assets/data/rss.json';

  function setStatus(msg) {
    if (rssStatus) rssStatus.textContent = msg;
  }

  function formatDate(d) {
    try {
      const date = new Date(d);
      return date.toLocaleString();
    } catch (e) {
      return '';
    }
  }

  function parseFeed(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const items = Array.from(doc.querySelectorAll('item, entry')).map(node => {
      const title = node.querySelector('title')?.textContent || '';
      const link = node.querySelector('link')?.textContent || node.querySelector('link')?.getAttribute('href') || '';
      const pubDate = node.querySelector('pubDate')?.textContent || node.querySelector('updated')?.textContent || '';
      const description = node.querySelector('description')?.textContent || node.querySelector('content')?.textContent || '';
      return { title, link, pubDate, description };
    });
    return items;
  }
  
  function renderItems(items) {
    rssContainer.innerHTML = '';
    if (!items || items.length === 0) {
      rssContainer.innerHTML = '<div class="rss-empty">Aucun article trouvé.</div>';
      return;
    }

    const max = 8;
    items.slice(0, max).forEach(it => {
      const card = document.createElement('article');
      card.className = 'rss-card';
      // SECURITY: Use escapeHtml and sanitizeUrl to prevent XSS
      const safeTitle = escapeHtml(it.title);
      const safeLink = sanitizeUrl(it.link);
      const safeDate = escapeHtml(formatDate(it.pubDate));
      const safeExcerpt = escapeHtml((it.description || '').slice(0, 200)) + ((it.description && it.description.length>200)?'...':'');
      card.innerHTML = `
        <h4><a class="rss-link" href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeTitle}</a></h4>
        <div class="rss-meta">${safeDate}</div>
        <div class="rss-excerpt">${safeExcerpt}</div>
      `;
      rssContainer.appendChild(card);
    });
  }

  async function fetchFeed(feedId) {
    const feed = FEEDS[feedId];
    if (!feed) return [];

    const cacheKey = 'rss_cache_' + feedId;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL) {
        return cached.items;
      }
    } catch (e) { /* ignore */ }

    setStatus('Chargement...');

    // Try primary proxy, then a lightweight fallback (jina.ai) if available
    const proxies = [PROXY, 'https://r.jina.ai/http://'];

    for (const p of proxies) {
      try {
        const url = p + encodeURIComponent(feed.url);
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed ' + res.status);
        const text = await res.text();
        const items = parseFeed(text);
        if (items && items.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify({ items, fetchedAt: Date.now() }));
          setStatus('Dernière mise à jour: ' + new Date().toLocaleTimeString());
          return items;
        }
      } catch (err) {
        console.warn('Proxy failed:', p, err);
        // try next proxy
      }
    }

    setStatus('Impossible de charger le flux (CORS/proxy).');
    return [];
  }

  async function fetchAll() {
    setStatus('Chargement de tous les flux...');
    const all = [];
    for (const id of Object.keys(FEEDS)) {
      const items = await fetchFeed(id);
      all.push(...items.map(i => ({...i, _source: FEEDS[id].title})));
    }
    // sort by date desc when possible
    all.sort((a,b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
    setStatus('Chargement terminé');
    renderItems(all);
  }

  // Try load pre-generated rss.json first (generated by CI). If absent, fall back to client aggregation.
  async function initFeeds() {
    try {
      const res = await fetch(LOCAL_JSON + '?_=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        if (payload && Array.isArray(payload.items) && payload.items.length > 0) {
          setStatus('Chargé depuis rss.json');
          renderItems(payload.items);
          return; // done
        }
      }
    } catch (e) {
      // ignore and fallback to client-side fetching
    }

    // fallback
    fetchAll();
  }

  // Initial load
  initFeeds();

  feedSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === 'all') {
      fetchAll();
    } else {
      setStatus('Chargement...');
      const items = await fetchFeed(val);
      renderItems(items);
    }
  });

  refreshBtn.addEventListener('click', async () => {
    const val = feedSelect.value;
    // Clear cache for selected feed or all
    if (val === 'all') {
      Object.keys(FEEDS).forEach(id => localStorage.removeItem('rss_cache_' + id));
      fetchAll();
    } else {
      localStorage.removeItem('rss_cache_' + val);
      const items = await fetchFeed(val);
      renderItems(items);
    }
  });

}

/**
 * Theme toggle: injects a small button in the header and persists preference
 */
function setupThemeToggle() {
  const mobileBtn = document.querySelector('header button[aria-label="Toggle menu"]');
  if (!mobileBtn) return;

  // create a small button before the mobile menu button
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'theme-toggle';
  btn.title = 'Basculer thème';
  btn.innerHTML = '<i class="fas fa-moon"></i>';

  mobileBtn.parentNode.insertBefore(btn, mobileBtn);

  function updateIcon() {
    const bright = document.documentElement.classList.contains('theme-bright');
    btn.innerHTML = bright ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-bright');
    const bright = document.documentElement.classList.contains('theme-bright');
    localStorage.setItem('theme', bright ? 'bright' : 'dark');
    updateIcon();
  });

  // restore preference
  const saved = localStorage.getItem('theme');
  if (saved === 'bright') document.documentElement.classList.add('theme-bright');
  updateIcon();
}

/**
 * Palette selector: small color buttons next to the theme toggle
 */
function setupPaletteSelector() {
  const mobileBtn = document.querySelector('header button[aria-label="Toggle menu"]');
  if (!mobileBtn) return;

  const container = document.createElement('div');
  container.className = 'palette-selector';

  const palettes = [
    { id: 'default', title: 'Default' },
    { id: 'pastel', title: 'Pastel' },
    { id: 'vibrant', title: 'Vibrant' }
  ];

  palettes.forEach(p => {
    const b = document.createElement('button');
    b.className = 'palette-btn';
    b.dataset.palette = p.id;
    b.title = p.title;
    container.appendChild(b);
  });

  mobileBtn.parentNode.insertBefore(container, mobileBtn.nextSibling);

  const buttons = Array.from(container.querySelectorAll('.palette-btn'));

  function applyPalette(id) {
    // remove all palette classes first
    document.documentElement.classList.remove('theme-pastel', 'theme-vibrant');
    if (id === 'pastel') document.documentElement.classList.add('theme-pastel');
    if (id === 'vibrant') document.documentElement.classList.add('theme-vibrant');

    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.palette === id));
    localStorage.setItem('palette', id);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => applyPalette(btn.dataset.palette));
  });

  // restore
  const saved = localStorage.getItem('palette') || 'default';
  applyPalette(saved);
}

  function renderItems(items) {
    rssContainer.innerHTML = '';
    if (!items || items.length === 0) {
      rssContainer.innerHTML = '<div class="rss-empty">Aucun article trouvé.</div>';
      return;
    }

    const max = 8;
    items.slice(0, max).forEach(it => {
      const card = document.createElement('article');
      card.className = 'rss-card';
      // SECURITY: Use escapeHtml and sanitizeUrl to prevent XSS
      const safeTitle = escapeHtml(it.title);
      const safeLink = sanitizeUrl(it.link);
      const safeDate = escapeHtml(formatDate(it.pubDate));
      const safeExcerpt = escapeHtml((it.description || '').slice(0, 200)) + ((it.description && it.description.length>200)?'...':'');
      card.innerHTML = `
        <h4><a class="rss-link" href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeTitle}</a></h4>
        <div class="rss-meta">${safeDate}</div>
        <div class="rss-excerpt">${safeExcerpt}</div>
      `;
      rssContainer.appendChild(card);
    });
  }

  async function fetchFeed(feedId) {
    const feed = FEEDS[feedId];
    if (!feed) return [];

    const cacheKey = 'rss_cache_' + feedId;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL) {
        return cached.items;
      }
    } catch (e) { /* ignore */ }

    setStatus('Chargement...');

    // Try primary proxy, then a lightweight fallback (jina.ai) if available
    const proxies = [PROXY, 'https://r.jina.ai/http://'];

    for (const p of proxies) {
      try {
        const url = p + encodeURIComponent(feed.url);
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed ' + res.status);
        const text = await res.text();
        const items = parseFeed(text);
        if (items && items.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify({ items, fetchedAt: Date.now() }));
          setStatus('Dernière mise à jour: ' + new Date().toLocaleTimeString());
          return items;
        }
      } catch (err) {
        console.warn('Proxy failed:', p, err);
        // try next proxy
      }
    }

    setStatus('Impossible de charger le flux (CORS/proxy).');
    return [];
  }

  async function fetchAll() {
    setStatus('Chargement de tous les flux...');
    const all = [];
    for (const id of Object.keys(FEEDS)) {
      const items = await fetchFeed(id);
      all.push(...items.map(i => ({...i, _source: FEEDS[id].title})));
    }
    // sort by date desc when possible
    all.sort((a,b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
    setStatus('Chargement terminé');
    renderItems(all);
  }

  // Initial load: all
  fetchAll();

  feedSelect.addEventListener('change', async (e) => {
    const val = e.target.value;
    if (val === 'all') {
      fetchAll();
    } else {
      setStatus('Chargement...');
      const items = await fetchFeed(val);
      renderItems(items);
    }
  });

  refreshBtn.addEventListener('click', async () => {
    const val = feedSelect.value;
    // Clear cache for selected feed or all
    if (val === 'all') {
      Object.keys(FEEDS).forEach(id => localStorage.removeItem('rss_cache_' + id));
      fetchAll();
    } else {
      localStorage.removeItem('rss_cache_' + val);
      const items = await fetchFeed(val);
      renderItems(items);
    }
  });
}


/**
 * Add keyboard navigation support
 */
document.addEventListener('keydown', (e) => {
  // ESC key closes mobile menu
  if (e.key === 'Escape') {
    const menuToggle = document.querySelector('[x-data]');
    if (menuToggle && window.Alpine) {
      menuToggle.__x.$data.mobileMenuOpen = false;
    }
  }
});

/**
 * Prevent scroll when mobile menu is open
 */
if (window.Alpine) {
  window.Alpine.effect(() => {
    const menuToggle = document.querySelector('[x-data]');
    if (menuToggle && menuToggle.__x) {
      const isOpen = menuToggle.__x.$data.mobileMenuOpen;
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  });
}
