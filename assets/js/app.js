// Point d'entrée de l'application
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialiser l'UI & Effets
  mainModule.initNavbar();
  effectsModule.initCursor();
  effectsModule.initScrollReveal();
  effectsModule.initParallax();

  // 2. Initialiser le Panier
  cartModule.updateBadge();

  // 3. Routage dynamique basique selon la page
  const currentPath = window.location.pathname;

  if (currentPath.includes("index.html") || currentPath === "/") {
    renderProducts("featured-products-container", "featured");
  } else if (currentPath.includes("shop.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category") || "all";
    renderProducts("shop-products-container", category);
  } else if (currentPath.includes("cart.html")) {
    cartModule.renderCartPage();
  } else if (currentPath.includes("produit.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    // Logique de rendu de la page produit unique (à implémenter via JS ou serveur)
  }

  // 4. Fin de chargement
  mainModule.removeLoader();
});
