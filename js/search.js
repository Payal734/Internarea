/* ============================================
   InternArea Premium — Live Search
   Debounced search with highlight + empty state
   ============================================ */

(function () {
  'use strict';

  /* ---- Debounce utility ---- */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ---- Escape regex special chars ---- */
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ---- Highlight matching text ---- */
  function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="suggestion-highlight">$1</mark>');
  }

  /* ---- Search cards on the current page ---- */
  function searchCards(query) {
    const cards = document.querySelectorAll('[data-searchable], .card[data-title]');
    if (!cards.length) return;

    const q = query.toLowerCase().trim();
    let visible = 0;

    cards.forEach(card => {
      const searchFields = [
        card.dataset.title    || '',
        card.dataset.company  || '',
        card.dataset.category || '',
        card.dataset.skills   || '',
        card.textContent      || '',
      ].join(' ').toLowerCase();

      const match = !q || searchFields.includes(q);
      card.classList.toggle('card-hidden', !match);
      if (match) visible++;
    });

    updateResultsCount(visible);
    toggleNoResults(visible === 0 && q !== '');
  }

  /* ---- Update results count label ---- */
  function updateResultsCount(count) {
    const label = document.querySelector('[data-results-count]');
    if (label) label.textContent = `Showing ${count} result${count !== 1 ? 's' : ''}`;
  }

  /* ---- Show/hide no-results state ---- */
  function toggleNoResults(show) {
    let noResults = document.querySelector('.no-results');
    const grid    = document.querySelector('.search-results-grid, .grid-1, [data-results-grid]');

    if (show) {
      if (!noResults && grid) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
          <div class="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try adjusting your search or filters.</p>
        `;
        grid.after(noResults);
      } else if (noResults) {
        noResults.style.display = 'block';
      }
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }

  /* ---- Suggestions dropdown ---- */
  class SearchSuggestions {
    constructor(input, suggestions = []) {
      this.input   = input;
      this.data    = suggestions;
      this.dropdown = null;
      this.active  = -1;
      this._buildDropdown();
    }

    _buildDropdown() {
      const wrapper = document.createElement('div');
      wrapper.className = 'search-wrapper';
      this.input.parentNode.insertBefore(wrapper, this.input);
      wrapper.appendChild(this.input);

      this.dropdown = document.createElement('div');
      this.dropdown.className = 'search-suggestions';
      wrapper.appendChild(this.dropdown);
    }

    render(query) {
      if (!query || query.length < 2) {
        this.hide();
        return;
      }

      const matches = this.data
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);

      if (!matches.length) {
        this.dropdown.innerHTML = '<div class="search-empty">No suggestions found</div>';
      } else {
        this.dropdown.innerHTML = matches
          .map((item, i) => `
            <div class="suggestion-item" data-index="${i}" role="option">
              <span>🔍</span>
              <span>${highlight(item, query)}</span>
            </div>
          `)
          .join('');

        this.dropdown.querySelectorAll('.suggestion-item').forEach((el, i) => {
          el.addEventListener('click', () => {
            this.input.value = matches[i];
            this.hide();
            this.input.dispatchEvent(new Event('input', { bubbles: true }));
          });
        });
      }

      this.show();
    }

    show() { this.dropdown.classList.add('open'); }
    hide() {
      this.dropdown.classList.remove('open');
      this.active = -1;
    }

    navigate(dir) {
      const items = this.dropdown.querySelectorAll('.suggestion-item');
      if (!items.length) return;
      items[this.active]?.classList.remove('active');
      this.active = (this.active + dir + items.length) % items.length;
      items[this.active]?.classList.add('active');
    }

    selectActive() {
      const item = this.dropdown.querySelectorAll('.suggestion-item')[this.active];
      if (item) item.click();
    }
  }

  /* ---- Init search inputs ---- */
  function initSearch() {
    const inputs = document.querySelectorAll('.search-input[data-search], #mainSearch');

    inputs.forEach(input => {
      const suggestionsData = JSON.parse(input.dataset.suggestions || '[]');
      let suggester = null;

      if (suggestionsData.length) {
        suggester = new SearchSuggestions(input, suggestionsData);
      }

      const handleInput = debounce(e => {
        const q = e.target.value;
        searchCards(q);
        if (suggester) suggester.render(q);
      }, 280);

      input.addEventListener('input', handleInput);

      input.addEventListener('keydown', e => {
        if (!suggester) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); suggester.navigate(1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); suggester.navigate(-1); }
        if (e.key === 'Enter')     { suggester.selectActive(); }
        if (e.key === 'Escape')    { suggester.hide(); }
      });

      /* Close suggestions on outside click */
      document.addEventListener('click', e => {
        if (suggester && !input.closest('.search-wrapper').contains(e.target)) {
          suggester.hide();
        }
      });
    });

    /* ---- Search button trigger ---- */
    document.querySelectorAll('[data-search-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.querySelector('.search-input, #mainSearch');
        if (input) searchCards(input.value);
      });
    });

    /* ---- Clear button ---- */
    document.querySelectorAll('[data-search-clear]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.querySelector('.search-input, #mainSearch');
        if (input) {
          input.value = '';
          searchCards('');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

  /* ---- Expose ---- */
  window.InternArea = window.InternArea || {};
  window.InternArea.search = { query: searchCards };

})();
