/* ============================================
   InternArea Premium — FAQ Accordion
   One item open at a time, smooth animation
   ============================================ */

(function () {
  'use strict';

  /* ---- Upgrade plain .card FAQ items ---- */
  function upgradeCards() {
    document.querySelectorAll('.faq-list .card, [data-faq-item]').forEach(card => {
      if (card.querySelector('.faq-trigger')) return; /* Already upgraded */

      const h4 = card.querySelector('h4');
      const p  = card.querySelector('p');
      if (!h4 || !p) return;

      const titleText = h4.textContent.trim();
      const bodyHTML  = p.outerHTML;

      card.classList.add('faq-item');
      card.innerHTML = `
        <button class="faq-trigger" aria-expanded="false">
          ${titleText}
          <span class="faq-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>
        <div class="faq-body" aria-hidden="true">
          <div class="faq-body-inner">${bodyHTML}</div>
        </div>
      `;
    });
  }

  /* ---- Close all items (except optionally one) ---- */
  function closeAll(exceptTrigger) {
    document.querySelectorAll('.faq-trigger.active').forEach(trigger => {
      if (trigger === exceptTrigger) return;
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
      const body = trigger.nextElementSibling;
      if (body) {
        body.classList.remove('open');
        body.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ---- Toggle one FAQ item ---- */
  function toggleItem(trigger) {
    const isOpen = trigger.classList.contains('active');
    closeAll(trigger);

    if (!isOpen) {
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      const body = trigger.nextElementSibling;
      if (body) {
        body.classList.add('open');
        body.setAttribute('aria-hidden', 'false');
      }
    } else {
      /* Close this one too */
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
      const body = trigger.nextElementSibling;
      if (body) {
        body.classList.remove('open');
        body.setAttribute('aria-hidden', 'true');
      }
    }
  }

  /* ---- Init ---- */
  function init() {
    upgradeCards();

    document.addEventListener('click', e => {
      const trigger = e.target.closest('.faq-trigger');
      if (trigger) toggleItem(trigger);
    });

    /* Keyboard support */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const trigger = e.target.closest('.faq-trigger');
      if (trigger) {
        e.preventDefault();
        toggleItem(trigger);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.faq = { closeAll, toggle: toggleItem };

})();
