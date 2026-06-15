/* ============================================
   InternArea Premium — Referral Program
   Copy link, rewards counter, invite stats
   ============================================ */

(function () {
  'use strict';

  /* ---- Demo referral link ---- */
  const REFERRAL_BASE = 'https://internarea.com/invite/';
  const userCode      = 'USR' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const referralLink  = REFERRAL_BASE + userCode;

  /* ---- Populate referral link inputs ---- */
  function populateLinks() {
    document.querySelectorAll('.referral-link-input, #referralLink, [data-referral-link]').forEach(el => {
      if (el.tagName === 'INPUT') {
        el.value    = referralLink;
        el.readOnly = true;
      } else {
        el.textContent = referralLink;
      }
    });

    /* Code displays */
    document.querySelectorAll('[data-referral-code]').forEach(el => {
      el.textContent = userCode;
    });
  }

  /* ---- Copy to clipboard ---- */
  function copyLink(btn) {
    const textToCopy = referralLink;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => onCopied(btn));
    } else {
      /* Fallback */
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onCopied(btn);
    }
  }

  function onCopied(btn) {
    const original = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');

    if (window.InternArea?.toast) {
      window.InternArea.toast.success('Copied!', 'Referral link copied to clipboard.', 3000);
    }

    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2500);
  }

  /* ---- Animated rewards counter ---- */
  function animateRewardsStat(el, target, suffix = '') {
    let current = 0;
    const step  = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 40);
  }

  function initRewardsCounters() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.animated) return;
        entry.target.dataset.animated = 'true';

        const target = parseInt(entry.target.dataset.rewardTarget || entry.target.textContent) || 0;
        const suffix = entry.target.dataset.suffix || '';
        animateRewardsStat(entry.target, target, suffix);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-reward-target], .reward-stat-value').forEach(el => {
      observer.observe(el);
    });
  }

  /* ---- Share on social ---- */
  function initShareButtons() {
    const shareMsg = encodeURIComponent(`Join me on InternArea — the premium career platform! Use my link to get $20 off: ${referralLink}`);

    document.querySelectorAll('[data-share="twitter"]').forEach(btn => {
      btn.href = `https://twitter.com/intent/tweet?text=${shareMsg}`;
      btn.target = '_blank';
      btn.rel = 'noopener';
    });
    document.querySelectorAll('[data-share="whatsapp"]').forEach(btn => {
      btn.href = `https://wa.me/?text=${shareMsg}`;
      btn.target = '_blank';
      btn.rel = 'noopener';
    });
    document.querySelectorAll('[data-share="linkedin"]').forEach(btn => {
      btn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
      btn.target = '_blank';
      btn.rel = 'noopener';
    });
    document.querySelectorAll('[data-share="email"]').forEach(btn => {
      btn.href = `mailto:?subject=Join InternArea&body=${shareMsg}`;
    });
  }

  /* ---- Init ---- */
  function init() {
    populateLinks();
    initRewardsCounters();
    initShareButtons();

    /* Copy buttons */
    document.querySelectorAll('.copy-btn, [data-copy-link], #copyBtn').forEach(btn => {
      btn.addEventListener('click', () => copyLink(btn));
    });

    /* "Get referral link" CTA */
    document.querySelectorAll('[data-get-link]').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = document.querySelector('#referralSection, .referral-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else copyLink(btn);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.InternArea = window.InternArea || {};
  window.InternArea.referral = { copy: () => copyLink(document.querySelector('.copy-btn')), link: referralLink };

})();
