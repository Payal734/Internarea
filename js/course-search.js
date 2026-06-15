/* ============================================
   InternArea Premium — Course Search & Filter
   Search by name/topic, filter by category/rating/difficulty, sort
   ============================================ */

(function () {
  'use strict';

  let currentQuery    = '';
  let currentCategory = 'all';
  let currentRating   = 'all';
  let currentLevel    = 'all';
  let currentSort     = 'popular';

  /* ---- Get all course cards ---- */
  function getCourseCards() {
    return document.querySelectorAll('[data-course], .course-card, .courses-grid .card');
  }

  /* ---- Check if a card matches current filters ---- */
  function matches(card) {
    const title    = (card.dataset.title    || card.querySelector('h4,h3')?.textContent || '').toLowerCase();
    const category = (card.dataset.category || '').toLowerCase();
    const rating   = parseFloat(card.dataset.rating || '0');
    const level    = (card.dataset.level    || '').toLowerCase();
    const skills   = (card.dataset.skills   || '').toLowerCase();

    const text = `${title} ${category} ${skills}`;

    if (currentQuery && !text.includes(currentQuery.toLowerCase())) return false;
    if (currentCategory !== 'all' && !category.includes(currentCategory)) return false;
    if (currentLevel    !== 'all' && !level.includes(currentLevel))       return false;

    if (currentRating !== 'all') {
      const minRating = parseFloat(currentRating) || 0;
      if (rating < minRating) return false;
    }

    return true;
  }

  /* ---- Re-render ---- */
  function filterAndSort() {
    const cards = getCourseCards();
    let visible = 0;

    cards.forEach(card => {
      const show = matches(card);
      card.classList.toggle('card-hidden', !show);
      if (show) visible++;
    });

    /* Sort visible cards */
    sortVisible();
    updateCount(visible);
    toggleEmpty(visible === 0);
  }

  /* ---- Sort visible cards ---- */
  function sortVisible() {
    const grid = document.querySelector('.courses-grid, [data-courses-grid]');
    if (!grid) return;

    const cards = [...grid.querySelectorAll(':scope > [data-course], :scope > .card:not(.card-hidden)')];
    const all   = [...grid.querySelectorAll(':scope > [data-course], :scope > .card')];

    cards.sort((a, b) => {
      switch (currentSort) {
        case 'rating':
          return parseFloat(b.dataset.rating || '0') - parseFloat(a.dataset.rating || '0');
        case 'newest':
          return (parseInt(b.dataset.date || '0')) - (parseInt(a.dataset.date || '0'));
        case 'price-low':
          return (parseInt(a.dataset.price || '0')) - (parseInt(b.dataset.price || '0'));
        case 'price-high':
          return (parseInt(b.dataset.price || '0')) - (parseInt(a.dataset.price || '0'));
        case 'popular':
        default:
          return (parseInt(b.dataset.students || '0')) - (parseInt(a.dataset.students || '0'));
      }
    });

    /* Move hidden cards to end, sorted to front */
    const hidden = all.filter(c => !cards.includes(c));
    [...cards, ...hidden].forEach(c => grid.appendChild(c));
  }

  /* ---- Update count ---- */
  function updateCount(count) {
    const label = document.querySelector('[data-results-count]');
    if (label) label.textContent = `Showing ${count} course${count !== 1 ? 's' : ''}`;
  }

  /* ---- Empty state ---- */
  function toggleEmpty(show) {
    let empty = document.querySelector('.no-results');
    if (show && !empty) {
      empty = document.createElement('div');
      empty.className = 'no-results';
      empty.innerHTML = `
        <div class="no-results-icon">📚</div>
        <h3>No courses found</h3>
        <p>Try adjusting your search or filters.</p>
      `;
      const grid = document.querySelector('.courses-grid, [data-courses-grid]');
      if (grid) grid.after(empty);
    } else if (empty) {
      empty.style.display = show ? 'block' : 'none';
    }
  }

  /* ---- Debounce ---- */
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ---- Init ---- */
  function init() {
    /* Search input */
    const searchInput = document.querySelector('.search-input, #courseSearch');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(e => {
        currentQuery = e.target.value.trim();
        filterAndSort();
      }, 300));
    }

    /* Category select / pills */
    document.querySelectorAll('[data-course-category]').forEach(el => {
      el.addEventListener('change', e => {
        currentCategory = e.target.value.toLowerCase();
        filterAndSort();
      });
      el.addEventListener('click', () => {
        if (el.tagName === 'BUTTON' || el.classList.contains('filter-pill')) {
          document.querySelectorAll('[data-course-category]').forEach(b => b.classList.remove('active'));
          el.classList.add('active');
          currentCategory = (el.dataset.courseCategory || 'all').toLowerCase();
          filterAndSort();
        }
      });
    });

    /* Rating filter */
    document.querySelectorAll('[data-course-rating]').forEach(el => {
      el.addEventListener('change', e => {
        currentRating = e.target.value;
        filterAndSort();
      });
      el.addEventListener('click', () => {
        if (el.tagName === 'INPUT') return;
        currentRating = el.dataset.courseRating || 'all';
        filterAndSort();
      });
    });

    /* Level filter */
    document.querySelectorAll('[data-course-level], input[name="level"]').forEach(el => {
      el.addEventListener('change', e => {
        currentLevel = e.target.value.toLowerCase();
        filterAndSort();
      });
    });

    /* Sort */
    document.querySelectorAll('[data-course-sort]').forEach(el => {
      el.addEventListener('change', e => {
        currentSort = e.target.value;
        filterAndSort();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.courseSearch = { filter: filterAndSort };

})();
