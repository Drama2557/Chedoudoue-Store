// ============================================================
//  FAVORITES.JS — Système de favoris / liste de souhaits
//  Chedoudoue Store
//
//  Branche le bouton .btn-wishlist (généré par createProductCard
//  dans products.js) sur localStorage via Store.KEYS.WISHLIST.
//
//  Fonctionnement :
//    · Event delegation sur document — fonctionne pour les cartes
//      rendues dynamiquement (shop.html, index.html, etc.)
//    · MutationObserver — met à jour l'état des nouveaux boutons
//      insérés dans le DOM après le rendu initial
//    · Auto-init au chargement de la page
//
//  Dépendance : storage.js doit être chargé avant ce fichier.
//
//  API publique :
//    Favorites.add(productId)       → ajoute aux favoris
//    Favorites.remove(productId)    → retire des favoris
//    Favorites.toggle(productId)    → bascule l'état
//    Favorites.contains(productId)  → booléen
//    Favorites.getAll()             → tableau des IDs favoris
//    Favorites.count()              → nombre de favoris
//    Favorites.clear()              → vide la liste
//    Favorites.updateButtons()      → synchronise l'UI avec le storage
//    Favorites.init()               → attache les listeners
// ============================================================

const Favorites = (function () {

  // ── Persistance ──────────────────────────────────────────────────────────────

  function _load() {
    return Store.get(Store.KEYS.WISHLIST) || [];
  }

  function _save(ids) {
    Store.set(Store.KEYS.WISHLIST, ids);
  }

  // ── UI ───────────────────────────────────────────────────────────────────────

  function _updateButton(btn, isActive) {
    btn.classList.toggle('active', isActive);
    var label = isActive ? 'Retirer des favoris' : 'Ajouter aux favoris';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  // Remonte depuis .btn-wishlist jusqu'au [data-product-id] de la carte parent.
  function _getProductIdFromBtn(btn) {
    var card = btn.closest('[data-product-id]');
    return card ? card.dataset.productId : null;
  }

  // ── API publique ──────────────────────────────────────────────────────────────

  /**
   * Ajoute un produit aux favoris. Sans effet si déjà présent.
   * @param {string} productId
   */
  function add(productId) {
    var ids = _load();
    if (ids.indexOf(productId) !== -1) return;
    ids.push(productId);
    _save(ids);
    document.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      if (_getProductIdFromBtn(btn) === productId) _updateButton(btn, true);
    });
  }

  /**
   * Retire un produit des favoris. Sans effet s'il est absent.
   * @param {string} productId
   */
  function remove(productId) {
    var ids = _load().filter(function (id) { return id !== productId; });
    _save(ids);
    document.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      if (_getProductIdFromBtn(btn) === productId) _updateButton(btn, false);
    });
  }

  /**
   * Bascule l'état favori d'un produit.
   * @param {string} productId
   */
  function toggle(productId) {
    if (contains(productId)) {
      remove(productId);
    } else {
      add(productId);
    }
  }

  /**
   * Vérifie si un produit est dans les favoris.
   * @param {string} productId
   * @returns {boolean}
   */
  function contains(productId) {
    return _load().indexOf(productId) !== -1;
  }

  /**
   * Retourne le tableau de tous les IDs favoris.
   * @returns {string[]}
   */
  function getAll() {
    return _load();
  }

  /**
   * Retourne le nombre de produits favoris.
   * @returns {number}
   */
  function count() {
    return _load().length;
  }

  /**
   * Vide entièrement la liste des favoris et réinitialise l'UI.
   */
  function clear() {
    Store.remove(Store.KEYS.WISHLIST);
    document.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      _updateButton(btn, false);
    });
  }

  /**
   * Parcourt tous les .btn-wishlist présents dans le DOM et applique
   * l'état correct (actif/inactif) selon le storage.
   * À appeler après chaque rendu dynamique de cartes produit.
   */
  function updateButtons() {
    var ids = _load();
    document.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      var productId = _getProductIdFromBtn(btn);
      if (productId) _updateButton(btn, ids.indexOf(productId) !== -1);
    });
  }

  /**
   * Initialise le système :
   *   1. Event delegation sur document pour les clics sur .btn-wishlist
   *   2. MutationObserver pour détecter les nouvelles cartes rendues dynamiquement
   *   3. Mise à jour initiale de l'UI
   */
  function init() {
    // ── Event delegation ────────────────────────────────────────────────────────
    // Utilise le bubbling pour capturer les clics sur tous les .btn-wishlist,
    // y compris ceux créés après le chargement de la page (shop.html, etc.).
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-wishlist');
      if (!btn) return;
      var productId = _getProductIdFromBtn(btn);
      if (!productId) return;
      e.preventDefault();
      toggle(productId);
    });

    // ── MutationObserver ────────────────────────────────────────────────────────
    // Met à jour l'état des boutons insérés dynamiquement (ex. renderProduits
    // sur shop.html). Ne réagit que si des .btn-wishlist sont effectivement
    // ajoutés — évite le surcoût des mutations non pertinentes.
    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        var needsUpdate = false;
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node.nodeType !== 1) continue;
            if (
              node.classList.contains('btn-wishlist') ||
              node.querySelector('.btn-wishlist')
            ) {
              needsUpdate = true;
              break;
            }
          }
          if (needsUpdate) break;
        }
        if (needsUpdate) updateButtons();
      }).observe(document.body, { childList: true, subtree: true });
    }

    // ── État initial ─────────────────────────────────────────────────────────────
    updateButtons();
  }

  // Auto-init : fonctionne que le script soit chargé avant ou après DOMContentLoaded.
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // ── Exports ───────────────────────────────────────────────────────────────────

  return {
    add: add,
    remove: remove,
    toggle: toggle,
    contains: contains,
    getAll: getAll,
    count: count,
    clear: clear,
    updateButtons: updateButtons,
    init: init,
  };

})();
