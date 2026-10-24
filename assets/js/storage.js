// ============================================================
//  STORAGE.JS — Centralized localStorage management
//  Chedoudoue Store
//
//  Provides a single, safe interface to localStorage so that
//  no other file ever calls localStorage directly.
//
//  Benefits over raw localStorage access:
//    · All storage keys in one place  (Store.KEYS)
//    · Graceful handling of Safari private-mode SecurityError
//    · Graceful handling of QuotaExceededError on save
//    · JSON parse/stringify handled once, not in every caller
//    · Namespaced clear() — never touches third-party keys
//    · Structural validate() to catch corrupted persisted data
//
//  Load order: must appear before cart.js in every HTML page.
// ============================================================

const Store = (function () {

  // ── Key registry ─────────────────────────────────────────────────────────────
  // Single source of truth for every localStorage key used by the project.
  // Any new feature that needs persistence should add its key here.

  const KEYS = {
    CART:     'chedoudoue_cart',      // ShoppingCart items array
    WISHLIST: 'chedoudoue_wishlist',  // Saved / favourite product IDs
    CONTACTS: 'chedoudoue_contacts',  // Contact form submissions
  };

  // Namespace prefix shared by all keys above.
  // clear() uses it to scope removal to project data only.
  const _PREFIX = 'chedoudoue_';

  // ── Storage availability ──────────────────────────────────────────────────────
  // Safari in private browsing throws a SecurityError on any localStorage
  // access. We probe once and cache the result.

  let _available = null;

  function isAvailable() {
    if (_available !== null) return _available;
    try {
      const probe = '__store_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      _available = true;
    } catch {
      _available = false;
    }
    return _available;
  }

  // ── Core primitives ───────────────────────────────────────────────────────────

  /**
   * Read a stored value and JSON-parse it.
   * Returns null when the key is absent, storage is blocked, or the
   * persisted string is not valid JSON (e.g. written by an older version).
   *
   * @param  {string} key  - One of Store.KEYS
   * @returns {*|null}
   */
  function get(key) {
    if (!isAvailable()) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      // JSON.parse failed — treat as absent
      return null;
    }
  }

  /**
   * JSON-stringify value and write it to localStorage.
   * Returns true on success, false when storage is blocked or full.
   * Logs a warning (not an error) on QuotaExceededError so the UI
   * stays functional while the developer is informed.
   *
   * @param  {string} key    - One of Store.KEYS
   * @param  {*}      value  - Any JSON-serialisable value
   * @returns {boolean}
   */
  function set(key, value) {
    if (!isAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // QuotaExceededError  → storage is full
      // SecurityError       → policy change mid-session (rare)
      console.warn('[Store] Sauvegarde impossible pour "' + key + '" (' + e.name + ')');
      return false;
    }
  }

  /**
   * Remove a single key. Safe to call when the key doesn't exist.
   *
   * @param {string} key - One of Store.KEYS
   */
  function remove(key) {
    if (!isAvailable()) return;
    localStorage.removeItem(key);
  }

  /**
   * Return true when a key is present and not null.
   *
   * @param  {string} key
   * @returns {boolean}
   */
  function exists(key) {
    if (!isAvailable()) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Remove every key that belongs to this project (prefix "chedoudoue_").
   * Never touches keys owned by third-party scripts on the same origin.
   */
  function clear() {
    if (!isAvailable()) return;
    Object.keys(localStorage)
      .filter(function (k) { return k.startsWith(_PREFIX); })
      .forEach(function (k) { localStorage.removeItem(k); });
  }

  // ── Structural validation ─────────────────────────────────────────────────────
  // Lightweight schema checker used when loading persisted data to confirm
  // the stored structure still matches what the application expects.
  //
  // Schema format examples:
  //   { type: 'array' }
  //   { type: 'array',  items: { required: ['id', 'name', 'price'] } }
  //   { type: 'object', required: ['id', 'total'] }

  /**
   * Validate that data conforms to schema.
   * Returns true only when data fully matches the described shape.
   *
   * @param  {*}      data    - Value returned by Store.get()
   * @param  {object} schema  - Shape descriptor (see examples above)
   * @returns {boolean}
   */
  function validate(data, schema) {
    if (!schema) return data !== null && data !== undefined;

    if (schema.type === 'array') {
      if (!Array.isArray(data)) return false;
      if (schema.items && schema.items.required) {
        var required = schema.items.required;
        return data.every(function (item) {
          if (item === null || typeof item !== 'object') return false;
          return required.every(function (field) {
            return Object.prototype.hasOwnProperty.call(item, field);
          });
        });
      }
      return true;
    }

    if (schema.type === 'object') {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;
      if (schema.required) {
        return schema.required.every(function (field) {
          return Object.prototype.hasOwnProperty.call(data, field);
        });
      }
      return true;
    }

    return true;
  }

  // ── Exports ───────────────────────────────────────────────────────────────────

  return {
    KEYS,
    isAvailable,
    get,
    set,
    remove,
    exists,
    clear,
    validate,
  };

})();
