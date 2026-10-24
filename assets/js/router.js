// ============================================================
//  ROUTER.JS — Product routing for Chedoudoue Store
//
//  Centralises three concerns that were scattered across the
//  produits.html inline script:
//    1. Safe extraction of the ?id= URL parameter
//    2. Product existence validation before the page renders
//    3. Canonical image / page URL construction for pages/
//
//  Depends on products.js being loaded first (loadProducts,
//  getProductById, getImageFolder must be in scope).
// ============================================================

const ProductRouter = (function () {

  // Only accept IDs that match catalogue format: word chars + hyphens, ≤ 64 chars.
  // Rejects empty strings, path traversal, HTML injection, etc.
  const VALID_ID = /^[\w-]{1,64}$/;

  // Safe fallback when a product ID is absent or unrecognised.
  const FALLBACK = 'shop.html';

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Extract the ?id= query param and validate its format.
   * Returns the sanitised string, or null if absent or malformed.
   */
  function getProductId() {
    const raw = new URLSearchParams(window.location.search).get('id');
    if (!raw || !VALID_ID.test(raw)) return null;
    return raw;
  }

  /**
   * Full product resolution flow:
   *   1. Validate the URL param (redirect immediately if missing/malformed).
   *   2. Fetch the catalogue via loadProducts() from products.js.
   *   3. Look up the product with getProductById().
   *   4. Call onFound(product) on success.
   *   5. Call onNotFound(id) — or redirect — when the ID is structurally
   *      valid but matches no catalogue entry.
   *
   * @param {function} onFound    - Receives the matched product object.
   * @param {function} [onNotFound] - Receives the unmatched ID string.
   *                                  Omit to get an automatic redirect instead.
   */
  async function resolve(onFound, onNotFound) {
    const id = getProductId();
    if (!id) {
      _redirect();
      return;
    }

    await loadProducts();

    const product = getProductById(id);
    if (!product) {
      if (typeof onNotFound === 'function') {
        onNotFound(id);
      } else {
        _redirect();
      }
      return;
    }

    onFound(product);
  }

  /**
   * Build the src path to a product's main image from within pages/.
   * Delegates folder resolution to getImageFolder() in products.js,
   * which handles the image_folder override for HD images.
   *
   * @param {object} product - A product object from the catalogue.
   * @returns {string} Relative path starting with ../assets/images/
   */
  function buildImagePath(product) {
    const folder = getImageFolder(product);
    return '../assets/images/' + folder + '/' + product.image;
  }

  /**
   * Build a navigable URL to a product detail page.
   *
   * @param {string}  productId - A product's id field from the catalogue.
   * @param {boolean} fromRoot  - Pass true when the link originates from a
   *                              root-level page (index.html). Defaults to
   *                              false for pages inside pages/.
   * @returns {string} Relative URL with encoded id parameter.
   */
  function buildProductUrl(productId, fromRoot) {
    const base = fromRoot ? 'pages/produits.html' : 'produits.html';
    return base + '?id=' + encodeURIComponent(productId);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  function _redirect() {
    window.location.replace(FALLBACK);
  }

  // ── Exports ──────────────────────────────────────────────────────────────────

  return { getProductId, resolve, buildImagePath, buildProductUrl };

})();
