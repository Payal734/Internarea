/* ============================================
   InternArea Premium — Carousel
   Auto-slide, prev/next, dots, infinite loop, touch support
   ============================================ */

(function () {
  'use strict';

  class Carousel {
    constructor(el, options = {}) {
      this.wrapper    = el;
      this.track      = el.querySelector('.carousel-track');
      this.slides     = [...el.querySelectorAll('.carousel-slide')];
      this.dotsEl     = el.querySelector('.carousel-dots');
      this.prevBtn    = el.querySelector('.carousel-prev, [data-carousel-prev]');
      this.nextBtn    = el.querySelector('.carousel-next, [data-carousel-next]');

      this.current    = 0;
      this.count      = this.slides.length;
      this.autoPlay   = options.autoPlay  !== false;
      this.interval   = options.interval  || 4500;
      this.timer      = null;
      this.isInfinite = options.infinite  !== false;
      this.isDragging = false;
      this.startX     = 0;
      this.currentX   = 0;

      if (!this.track || this.count === 0) return;
      this._buildDots();
      this._bindEvents();
      this._update(0, false);
      if (this.autoPlay) this._startTimer();
    }

    /* ---- Build dot indicators ---- */
    _buildDots() {
      if (!this.dotsEl) return;
      this.dotsEl.innerHTML = this.slides
        .map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`)
        .join('');

      this.dotsEl.addEventListener('click', e => {
        const dot = e.target.closest('.carousel-dot');
        if (dot) this.goTo(parseInt(dot.dataset.index));
      });
    }

    /* ---- Update active dot ---- */
    _updateDots() {
      if (!this.dotsEl) return;
      this.dotsEl.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === this.current);
      });
    }

    /* ---- Move to slide n ---- */
    _update(n, animate = true) {
      if (this.count === 0) return;
      this.current = ((n % this.count) + this.count) % this.count;
      this.track.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
      this.track.style.transform = `translateX(-${this.current * 100}%)`;
      this._updateDots();
    }

    /* ---- Timer ---- */
    _startTimer() {
      this._stopTimer();
      this.timer = setInterval(() => this.next(), this.interval);
    }
    _stopTimer() {
      clearInterval(this.timer);
    }

    /* ---- Public: navigate ---- */
    next() { this._update(this.current + 1); }
    prev() { this._update(this.current - 1); }
    goTo(n) { this._update(n); }

    /* ---- Event bindings ---- */
    _bindEvents() {
      if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this._restartTimer(); });
      if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this._restartTimer(); });

      /* Pause on hover */
      this.wrapper.addEventListener('mouseenter', () => this._stopTimer());
      this.wrapper.addEventListener('mouseleave', () => { if (this.autoPlay) this._startTimer(); });

      /* Touch / swipe */
      this.track.addEventListener('touchstart',  e => this._onTouchStart(e), { passive: true });
      this.track.addEventListener('touchmove',   e => this._onTouchMove(e),  { passive: true });
      this.track.addEventListener('touchend',    e => this._onTouchEnd(e));

      /* Keyboard */
      this.wrapper.setAttribute('tabindex', '0');
      this.wrapper.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { this.prev(); this._restartTimer(); }
        if (e.key === 'ArrowRight') { this.next(); this._restartTimer(); }
      });
    }

    _restartTimer() {
      if (this.autoPlay) { this._stopTimer(); this._startTimer(); }
    }

    _onTouchStart(e) {
      this.startX   = e.touches[0].clientX;
      this.isDragging = true;
      this._stopTimer();
    }
    _onTouchMove(e) {
      if (!this.isDragging) return;
      this.currentX = e.touches[0].clientX;
    }
    _onTouchEnd() {
      if (!this.isDragging) return;
      const diff = this.startX - this.currentX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
      this.isDragging = false;
      if (this.autoPlay) this._startTimer();
    }
  }

  /* ---- Init all carousels on the page ---- */
  function initCarousels() {
    document.querySelectorAll('.carousel-wrapper').forEach(el => {
      const opts = {
        autoPlay:  el.dataset.autoplay !== 'false',
        interval:  parseInt(el.dataset.interval) || 4500,
        infinite:  el.dataset.infinite !== 'false',
      };
      el._carousel = new Carousel(el, opts);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.Carousel = Carousel;
  window.InternArea.initCarousels = initCarousels;

})();
