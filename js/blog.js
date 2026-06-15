/* ============================================
   InternArea Premium — Blog Module
   Category filter, search, pagination
   ============================================ */

(function () {
  'use strict';

  const POSTS_PER_PAGE = 6;
  let currentPage      = 1;
  let currentCategory  = 'all';
  let currentQuery     = '';

  /* ---- Get all blog post cards ---- */
  function getPosts() {
    return [...document.querySelectorAll('[data-post], .blog-post-card, .articles-grid .card')];
  }

  /* ---- Filter logic ---- */
  function getFilteredPosts() {
    return getPosts().filter(post => {
      const category = (post.dataset.category || post.querySelector('.badge')?.textContent || '').toLowerCase();
      const title    = (post.dataset.title    || post.querySelector('h4,h3')?.textContent || '').toLowerCase();
      const body     = (post.dataset.summary  || post.querySelector('p')?.textContent     || '').toLowerCase();
      const text     = `${title} ${body} ${category}`;

      const catMatch = currentCategory === 'all' || category.includes(currentCategory.toLowerCase());
      const qMatch   = !currentQuery || text.includes(currentQuery.toLowerCase());
      return catMatch && qMatch;
    });
  }

  /* ---- Render current page ---- */
  function render() {
    const filtered = getFilteredPosts();
    const allPosts = getPosts();
    const start    = (currentPage - 1) * POSTS_PER_PAGE;
    const end      = start + POSTS_PER_PAGE;
    const visible  = new Set(filtered.slice(start, end));

    allPosts.forEach(post => {
      post.classList.toggle('card-hidden', !visible.has(post));
    });

    renderPagination(Math.ceil(filtered.length / POSTS_PER_PAGE));
    updateCount(filtered.length);
    toggleEmpty(filtered.length === 0);
  }

  /* ---- Pagination ---- */
  function renderPagination(totalPages) {
    const container = document.getElementById('blogPagination') ||
                      document.querySelector('.pagination');
    if (!container) return;

    if (totalPages <= 1) { container.innerHTML = ''; return; }

    const pages = [];
    /* Prev */
    pages.push(`<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`);

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(`<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('<span class="page-btn" style="border:none;cursor:default">…</span>');
      }
    }

    /* Next */
    pages.push(`<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`);

    container.innerHTML = pages.join('');
    container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page < 1 || page > totalPages || page === currentPage) return;
        currentPage = page;
        render();
        document.querySelector('.articles-section, .articles-grid, .blog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---- Count ---- */
  function updateCount(count) {
    const label = document.querySelector('[data-results-count]');
    if (label) label.textContent = `${count} article${count !== 1 ? 's' : ''}`;
  }

  /* ---- Empty state ---- */
  function toggleEmpty(show) {
    let empty = document.querySelector('.no-results');
    if (show && !empty) {
      empty = document.createElement('div');
      empty.className = 'no-results';
      empty.innerHTML = `
        <div class="no-results-icon">📰</div>
        <h3>No articles found</h3>
        <p>Try a different category or search term.</p>
      `;
      const grid = document.querySelector('.articles-grid, .blog-grid, .grid-3');
      if (grid) grid.after(empty);
    } else if (empty) {
      empty.style.display = show ? 'block' : 'none';
    }
  }

  /* ---- Debounce ---- */
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ---- Init category tabs ---- */
  function initTabs() {
    document.querySelectorAll('.blog-tab, [data-blog-category]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.blog-tab, [data-blog-category]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.blogCategory || tab.dataset.category || tab.textContent.toLowerCase();
        currentPage     = 1;
        render();
      });
    });
  }

  /* ---- Init search ---- */
  function initSearch() {
    const input = document.querySelector('#blogSearch, .blog-search-input, .search-input');
    if (!input) return;
    input.addEventListener('input', debounce(e => {
      currentQuery = e.target.value.trim();
      currentPage  = 1;
      render();
    }, 300));
  }

  /* ---- Init ---- */
  function init() {
    initTabs();
    initSearch();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.InternArea = window.InternArea || {};
  window.InternArea.blog = { render, setCategory: cat => { currentCategory = cat; currentPage = 1; render(); } };

})();
