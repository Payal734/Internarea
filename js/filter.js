/* ============================================
   InternArea Premium — Dynamic Filters
   Category / Duration / Work Type / Salary / Rating
   ============================================ */

(function () {
  'use strict';

  /* Active filter state */
  const activeFilters = {
    category: new Set(),
    duration: new Set(),
    type:     new Set(),
    salary:   new Set(),
    rating:   new Set(),
  };

  /* ---- Get all filterable cards ---- */
  function getCards() {
    return document.querySelectorAll('[data-category], [data-type], [data-duration]');
  }

  /* ---- Apply all active filters ---- */
  function applyFilters() {
    const cards = getCards();
    let visible = 0;

    cards.forEach(card => {
      const passes = Object.entries(activeFilters).every(([key, values]) => {
        if (!values.size) return true; /* no filter for this key → pass */
        const cardVal = (card.dataset[key] || '').toLowerCase();
        /* Check if any active value matches */
        return [...values].some(v => cardVal.includes(v.toLowerCase()));
      });

      card.classList.toggle('card-hidden', !passes);
      if (passes) visible++;
    });

    updateCount(visible);
    toggleEmpty(visible === 0);
  }

  /* ---- Update count label ---- */
  function updateCount(count) {
    const label = document.querySelector('[data-results-count]');
    if (label) {
      const type = label.dataset.type || 'results';
      label.textContent = `Showing ${count} ${type}`;
    }
  }

  /* ---- Show/hide empty state ---- */
  function toggleEmpty(show) {
    let empty = document.querySelector('.no-results');
    if (show && !empty) {
      empty = document.createElement('div');
      empty.className = 'no-results';
      empty.innerHTML = `
        <div class="no-results-icon">🎯</div>
        <h3>No matches found</h3>
        <p>Try removing some filters to see more results.</p>
        <button class="btn btn-secondary" onclick="InternArea.filter.clearAll()">Clear Filters</button>
      `;
      const grid = document.querySelector('.grid-1, .grid-2, [data-results-grid]');
      if (grid) grid.after(empty);
    } else if (empty) {
      empty.style.display = show ? 'block' : 'none';
    }
  }

  /* ---- Handle checkbox filter ---- */
  function handleCheckbox(checkbox) {
    const key   = checkbox.dataset.filterKey;
    const value = checkbox.dataset.filterValue || checkbox.value;
    if (!key || !activeFilters[key]) return;

    if (checkbox.checked) {
      activeFilters[key].add(value);
    } else {
      activeFilters[key].delete(value);
    }
    applyFilters();
    updateFilterBadge(key);
  }

  /* ---- Handle radio filter ---- */
  function handleRadio(radio) {
    const key   = radio.dataset.filterKey;
    const value = radio.dataset.filterValue || radio.value;
    if (!key || !activeFilters[key]) return;

    activeFilters[key].clear();
    if (radio.checked) activeFilters[key].add(value);
    applyFilters();
  }

  /* ---- Handle select filter ---- */
  function handleSelect(select) {
    const key   = select.dataset.filterKey;
    const value = select.value;
    if (!key || !activeFilters[key]) return;

    activeFilters[key].clear();
    if (value && value !== 'all') activeFilters[key].add(value);
    applyFilters();
  }

  /* ---- Handle filter pill ---- */
  function handlePill(pill) {
    const key   = pill.dataset.filterKey;
    const value = pill.dataset.filterValue;
    if (!key || !value || !activeFilters[key]) return;

    pill.classList.toggle('active');

    if (pill.classList.contains('active')) {
      activeFilters[key].add(value);
    } else {
      activeFilters[key].delete(value);
    }
    applyFilters();
  }

  /* ---- Update badge counter on filter group labels ---- */
  function updateFilterBadge(key) {
    const badge = document.querySelector(`[data-filter-badge="${key}"]`);
    if (!badge) return;
    const count = activeFilters[key].size;
    badge.textContent = count || '';
    badge.style.display = count ? 'inline' : 'none';
  }

  /* ---- Clear all filters ---- */
  function clearAll() {
    Object.values(activeFilters).forEach(set => set.clear());

    /* Uncheck all filter inputs */
    document.querySelectorAll('[data-filter-key]').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else if (el.tagName === 'SELECT') {
        el.selectedIndex = 0;
      } else if (el.classList.contains('filter-pill')) {
        el.classList.remove('active');
      }
    });

    applyFilters();
  }

  /* ---- Sort cards ---- */
  function sortCards(sortBy) {
    const grid = document.querySelector('.grid-1, .grid-2, [data-results-grid]');
    if (!grid) return;

    const cards = [...grid.querySelectorAll(':scope > .card')];
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return (parseInt(b.dataset.date) || 0) - (parseInt(a.dataset.date) || 0);
        case 'salary': {
          const sa = parseInt((a.dataset.salary || '0').replace(/\D/g, '')) || 0;
          const sb = parseInt((b.dataset.salary || '0').replace(/\D/g, '')) || 0;
          return sb - sa;
        }
        case 'rating':
          return parseFloat(b.dataset.rating || '0') - parseFloat(a.dataset.rating || '0');
        case 'title':
          return (a.dataset.title || '').localeCompare(b.dataset.title || '');
        default:
          return 0;
      }
    });
    cards.forEach(c => grid.appendChild(c));
  }

  /* ---- Init ---- */
  function init() {
    /* Checkboxes */
    document.querySelectorAll('input[type="checkbox"][data-filter-key]').forEach(cb => {
      cb.addEventListener('change', () => handleCheckbox(cb));
    });

    /* Radios */
    document.querySelectorAll('input[type="radio"][data-filter-key]').forEach(r => {
      r.addEventListener('change', () => handleRadio(r));
    });

    /* Selects */
    document.querySelectorAll('select[data-filter-key]').forEach(sel => {
      sel.addEventListener('change', () => handleSelect(sel));
    });

    /* Pills */
    document.querySelectorAll('.filter-pill[data-filter-key]').forEach(pill => {
      pill.addEventListener('click', () => handlePill(pill));
    });

    /* Sort */
    document.querySelectorAll('[data-sort]').forEach(el => {
      el.addEventListener('change', e => sortCards(e.target.value));
      el.addEventListener('click', e => {
        const btn = e.target.closest('[data-sort-value]');
        if (btn) sortCards(btn.dataset.sortValue);
      });
    });

    /* Clear button */
    document.querySelectorAll('[data-clear-filters]').forEach(btn => {
      btn.addEventListener('click', clearAll);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.filter = {
    apply:    applyFilters,
    clearAll: clearAll,
    sort:     sortCards,
    state:    activeFilters,
  };

})();
