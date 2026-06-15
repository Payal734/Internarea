/* ============================================
   InternArea Premium — Animated Counters
   Uses IntersectionObserver — fires once
   ============================================ */

(function () {
  'use strict';

  /* ---- Parse value + suffix (e.g. "500K+" → 500000, "+") ---- */
  function parseCounter(text) {
    const clean = text.trim();
    const suffixMatch = clean.match(/[KkMmBb+%]+$/);
    const suffix  = suffixMatch ? suffixMatch[0] : '';
    const numStr  = clean.replace(/[KkMmBb+% ]/g, '');
    let   num     = parseFloat(numStr) || 0;

    if (/[Kk]/.test(suffix)) num *= 1000;
    if (/[Mm]/.test(suffix)) num *= 1_000_000;
    if (/[Bb]/.test(suffix)) num *= 1_000_000_000;

    return { num, suffix: clean.replace(/[\d.,]/g, '').replace(/[Kk]/, 'K').replace(/[Mm]/, 'M') };
  }

  /* ---- Format display value ---- */
  function formatValue(current, originalText) {
    const { suffix } = parseCounter(originalText);
    const isKilo = /[Kk]/.test(originalText);
    const isMega = /[Mm]/.test(originalText);
    const isPct  = /%/.test(suffix);

    if (isMega)    return `${(current / 1_000_000).toFixed(1)}M${suffix.replace(/[^+%]/g, '')}`;
    if (isKilo)    return `${Math.round(current / 1000)}K${suffix.replace(/[^+%]/g, '')}`;
    if (isPct)     return `${Math.round(current)}%`;
    return `${Math.round(current)}${suffix.replace(/\d/g, '')}`;
  }

  /* ---- Easing ---- */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /* ---- Animate one counter element ---- */
  function animateCounter(el) {
    const originalText = el.dataset.target || el.textContent;
    el.dataset.target  = originalText;

    const { num: target } = parseCounter(originalText);
    if (!target) return;

    const duration = parseInt(el.dataset.duration) || 2000;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = target * easeOutQuart(progress);

      el.textContent = formatValue(current, originalText);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = originalText; /* Restore exact original */
      }
    }

    requestAnimationFrame(step);
  }

  /* ---- Observe counters ---- */
  function initCounters() {
    const counters = document.querySelectorAll('.counter, [data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -20px 0px',
    });

    counters.forEach(counter => observer.observe(counter));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.counter = { animate: animateCounter, init: initCounters };

})();
