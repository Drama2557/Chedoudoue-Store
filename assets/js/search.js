// ============================================================
//  SEARCH.JS — Moteur de recherche produits
//  Chedoudoue Store
//
//  Dépendances : aucune (module autonome)
//  Utilisé par : pages/shop.html (+ toute page qui charge products.json)
// ============================================================

const ProductSearch = (function () {

  // Champs interrogés sur chaque produit, par ordre de pertinence
  const SEARCH_FIELDS = ['name', 'description', 'collection', 'category', 'badge', 'material'];

  // ── HELPERS PRIVÉS ─────────────────────────────────────────

  // Minuscules + suppression des diacritiques (é→e, ç→c, etc.)
  // Nécessaire pour que "bijou" trouve "Bijoux", "éclat" trouve "eclat", etc.
  function _normalize(str) {
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  // Retourne une version déboncée de fn, utile pour les gros catalogues
  function _debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  // Échappe les caractères spéciaux d'une chaîne pour usage en RegExp
  function _escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── API PUBLIQUE ────────────────────────────────────────────

  /**
   * Filtre une liste de produits selon une requête textuelle.
   *
   * Logique : chaque mot de la requête doit correspondre à AU MOINS UN champ
   * (matching ET entre mots, OU entre champs).
   * Ex : "bague or" → produit doit contenir "bague" quelque part ET "or" quelque part.
   *
   * @param  {Array}  productList  Tableau brut issu de products.json
   * @param  {string} query        Texte saisi par l'utilisateur
   * @returns {Array}              Sous-ensemble correspondant
   */
  function filter(productList, query) {
    var q = _normalize(query.trim());
    if (!q) return productList;

    var tokens = q.split(/\s+/).filter(Boolean);

    return productList.filter(function (product) {
      return tokens.every(function (token) {
        return SEARCH_FIELDS.some(function (field) {
          var val = product[field];
          return val != null && _normalize(String(val)).indexOf(token) !== -1;
        });
      });
    });
  }

  /**
   * Entoure les occurrences du query dans un texte par <mark class="search-highlight">.
   * Sûr : seul le texte source (données internes) est injecté en HTML ;
   *       le query passe uniquement par RegExp après échappement.
   *
   * @param  {string} text   Texte d'origine (ex : product.name)
   * @param  {string} query  Requête en cours
   * @returns {string}       Texte avec balises <mark> autour des correspondances
   */
  function highlight(text, query) {
    var q = query.trim();
    if (!q || !text) return text;

    var tokens = q.split(/\s+/).filter(Boolean);
    var result = String(text);

    tokens.forEach(function (token) {
      try {
        var re = new RegExp('(' + _escapeRegex(_normalize(token)) + ')', 'gi');
        result = result.replace(re, '<mark class="search-highlight">$1</mark>');
      } catch (_) { /* token invalide en RegExp — on ignore */ }
    });

    return result;
  }

  /**
   * Retourne un gestionnaire d'événement `input` prêt à brancher sur un <input>.
   * Applique un débounce de 280 ms — adapté pour les catalogues > 500 produits.
   * Pour ce projet (76 produits), l'effet est quasi-immédiat.
   *
   * @param  {Function} getProductsFn  Retourne le tableau de produits courant
   * @param  {Function} callback       Appelé avec (filteredProducts, rawQuery)
   * @returns {Function}               Handler à passer à addEventListener('input', …)
   */
  function createInputHandler(getProductsFn, callback) {
    return _debounce(function (e) {
      var query = (e && e.target && e.target.value) || '';
      var all = typeof getProductsFn === 'function' ? getProductsFn() : [];
      callback(filter(all, query), query);
    }, 280);
  }

  return { filter, highlight, createInputHandler };

})();
