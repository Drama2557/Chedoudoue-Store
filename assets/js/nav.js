/* Chedoudoue Store — Mobile navigation toggle (IIFE) */
(function () {
  var burger = document.getElementById('nav-burger');
  var menu   = document.getElementById('nav-mobile-menu');
  if (!burger || !menu) return;

  function open()  {
    menu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  /* Fermer en cliquant sur un lien */
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });

  /* Fermer en cliquant en dehors du nav */
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') && !e.target.closest('nav')) {
      close();
    }
  });

  /* Fermer sur Échap */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();

/* Chedoudoue Store — Navbar adaptative au scroll (IIFE)
   Compacte la navbar dès le premier scroll, la masque au scroll vers le bas
   et la fait réapparaître au scroll vers le haut. Styles : responsive.css §8. */
(function () {
  var SCROLL_THRESHOLD = 20;   /* passage en mode compact */
  var HIDE_THRESHOLD   = 240;  /* masquage possible au-delà */
  var ALWAYS_SHOW_ABOVE = 80;  /* toujours visible en haut de page */
  var MIN_DELTA        = 6;    /* anti-jitter (trackpad, rebond iOS) */

  /* La navbar fixe : le site a 5 variantes de markup (#navbar, nav.navbar,
     nav.cart-nav, #col-nav, <nav> nu) — on la reconnaît à son positionnement
     plutôt qu'à une liste de sélecteurs, ce qui écarte aussi les <nav> de fil
     d'Ariane qui ne sont pas fixes. */
  var nav = null;
  var candidates = document.querySelectorAll('nav');
  for (var i = 0; i < candidates.length; i++) {
    if (window.getComputedStyle(candidates[i]).position === 'fixed') {
      nav = candidates[i];
      break;
    }
  }
  if (!nav) return;

  nav.classList.add('nav-adaptive');

  var lastY   = window.pageYOffset || document.documentElement.scrollTop || 0;
  var ticking = false;

  function show() { nav.classList.remove('is-hidden'); }

  function update() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y < 0) y = 0; /* rebond élastique iOS */

    nav.classList.toggle('is-scrolled', y > SCROLL_THRESHOLD);

    var delta = y - lastY;
    if (Math.abs(delta) < MIN_DELTA) return;
    lastY = y;

    /* Le menu burger est un enfant du <nav> : le masquer emporterait le menu
       ouvert avec lui. */
    var menuOpen = !!nav.querySelector('.nav-mobile-menu.open');

    if (delta > 0 && y > HIDE_THRESHOLD && !menuOpen) {
      nav.classList.add('is-hidden');
    } else if (delta < 0 || y < ALWAYS_SHOW_ABOVE) {
      show();
    }
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  /* Un lien focusé au clavier ne doit jamais rester hors écran */
  nav.addEventListener('focusin', show);

  update(); /* état initial : rechargement en milieu de page */
})();
