/* auth-state.js — runs on every page; swaps Sign In/Sign Up with user avatar + logout */
(function () {
  'use strict';

  const user  = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const token = localStorage.getItem('token');

  if (!user || !token) return; /* not logged in — keep default nav */

  /* Replace desktop nav Sign Up / Sign In with user chip + logout */
  function patchDesktopNav() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    /* Remove Sign Up and Sign In links */
    navActions.querySelectorAll('a[href="signup.html"], a[href="login.html"]').forEach(el => el.remove());

    /* Build user chip */
    const initials = (user.fullName || user.name || 'U')
      .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const chip = document.createElement('div');
    chip.className = 'auth-user-chip';
    chip.innerHTML = `
      <div class="user-avatar-btn" id="userAvatarBtn" title="${user.fullName || 'My Account'}">
        ${initials}
      </div>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-name">${user.fullName || 'User'}</div>
        <div class="user-dropdown-email">${user.email || ''}</div>
        <hr style="border:none;border-top:1px solid var(--border-light);margin:0.5rem 0">
        <a href="resume.html" class="user-dropdown-item">📄 My Resume</a>
        <button class="user-dropdown-item logout-btn" id="logoutBtn">🚪 Logout</button>
      </div>`;
    navActions.insertBefore(chip, navActions.querySelector('.hamburger'));

    /* Toggle dropdown */
    const avatarBtn = chip.querySelector('#userAvatarBtn');
    const dropdown  = chip.querySelector('#userDropdown');
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));

    /* Logout */
    chip.querySelector('#logoutBtn').addEventListener('click', logout);
  }

  /* Replace mobile menu footer Sign In / Sign Up with logout */
  function patchMobileNav() {
    const footer = document.querySelector('.mobile-menu-footer');
    if (!footer) return;
    footer.innerHTML = `
      <div style="padding:0.75rem;background:var(--light-surface);border-radius:12px;margin-bottom:0.5rem;font-size:0.875rem;color:var(--text-dark)">
        👋 Hi, <strong>${(user.fullName || 'User').split(' ')[0]}</strong>
      </div>
      <a href="resume.html" class="btn btn-secondary" style="width:100%;text-decoration:none;text-align:center">📄 My Resume</a>
      <button class="btn btn-primary" id="mobileLogoutBtn" style="width:100%">🚪 Logout</button>`;
    const mLogout = footer.querySelector('#mobileLogoutBtn');
    if (mLogout) mLogout.addEventListener('click', logout);
  }

  function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  /* Inline styles for chip & dropdown */
  const style = document.createElement('style');
  style.textContent = `
    .auth-user-chip {
      display: flex; align-items: center; gap: 0.75rem; position: relative;
    }
    .user-avatar-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #14b8a6, #8b5cf6);
      color: #fff; font-weight: 700; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; user-select: none;
      border: 2px solid rgba(20,184,166,0.4);
      transition: transform 0.2s;
    }
    .user-avatar-btn:hover { transform: scale(1.08); }
    .user-dropdown {
      position: absolute; top: calc(100% + 10px); right: 0;
      min-width: 200px; background: var(--light-card);
      border: 1px solid var(--border-light); border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      padding: 0.75rem; z-index: 9999;
      display: none; flex-direction: column; gap: 0.25rem;
    }
    body.dark-mode .user-dropdown {
      background: var(--dark-surface); border-color: var(--border-dark);
    }
    .user-dropdown.open { display: flex; }
    .user-dropdown-name { font-weight: 700; font-size: 0.9rem; color: var(--text-dark); }
    body.dark-mode .user-dropdown-name { color: #e2e8f0; }
    .user-dropdown-email { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .user-dropdown-item {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 0.625rem; border-radius: 8px;
      font-size: 0.875rem; color: var(--text-dark);
      text-decoration: none; border: none; background: none;
      cursor: pointer; width: 100%; text-align: left;
      font-family: inherit; transition: background 0.15s;
    }
    body.dark-mode .user-dropdown-item { color: #e2e8f0; }
    .user-dropdown-item:hover { background: rgba(20,184,166,0.08); }
    .logout-btn { color: #ef4444 !important; }
    .logout-btn:hover { background: rgba(239,68,68,0.08) !important; }
  `;
  document.head.appendChild(style);

  /* Run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { patchDesktopNav(); patchMobileNav(); });
  } else {
    patchDesktopNav();
    patchMobileNav();
  }
})();
