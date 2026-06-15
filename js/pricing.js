/* ============================================
   InternArea Premium — Pricing Page
   Monthly/Yearly toggle, plan highlighting, animations
   ============================================ */

(function () {
  'use strict';

  let isYearly = false;

  /* ---- Pricing data: monthly → yearly (20% off) ---- */
  const plans = {
    professional: { monthly: 9.99,  yearly: 7.99  },
    elite:        { monthly: 29.99, yearly: 23.99 },
  };

  /* ---- Update displayed prices ---- */
  function updatePrices() {
    document.querySelectorAll('[data-plan]').forEach(priceEl => {
      const planKey = priceEl.dataset.plan;
      const plan    = plans[planKey];
      if (!plan) return;

      const price   = isYearly ? plan.yearly : plan.monthly;
      const period  = isYearly ? '/mo (billed annually)' : '/mo';

      const numEl   = priceEl.querySelector('[data-price-num]') || priceEl;
      const perEl   = priceEl.querySelector('[data-price-period]');

      if (numEl.dataset.priceNum !== undefined || numEl === priceEl) {
        numEl.childNodes[0].nodeValue = `$${price.toFixed(2)}`;
      }
      if (perEl) perEl.textContent = period;
    });

    /* Toggle save badge visibility */
    document.querySelectorAll('.pricing-save-badge').forEach(badge => {
      badge.style.display = isYearly ? 'inline' : 'none';
    });

    /* Update toggle labels */
    const monthly = document.querySelector('[data-billing="monthly"]');
    const yearly  = document.querySelector('[data-billing="yearly"]');
    if (monthly) monthly.classList.toggle('active', !isYearly);
    if (yearly)  yearly.classList.toggle('active',   isYearly);
  }

  /* ---- Highlight recommended card ---- */
  function highlightRecommended() {
    document.querySelectorAll('.pricing-card, [data-pricing-card]').forEach(card => {
      const isRecommended = card.dataset.recommended === 'true';
      card.classList.toggle('pricing-card--featured', isRecommended);
    });
  }

  /* ---- Animate cards on entry ---- */
  function animateCards() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, i * 100);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.pricing-card, [data-pricing-card]').forEach(card => {
      card.classList.add('reveal-scale');
      observer.observe(card);
    });
  }

  /* ---- Toggle handler ---- */
  function handleToggle(checked) {
    isYearly = checked;
    updatePrices();

    if (window.InternArea?.toast) {
      const msg = isYearly
        ? 'Yearly billing — save 20%!'
        : 'Monthly billing selected.';
      window.InternArea.toast.info(msg, '', 2500);
    }
  }

  /* ---- Plan CTA feedback ---- */
  function initPlanButtons() {
    document.querySelectorAll('[data-plan-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.planBtn;
        if (window.InternArea?.toast) {
          window.InternArea.toast.success(
            'Plan selected!',
            `You selected the ${plan} plan. Redirecting to checkout…`,
            3500
          );
        }
        /* Subtle bounce on the card */
        const card = btn.closest('.card, [data-pricing-card]');
        if (card) {
          card.style.transform = 'scale(1.02)';
          setTimeout(() => { card.style.transform = ''; }, 300);
        }
      });
    });
  }

  /* ---- Init ---- */
  function init() {
    /* Toggle input */
    const toggle = document.getElementById('billingToggle');
    if (toggle) {
      toggle.addEventListener('change', () => handleToggle(toggle.checked));
    }

    /* Label clicks */
    document.querySelectorAll('[data-billing]').forEach(label => {
      label.addEventListener('click', () => {
        const yearly = label.dataset.billing === 'yearly';
        if (toggle) toggle.checked = yearly;
        handleToggle(yearly);
      });
    });

    updatePrices();
    highlightRecommended();
    animateCards();
    initPlanButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.InternArea = window.InternArea || {};
  window.InternArea.pricing = { toggleYearly: () => handleToggle(!isYearly) };

})();
