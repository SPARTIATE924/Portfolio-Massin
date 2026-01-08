// ============================================
// PORTFOLIO TECH/CYBERSÉCURITÉ - MAIN JS
// Navigation & Interactive Features
// ============================================

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
