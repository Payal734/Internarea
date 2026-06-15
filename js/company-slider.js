/* ============================================
   InternArea Premium — Infinite Company Logo Slider
   Auto-scrolls, pauses on hover, seamless loop
   ============================================ */

(function () {
  'use strict';

  function initSlider(container) {
    const track = container.querySelector('.company-slider-track');
    if (!track) return;

    /* Clone items for seamless infinite loop */
    const items = [...track.querySelectorAll('.company-logo-item')];
    if (!items.length) return;

    /* Duplicate enough times to fill double the width */
    const clonesNeeded = Math.ceil(window.innerWidth / (track.scrollWidth || 1)) + 2;
    for (let i = 0; i < clonesNeeded; i++) {
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }

    /* Speed: pixels per second */
    const speed = parseFloat(container.dataset.speed) || 60;
    const itemWidth = items[0].getBoundingClientRect().width + 40; // gap ~2.5rem
    const totalWidth = itemWidth * items.length;

    let position  = 0;
    let paused    = false;
    let rafId     = null;
    let lastTime  = null;

    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000; // seconds
      lastTime = timestamp;

      if (!paused) {
        position += speed * delta;
        if (position >= totalWidth) position -= totalWidth;
        track.style.transform = `translateX(-${position.toFixed(2)}px)`;
        track.style.animation = 'none'; // override CSS animation
      }

      rafId = requestAnimationFrame(animate);
    }

    /* Override CSS animation with JS-driven one */
    track.style.animation = 'none';
    track.style.willChange = 'transform';
    rafId = requestAnimationFrame(animate);

    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });

    /* Clean up on page navigation */
    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
  }

  function init() {
    document.querySelectorAll('.company-slider').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.InternArea = window.InternArea || {};
  window.InternArea.companySlider = { init };

})();
