// ============================================================
//  ANIMATIONS.JS — Système d'animations centralisé
//  Chedoudoue Store
//
//  Convention de déclenchement : .reveal → .is-visible
//  (cohérent avec animations.css, index.html et collections.html)
//
//  Dépendances : aucune — chargeable sur n'importe quelle page
//  Auto-init  : document 'DOMContentLoaded'
// ============================================================

const AnimationSystem = (function () {

  // Lire la préférence système une seule fois au chargement
  var REDUCED_MOTION = false;
  try {
    REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) { /* ancien navigateur — animations désactivées */ }

  // ── SCROLL REVEAL ─────────────────────────────────────────
  //
  // Observe tous les éléments .reveal déjà présents dans le DOM et ajoute
  // .is-visible quand ils entrent dans le viewport (déclenché une seule fois).
  //
  // Sûr à exécuter en parallèle avec les initReveal() inline de
  // index.html et collections.html — .is-visible est idempotent et
  // on utilise :not(.is-visible) pour éviter toute double observation.
  function _initReveal() {
    var targets = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!targets.length) return;

    if (REDUCED_MOTION) {
      // Rendre tous les éléments immédiatement visibles sans animation
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        obs.unobserve(e.target); // fire once — évite tout travail inutile
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { obs.observe(el); });
  }

  // ── AUTO SECTION REVEAL ────────────────────────────────────
  //
  // Ajoute .reveal aux éléments de section courants qui sont SOUS le pli
  // (below the fold) et qui n'ont pas encore la classe .reveal.
  //
  // Les éléments au-dessus du pli sont ignorés — ils apparaissent
  // immédiatement sans flash ni masquage préalable.
  //
  // Les enfants du même parent sont décalés (stagger) automatiquement.
  function _initSectionReveal() {
    if (REDUCED_MOTION) return;

    var SELECTORS = [
      '.section-title:not(.reveal)',
      '.section-subtitle:not(.reveal)',
      '.page-title:not(.reveal)',
      '.footer-section:not(.reveal)',
      '.footer-bottom:not(.reveal)',
    ];

    var vh = window.innerHeight;
    // Seuil : uniquement les éléments hors viewport (top ≥ 90% de la hauteur)
    var FOLD_THRESHOLD = vh * 0.9;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // WeakMap pour compter les sibling déjà câblés par même parent
    var parentCount = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < FOLD_THRESHOLD) return; // au-dessus du pli — skip

        el.classList.add('reveal');

        // Décalage entre enfants du même parent (ex: plusieurs footer-section)
        if (parentCount) {
          var parent = el.parentNode;
          var count = parentCount.has(parent) ? parentCount.get(parent) : 0;
          if (count > 0) el.style.transitionDelay = (count * 90) + 'ms';
          parentCount.set(parent, count + 1);
        }

        obs.observe(el);
      });
    });
  }

  // ── STAGGERED CARD GRID ────────────────────────────────────
  //
  // Anime les .product-card d'un conteneur avec une cascade d'entrée.
  // Appel explicite depuis la page après le rendu dynamique :
  //   AnimationSystem.staggerCards(document.getElementById('products-grid'));
  //
  // Durée totale plafonnée à 380 ms quelle que soit la taille de la grille.
  // Nettoyage automatique des styles inline après la transition.
  function staggerCards(gridEl) {
    if (REDUCED_MOTION || !gridEl) return;

    var cards = Array.from(gridEl.querySelectorAll('.product-card'));
    if (!cards.length) return;

    // Délai entre chaque carte — max 60 ms, mais réduit sur les grandes grilles
    var step = Math.min(60, Math.round(380 / cards.length));

    // Premier frame : mettre toutes les cartes en état caché (synchronisé avec le paint)
    requestAnimationFrame(function () {
      cards.forEach(function (card) {
        card.style.transition = 'opacity 0.42s ease, transform 0.42s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateY(14px)';
      });

      // Deuxième frame : déclencher les révélations en cascade
      requestAnimationFrame(function () {
        cards.forEach(function (card, i) {
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            // Nettoyer les styles inline une fois la transition terminée
            card.addEventListener('transitionend', function () {
              card.style.removeProperty('opacity');
              card.style.removeProperty('transform');
              card.style.removeProperty('transition');
            }, { once: true });
          }, i * step);
        });
      });
    });
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    _initReveal();
    _initSectionReveal();
  }

  // ── API PUBLIQUE ───────────────────────────────────────────
  return {
    init: init,
    staggerCards: staggerCards,
  };

})();

// Auto-initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
  AnimationSystem.init();
});
