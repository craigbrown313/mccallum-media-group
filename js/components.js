/* components.js — injects nav and footer into every page
   NOTE: Currently unused — pages ship nav/footer inline. Kept in sync
   with the McCallum Media Group identity so it stays a safe reference. */

(function () {
  const mountNav = document.getElementById('navMount');
  const mountFooter = document.getElementById('footerMount');
  if (!mountNav && !mountFooter) return; // not used on this page

  const page = document.body.dataset.page || '';

  function navLink(href, label) {
    const active = page === label.toLowerCase() ? ' class="active"' : '';
    return `<li><a href="${href}"${active}>${label}</a></li>`;
  }

  const LOGO_MARK = `<svg class="nav-logo-mark" width="30" height="30" viewBox="-185 -120 370 240" aria-hidden="true"><ellipse cx="0" cy="0" rx="142" ry="58" fill="none" stroke="#2DD4BF" stroke-width="4" opacity="0.55" transform="rotate(-22)"/><circle cx="0" cy="0" r="82" fill="none" stroke="#2DD4BF" stroke-width="8"/><path d="M-46 48 L-46 -46 L0 2 L46 -46 L46 48" fill="none" stroke="#2DD4BF" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/><circle cx="135" cy="-55" r="13" fill="#E9B85A"/></svg>`;

  const WORDMARK = `<span class="nav-logo-word"><span class="nav-logo-name">McCallum</span><span class="nav-logo-sub">Media Group</span></span>`;

  // ── NAV ──
  if (mountNav) {
    mountNav.innerHTML = `
<nav class="nav" id="mainNav">
  <a href="/index.html" class="nav-logo" aria-label="McCallum Media Group — home">${LOGO_MARK}${WORDMARK}</a>
  <ul class="nav-links">
    ${navLink('/work.html','Work')}
    ${navLink('/services.html','Services')}
    ${navLink('/productions.html','Productions')}
    ${navLink('/about.html','About')}
    ${navLink('/contact.html','Contact')}
  </ul>
  <div class="nav-right">
    <a href="/index.html#reel" class="nav-reel"><div class="reel-dot"></div>Reel</a>
    <a href="/contact.html" class="nav-cta">Start a Project</a>
    <button class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="/work.html"        onclick="closeMenu()">Work</a>
  <a href="/services.html"    onclick="closeMenu()">Services</a>
  <a href="/productions.html" onclick="closeMenu()">Productions</a>
  <a href="/about.html"       onclick="closeMenu()">About</a>
  <a href="/contact.html"     onclick="closeMenu()">Contact</a>
  <div class="mobile-menu-cta">
    <a href="/contact.html" class="btn btn-teal" onclick="closeMenu()">Start a Project</a>
  </div>
</div>`;
  }

  // ── FOOTER ──
  if (mountFooter) {
    mountFooter.innerHTML = `
<footer>
  <div class="footer-logo"><svg class="footer-logo-mark" width="24" height="24" viewBox="-185 -120 370 240" aria-hidden="true"><ellipse cx="0" cy="0" rx="142" ry="58" fill="none" stroke="#2DD4BF" stroke-width="4" opacity="0.55" transform="rotate(-22)"/><circle cx="0" cy="0" r="82" fill="none" stroke="#2DD4BF" stroke-width="8"/><path d="M-46 48 L-46 -46 L0 2 L46 -46 L46 48" fill="none" stroke="#2DD4BF" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/><circle cx="135" cy="-55" r="13" fill="#E9B85A"/></svg><span class="footer-logo-txt">McCallum <em>Media Group</em></span></div>
  <div class="footer-links">
    <a href="/work.html">Work</a>
    <a href="/services.html">Services</a>
    <a href="/productions.html">Productions</a>
    <a href="/about.html">About</a>
    <a href="/contact.html">Contact</a>
  </div>
  <div class="footer-copy">© 2024 McCallum Media Group All rights reserved.</div>
</footer>`;
  }
})();
