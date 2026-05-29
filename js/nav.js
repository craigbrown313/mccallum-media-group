/* nav.js — shared across all pages */

(function () {
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll class
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile menu
  let menuOpen = false;
  window.toggleMenu = function () {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
  };
  window.closeMenu = function () {
    menuOpen = false;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  };

  // Scroll reveal
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
