/* ============================================
   InternArea Premium — Toast Notification System
   ============================================ */

(function () {
  'use strict';

  const ICONS = {
    success: '✅',
    warning: '⚠️',
    error:   '❌',
    info:    'ℹ️',
  };

  /* ---- Ensure container exists ---- */
  function getContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /* ---- Show a toast ---- */
  function show(title, message = '', type = 'info', duration = 4000) {
    const container = getContainer();
    const icon = ICONS[type] || ICONS.info;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        ${title   ? `<div class="toast-title">${title}</div>` : ''}
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close notification">✕</button>
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    /* Animate progress bar */
    const progressEl = toast.querySelector('.toast-progress');
    if (progressEl && duration > 0) {
      progressEl.style.width = '100%';
      progressEl.style.transition = `width ${duration}ms linear`;
      /* Small timeout so the transition starts after paint */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressEl.style.width = '0%';
        });
      });
    }

    /* Close button */
    toast.querySelector('.toast-close').addEventListener('click', () => remove(toast));

    /* Auto-remove */
    let timer;
    if (duration > 0) {
      timer = setTimeout(() => remove(toast), duration);
    }

    /* Pause on hover */
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => {
      if (duration > 0) timer = setTimeout(() => remove(toast), 1200);
    });

    return toast;
  }

  /* ---- Remove a toast ---- */
  function remove(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });
  }

  /* ---- Convenience helpers ---- */
  const success = (title, msg, duration) => show(title, msg, 'success', duration);
  const warning = (title, msg, duration) => show(title, msg, 'warning', duration);
  const error   = (title, msg, duration) => show(title, msg, 'error',   duration);
  const info    = (title, msg, duration) => show(title, msg, 'info',    duration);

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.toast = { show, remove, success, warning, error, info };

})();
