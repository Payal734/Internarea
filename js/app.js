/* ============================================
   InternArea Premium — Core App Module
   ============================================ */

(function () {
  'use strict';

  /* ---- Page Loader ---- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 600);
  });

  /* ---- Scroll Progress Bar ---- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * 100;
      progressBar.style.width = `${progress.toFixed(1)}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---- Sticky Navbar ---- */
  const nav = document.getElementById('mainNav') || document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---- Back-to-Top Button ---- */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 350);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Active Navigation Links ---- */
  const currentFile = window.location.pathname.split('/').pop() || 'index-premium.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href && href === currentFile) {
      link.classList.add('active');
    }
  });

  /* ---- Smooth Scroll for anchor links ---- */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ---- Page Transition (fade-in on load) ---- */
  document.body.classList.add('page-loading');

  /* ---- Page Transition (fade-out on navigate) ---- */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.hasAttribute('download') ||
      link.getAttribute('target') === '_blank'
    ) return;
    e.preventDefault();
    document.body.classList.add('page-fade-out');
    setTimeout(() => { window.location.href = href; }, 220);
  });

  /* ---- Ripple Effect on Buttons ---- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .btn-primary, .btn-secondary, .btn-emerald');
    if (!btn || !btn.classList.contains('ripple-effect')) return;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-wave');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    Object.assign(ripple.style, {
      width:  `${size}px`,
      height: `${size}px`,
      left:   `${e.clientX - rect.left - size / 2}px`,
      top:    `${e.clientY - rect.top  - size / 2}px`,
    });
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  /* ---- Expose global helpers ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

})();
