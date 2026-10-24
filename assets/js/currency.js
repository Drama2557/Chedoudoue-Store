// ============================================================
//  CURRENCY.JS  —  Dual-currency utility  (USD · HTG)
//  Chedoudoue Store   |   1 USD = 132 HTG
// ============================================================

const CURRENCY = (function () {
  const RATE = 132;

  function _fmtHTGNumber(usd) {
    return Math.round(usd * RATE).toLocaleString('fr-FR');
  }

  return {
    RATE,

    // "$450" or "$450.00"
    usd(amount, decimals) {
      decimals = decimals === undefined ? 0 : decimals;
      return '$' + Number(amount).toFixed(decimals);
    },

    // "59 400 HTG"
    htg(usdAmount) {
      return _fmtHTGNumber(usdAmount) + ' HTG';
    },

    // Full HTML price block for product cards
    //   $450  ~~$600~~
    //   59 400 HTG
    block(price, originalPrice) {
      var wasPart = originalPrice
        ? '<span class="price-was">' + this.usd(originalPrice) + '</span>'
        : '';
      return (
        '<div class="price-block">' +
          '<div class="price-row">' +
            '<span class="price-now">' + this.usd(price) + '</span>' +
            wasPart +
          '</div>' +
          '<div class="price-gdes">' + this.htg(price) + '</div>' +
        '</div>'
      );
    },

    // HTML for cart / checkout totals: "$900 59 400 HTG"
    total(amount, decimals) {
      decimals = decimals === undefined ? 0 : decimals;
      return (
        this.usd(amount, decimals) +
        '<span class="price-gdes-inline"> ' +
        this.htg(amount) +
        '</span>'
      );
    },

    // Plain text dual: "$900 · 59 400 HTG" (no HTML)
    text(amount, decimals) {
      decimals = decimals === undefined ? 0 : decimals;
      return this.usd(amount, decimals) + ' · ' + this.htg(amount);
    }
  };
})();
