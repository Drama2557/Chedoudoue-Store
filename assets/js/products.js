// ============================================================
//  PRODUCTS.JS - Gestion du catalogue produits
// ============================================================

let products = [];
let filteredProducts = [];

// Charger les produits depuis le JSON
async function loadProducts() {
  try {
    let jsonPath = "assets/data/products.json";
    // Vérifier si on est dans un sous-dossier (pages/)
    if (window.location.pathname.includes('/pages/')) {
      jsonPath = "../assets/data/products.json";
    }
    
    const response = await fetch(jsonPath);
    const data = await response.json();
    products = data.products;
    filteredProducts = [...products];
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error);
    return null;
  }
}

// Obtenir les catégories uniques
function getCategories() {
  return [...new Set(products.map((p) => p.category))];
}

// Filtrer les produits
function filterProducts(filters = {}) {
  let filtered = [...products];

  if (filters.category && filters.category !== "tous") {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm),
    );
  }

  if (filters.sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (filters.sort === "newest") {
    filtered = filtered.filter((p) => p.new).sort((a, b) => b.new - a.new);
  } else if (filters.sort === "bestseller") {
    filtered = filtered.filter((p) => p.bestseller);
  }

  filteredProducts = filtered;
  return filtered;
}

// Obtenir un produit par ID
function getProductById(id) {
  return products.find((p) => p.id === id);
}

// Obtenir les produits en vedette
function getFeaturedProducts(limit = 6) {
  return products.filter((p) => p.featured).slice(0, limit);
}

// Obtenir les meilleures ventes
function getBestsellers(limit = 8) {
  return products.filter((p) => p.bestseller).slice(0, limit);
}

// Obtenir les nouveautés
function getNewProducts(limit = 8) {
  return products.filter((p) => p.new).slice(0, limit);
}

// Obtenir les produits par catégorie
function getProductsByCategory(category, limit = null) {
  let filtered = products.filter((p) => p.category === category);
  if (limit) filtered = filtered.slice(0, limit);
  return filtered;
}

// Créer une carte produit HTML
function createProductCard(product, variant = "default") {
  const discountPercent = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-wrapper">
        <img 
          src="assets/images/${getCategoryFolder(product.category)}/${product.image}" 
          alt="${product.name}" 
          class="product-image"
          loading="lazy"
        />
        ${product.new ? '<span class="badge badge-new">NOUVEAU</span>' : ""}
        ${discountPercent > 0 ? `<span class="badge badge-discount">-${discountPercent}%</span>` : ""}
        <div class="product-overlay">
          <a href="pages/produits.html?id=${product.id}" class="btn btn-view">
            Voir le détail
          </a>
          <button class="btn-wishlist" aria-label="Ajouter aux favoris">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-rating">
          ${createRatingStars(product.rating)}
          <span class="rating-text">(${product.reviews} avis)</span>
        </div>
        <div class="product-price">
          <span class="price-current">${product.price.toFixed(0)} €</span>
          ${product.original_price ? `<span class="price-original">${product.original_price.toFixed(0)} €</span>` : ""}
        </div>
        <button class="btn btn-add-cart" data-product-id="${product.id}">
          Ajouter au panier
        </button>
      </div>
    </article>
  `;
}

// Créer les étoiles de notation
function createRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<span class="star star-full">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<span class="star star-half">★</span>';
    } else {
      stars += '<span class="star star-empty">☆</span>';
    }
  }

  return `<div class="rating-stars">${stars}</div>`;
}

// Mapper les dossiers d'images par catégorie
function getCategoryFolder(category) {
  const folderMap = {
    bijoux: "bijoux",
    beaute: "lace-frontal",
    parfums: "parfums-unisex",
    sandales: "sandales-unisex",
    voyage: "valises-fille",
    femme: "vetements-femme",
    homme: "vetements-homme",
  };
  return folderMap[category] || category;
}

// Afficher les produits filtrés
function displayProducts(products, container) {
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
        <h3>Aucun produit ne correspond à votre recherche</h3>
        <p>Essayez d'ajuster vos filtres</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");

  // Réattacher les event listeners
  attachProductEventListeners();
}

// Event listeners pour les produits
function attachProductEventListeners() {
  document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.dataset.productId;
      const product = getProductById(productId);
      if (product) {
        addToCart(product);
        showNotification(`${product.name} ajouté au panier`);
      }
    });
  });

  document.querySelectorAll(".btn-wishlist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.classList.toggle("active");
    });
  });
}

// Notification simple
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification notification-success";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialisation
window.addEventListener("load", () => {
  loadProducts();
});
