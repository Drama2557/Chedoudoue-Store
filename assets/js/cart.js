// ============================================================
//  CART.JS - Gestion du panier d'achat
// ============================================================

class ShoppingCart {
  constructor() {
    this.items = [];
    this.loadFromStorage();
  }

  // Charger le panier depuis localStorage
  loadFromStorage() {
    const stored = localStorage.getItem("chedoudoue_cart");
    if (stored) {
      try {
        this.items = JSON.parse(stored);
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        this.items = [];
      }
    }
  }

  // Sauvegarder le panier dans localStorage
  saveToStorage() {
    localStorage.setItem("chedoudoue_cart", JSON.stringify(this.items));
    this.updateCartCount();
  }

  // Ajouter un article au panier
  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image: product.image,
        category: product.category,
        quantity: quantity,
      });
    }

    this.saveToStorage();
    return existingItem ? "updated" : "added";
  }

  // Retirer un article du panier
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveToStorage();
  }

  // Mettre à jour la quantité
  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
      }
    }
  }

  // Obtenir le nombre total d'articles
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Obtenir le prix total
  getTotalPrice() {
    return this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  // Obtenir les économies
  getTotalSavings() {
    return this.items.reduce((total, item) => {
      const savings =
        ((item.original_price || item.price) - item.price) * item.quantity;
      return total + Math.max(0, savings);
    }, 0);
  }

  // Vider le panier
  clear() {
    this.items = [];
    this.saveToStorage();
  }

  // Obtenir tous les articles
  getItems() {
    return [...this.items];
  }

  // Obtenir les articles du panier (alias)
  getCartItems() {
    return [...this.items];
  }

  // Mettre à jour un article
  updateItem(productId, quantity) {
    this.updateQuantity(productId, quantity);
  }

  // Vérifier si le panier est vide
  isEmpty() {
    return this.items.length === 0;
  }

  // Mettre à jour le compteur du panier dans la navbar
  updateCartCount() {
    const cartBadges = document.querySelectorAll(
      ".cart-count, [data-cart-count]",
    );
    const count = this.getTotalItems();

    cartBadges.forEach((badge) => {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    });
  }

  // Afficher les articles du panier
  displayCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.isEmpty()) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>Votre panier est vide</h3>
          <p>Découvrez notre collection complète</p>
          <a href="../pages/shop.html" class="btn btn-gold">Continuer les achats</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-item" data-product-id="${item.id}">
        <img src="../assets/images/${getCategoryFolder(item.category)}/${item.image}" alt="${item.name}" class="cart-item-image"/>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-category">${item.category}</p>
          <p class="cart-item-price">${item.price} €</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn qty-minus" data-product-id="${item.id}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-product-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">
          ${(item.price * item.quantity).toFixed(0)} €
        </div>
        <button class="cart-item-remove" data-product-id="${item.id}" aria-label="Supprimer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h16zM10 11v6M14 11v6"></path>
          </svg>
        </button>
      </div>
    `,
      )
      .join("");

    // Attacher les event listeners
    this.attachCartEventListeners();
  }

  // Afficher le résumé du panier
  displayCartSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container || this.isEmpty()) return;

    const subtotal = this.getTotalPrice();
    const savings = this.getTotalSavings();
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;

    container.innerHTML = `
      <div class="cart-summary">
        <h3>Résumé de la commande</h3>
        <div class="summary-line">
          <span>Sous-total</span>
          <span>${subtotal.toFixed(0)} €</span>
        </div>
        ${
          savings > 0
            ? `
          <div class="summary-line summary-savings">
            <span>Économies</span>
            <span>-${savings.toFixed(0)} €</span>
          </div>
        `
            : ""
        }
        <div class="summary-line">
          <span>Livraison</span>
          <span>${shipping === 0 ? "Gratuite" : shipping + " €"}</span>
        </div>
        <div class="summary-line summary-total">
          <span>Total</span>
          <span>${total.toFixed(0)} €</span>
        </div>
        <a href="checkout.html" class="btn btn-gold btn-full">Procéder au paiement</a>
        <a href="shop.html" class="btn btn-outline btn-full">Continuer les achats</a>
      </div>
    `;
  }

  // Attacher les event listeners du panier
  attachCartEventListeners() {
    document.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.productId;
        const item = this.items.find((i) => i.id === productId);
        if (item) {
          this.updateQuantity(productId, item.quantity - 1);
          this.displayCartItems("cart-items");
          this.displayCartSummary("cart-summary");
        }
      });
    });

    document.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.productId;
        const item = this.items.find((i) => i.id === productId);
        if (item) {
          this.updateQuantity(productId, item.quantity + 1);
          this.displayCartItems("cart-items");
          this.displayCartSummary("cart-summary");
        }
      });
    });

    document.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.productId;
        this.removeItem(productId);
        this.displayCartItems("cart-items");
        this.displayCartSummary("cart-summary");
      });
    });
  }
}

// Instance globale du panier
let cart = new ShoppingCart();

// Fonction globale pour ajouter au panier
function addToCart(product, quantity = 1) {
  if (!product || !product.id) {
    console.error("Produit invalide");
    return false;
  }
  cart.addItem(product, quantity);
  return true;
}

// Initialiser les mises à jour du panier au chargement
document.addEventListener("DOMContentLoaded", () => {
  cart.updateCartCount();
});
