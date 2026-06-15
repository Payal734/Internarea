/* ============================================
   InternArea Premium — Scroll Reveal & Animations
   Uses IntersectionObserver for reveal-on-scroll
   ============================================ */

(function () {
  'use strict';

  /* ---- Intersection Observer setup ---- */
  const REVEAL_CLASSES = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        /* Stop observing once revealed */
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  /* ---- Auto-observe elements ---- */
  function observeRevealElements() {
    REVEAL_CLASSES.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => observer.observe(el));
    });
  }

  /* ---- Add reveal classes to common elements ---- */
  function autoTagElements() {
    /* Cards */
    document.querySelectorAll('.card:not(.stagger-item)').forEach((card, i) => {
      if (!card.classList.contains('reveal') &&
          !card.classList.contains('reveal-left') &&
          !card.classList.contains('reveal-right') &&
          !card.classList.contains('reveal-scale')) {
        card.classList.add('reveal');
        if (i % 3 === 1) card.classList.add(`reveal-delay-${Math.min(i % 5 + 1, 5)}`);
      }
    });

    /* Section headings */
    document.querySelectorAll('section h2, section h3').forEach(el => {
      if (!el.closest('.reveal, .animate-fade-in-down')) {
        el.classList.add('reveal');
      }
    });
  }

  /* ---- Floating elements ---- */
  function initFloatingElements() {
    document.querySelectorAll('.float-card, [data-float]').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.3}s`;
      el.classList.add('float-medium');
    });
  }

  /* ---- Stagger children inside containers ---- */
  function initStaggerContainers() {
    document.querySelectorAll('[data-stagger]').forEach(container => {
      const delay = parseFloat(container.dataset.stagger) || 0.1;
      Array.from(container.children).forEach((child, i) => {
        child.style.animationDelay = `${i * delay}s`;
      });
    });
  }

  /* ---- Hero entrance animation ---- */
  function initHeroAnimation() {
    const hero = document.querySelector('.hero-content, [data-hero]');
    if (!hero) return;
    hero.classList.add('animate-fade-in-up');
  }

  /* ---- Parallax-lite for hero sections ---- */
  function initParallax() {
    const heroSections = document.querySelectorAll('[data-parallax]');
    if (!heroSections.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroSections.forEach(section => {
        const speed = parseFloat(section.dataset.parallax) || 0.3;
        const rect  = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          section.style.transform = `translateY(${scrollY * speed}px)`;
        }
      });
    }, { passive: true });
  }

  /* ---- Card tilt on mousemove (subtle 3D) ---- */
  function initCardTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const strength = parseFloat(card.dataset.tilt) || 6;
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(800px) rotateY(${dx * strength}deg) rotateX(${-dy * strength}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---- Gradient border highlight ---- */
  function initGradientBorder() {
    document.querySelectorAll('.gradient-border').forEach(el => {
      el.addEventListener('mouseenter', () => el.classList.add('active'));
      el.addEventListener('mouseleave', () => el.classList.remove('active'));
    });
  }

  /* ---- Init ---- */
  function init() {
    autoTagElements();
    observeRevealElements();
    initFloatingElements();
    initStaggerContainers();
    initHeroAnimation();
    initParallax();
    initCardTilt();
    initGradientBorder();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.animations = {
    observe: el => observer.observe(el),
    reveal:  el => el.classList.add('revealed'),
  };

})();
