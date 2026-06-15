/* ============================================
   InternArea Premium — Mobile Menu
   Hamburger + slide-in sidebar + overlay
   ============================================ */

(function () {
  'use strict';

  let isOpen = false;

  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const overlay     = document.getElementById('mobileOverlay');
  const closeBtn    = document.getElementById('mobileMenuClose');

  if (!hamburger || !mobileMenu) return;

  /* ---- Open ---- */
  function openMenu() {
    isOpen = true;
    mobileMenu.classList.add('open');
    if (overlay) overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileMenu.setAttribute('aria-hidden', 'false');
    /* focus first link for a11y */
    const firstLink = mobileMenu.querySelector('a, button');
    if (firstLink) setTimeout(() => firstLink.focus(), 350);
  }

  /* ---- Close ---- */
  function closeMenu() {
    isOpen = false;
    mobileMenu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  /* ---- Toggle ---- */
  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  /* ---- Event listeners ---- */
  hamburger.addEventListener('click', toggleMenu);

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  if (overlay) overlay.addEventListener('click', closeMenu);

  /* Close on escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  /* Close when a nav link is clicked */
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      /* tiny delay so page transition feels smooth */
      setTimeout(closeMenu, 150);
    });
  });

  /* Close when viewport grows past mobile breakpoint */
  const mq = window.matchMedia('(min-width: 769px)');
  const handleResize = e => { if (e.matches && isOpen) closeMenu(); };
  if (mq.addEventListener) {
    mq.addEventListener('change', handleResize);
  } else {
    mq.addListener(handleResize); // Safari < 14 fallback
  }

  /* ---- Accessibility ---- */
  hamburger.setAttribute('aria-controls', 'mobileMenu');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.mobileMenu = { open: openMenu, close: closeMenu, toggle: toggleMenu };

})();
