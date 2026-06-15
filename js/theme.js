/* ============================================
   InternArea Premium — Theme Manager
   Dark / Light mode with localStorage + system detection
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'ia-theme';
  const DARK_CLASS  = 'dark-mode';

  /* ---- Detect system preference ---- */
  function getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /* ---- Get stored or system theme ---- */
  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || getSystemPreference();
  }

  /* ---- Apply theme to body ---- */
  function applyTheme(theme) {
    document.body.classList.toggle(DARK_CLASS, theme === 'dark');
    updateIcons(theme === 'dark');
    updateMetaTheme(theme);
  }

  /* ---- Update all theme toggle icons ---- */
  function updateIcons(isDark) {
    document.querySelectorAll('.theme-toggle, #themeToggle').forEach(btn => {
      btn.textContent = isDark ? '☀️' : '🌙';
      btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  /* ---- Update browser theme-color meta ---- */
  function updateMetaTheme(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc';
  }

  /* ---- Toggle theme ---- */
  function toggleTheme() {
    const next = document.body.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);

    /* Optional toast notification */
    if (window.InternArea && window.InternArea.toast) {
      window.InternArea.toast.show(
        next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled',
        '',
        'info',
        1800
      );
    }
  }

  /* ---- Attach toggle listeners ---- */
  function attachListeners() {
    document.querySelectorAll('.theme-toggle, #themeToggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  /* ---- Listen for system preference changes ---- */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  /* ---- Init ---- */
  applyTheme(getTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }

  /* ---- Expose API ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.theme = {
    toggle: toggleTheme,
    set: theme => { localStorage.setItem(STORAGE_KEY, theme); applyTheme(theme); },
    get: () => document.body.classList.contains(DARK_CLASS) ? 'dark' : 'light',
  };

})();
