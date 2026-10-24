# CHEDOUDOUE STORE — Guide du Projet

## Description

CHEDOUDOUE STORE est un site e-commerce de **luxe haut de gamme** entièrement en **français**, conçu comme un véritable marketplace premium comparable aux grandes marques de mode.

Le site présente une **esthétique noire et or luxueuse**, avec animations fluides, typographies élégantes et une expérience utilisateur cinématographique.

---

## Structure du Projet

```
Site Arena Test/
├── index.html                      # Page d'accueil premium
├── START.bat                       # Lancement rapide (Windows)
├── verify.py                       # Vérification de l'intégrité du projet
├── GUIDE.md                        # Ce fichier
├── IMPROVEMENTS.md                 # Journal des améliorations
│
├── assets/
│   ├── css/
│   │   ├── theme.css               # Variables globales (couleurs, espacements)
│   │   ├── style.css               # Styles généraux
│   │   ├── components.css          # Composants réutilisables
│   │   ├── premium.css             # Styles luxe spécifiques
│   │   ├── animations.css          # Animations et transitions
│   │   ├── notifications.css       # Styles de notifications toast
│   │   └── responsive.css          # Media queries mobiles
│   │
│   ├── js/
│   │   ├── currency.js             # Formatage des prix et devises
│   │   ├── products.js             # Catalogue produits, filtres, rendu
│   │   ├── cart.js                 # Panier (localStorage)
│   │   ├── main.js                 # Initialisation navbar, loader
│   │   ├── app.js                  # Point d'entrée de l'application
│   │   └── effects.js              # Curseur personnalisé, scroll reveal, parallax
│   │
│   ├── data/
│   │   └── products.json           # Catalogue complet (76 articles)
│   │
│   ├── logo/
│   │   └── logo.jpg                # Logo de la marque
│   │
│   └── images/
│       ├── bijoux/                 # Images bijoux standard
│       ├── lace-frontal/           # Images beauté / cheveux standard
│       ├── parfums-unisex/         # Images parfums standard
│       ├── sandales-unisex/        # Images sandales standard
│       ├── valises-fille/          # Images voyage standard
│       ├── vetements-femme/        # Images mode femme standard
│       ├── vetements-homme/        # Images mode homme standard
│       └── hd/                     # Images haute résolution (hero, éditoriales)
│
└── pages/
    ├── shop.html                   # Boutique avec filtres et tri
    ├── produits.html               # Fiche produit détaillée
    ├── cart.html                   # Panier d'achat
    ├── checkout.html               # Tunnel de paiement
    ├── confirmation.html           # Confirmation de commande
    ├── collections.html            # Page des collections
    ├── about.html                  # La Maison (À Propos)
    └── contact.html                # Contact et Support
```

---

## Pages

### `index.html` — Page d'Accueil
- Hero slider cinématique (images HD en rotation automatique, Ken Burns)
- Section **"Les Collections Phares"** — 6 produits vedettes chargés dynamiquement
- Section **éditoriale split** — visuel HD grand format avec texte de collection
- Newsletter
- Footer premium 4 colonnes
- Navbar sticky avec glassmorphism

### `pages/shop.html` — La Boutique
- Grille produits responsive (4 col → 2 col → 1 col)
- Filtres fonctionnels : catégorie, tranche de prix, status (nouveautés / best-sellers)
- Tri : prix croissant/décroissant, meilleure note, plus récent
- Compteur de produits dynamique

### `pages/produits.html` — Fiche Produit
- Grande image produit
- Informations complètes : matière, poids, catégorie, disponibilité
- Notation par étoiles et nombre d'avis
- Sélecteur de quantité, ajout au panier, ajout aux favoris

### `pages/cart.html` — Panier
- Liste des articles avec images et quantités
- Contrôle +/− et suppression par article
- Résumé automatique : sous-total, livraison (gratuite > 100 €), taxes 20 %, total
- Message "panier vide" avec lien vers la boutique

### `pages/checkout.html` — Paiement
- Formulaire de commande
- Résumé de commande

### `pages/confirmation.html` — Confirmation
- Page de confirmation après commande

### `pages/collections.html` — Collections
- Présentation des univers de la marque

### `pages/about.html` — La Maison
- Histoire de la marque
- Valeurs et engagements
- Showcase des collections

### `pages/contact.html` — Contact
- Formulaire de contact (messages sauvegardés en localStorage)
- Coordonnées, chat en direct

---

## Fonctionnalités Techniques

### Panier
- Persistance `localStorage` (clé `chedoudoue_cart`)
- Ajout, suppression, modification de quantité
- Compteur dynamique dans la navbar
- Calcul automatique des totaux

### Produits
- Chargement depuis `products.json` via `fetch()`
- Filtrage par catégorie, prix, status
- Tri par prix, note, date
- Lazy loading des images
- Badges automatiques (NOUVEAU, -X%)

### Images
- Images standard : `assets/images/{catégorie}/{fichier}`
- Images HD : `assets/images/hd/{fichier}` (identifiées par `"image_folder": "hd"` dans le JSON)
- Le champ `image_folder` dans le JSON surclasse le dossier par défaut de la catégorie
- Spaces dans les noms de fichiers gérés nativement (pas d'encodage URL nécessaire côté JSON)

### Animations de scroll
- `.reveal` / `.is-visible` via IntersectionObserver (titres, sous-titres, formulaire, footer)
- Stagger sur les cartes produits au scroll (fade + slide-up)
- Section éditoriale : animation séquentielle (eyebrow → ligne → titre → description → signature)
- `prefers-reduced-motion` respecté dans `animations.css`

---

## Design

### Palette
| Couleur       | Code      | Usage                      |
|---------------|-----------|----------------------------|
| Or Luxe       | `#d4af37` | Titres, accents, CTA       |
| Noir Profond  | `#0a0a0a` | Fond principal             |
| Ivoire        | `#f5f5f0` | Texte principal            |
| Gris Graphite | `#1a1a1a` | Accents secondaires        |

### Typographies
| Police              | Variable CSS           | Usage             |
|---------------------|------------------------|-------------------|
| Cinzel              | `--font-display`       | Titres, headings  |
| Cormorant Garamond  | `--font-editorial`     | Éditorial, sous-titres |
| Montserrat          | `--font-body`          | Corps, interface  |

---

## Responsive

| Breakpoint         | Comportement                            |
|--------------------|-----------------------------------------|
| Desktop (> 768px)  | Grille 4 colonnes, layout plein écran   |
| Tablette (480–768) | Grille 2–3 colonnes                     |
| Mobile (< 480px)   | Grille 1 colonne, nav collapse          |

---

## Données (localStorage)

| Clé                    | Contenu                       |
|------------------------|-------------------------------|
| `chedoudoue_cart`      | Articles du panier (JSON)     |
| `chedoudoue_contacts`  | Messages de contact (JSON)    |
| `chedoudoue_wishlist`  | Articles favoris (JSON)       |

---

## Démarrage Local

### Option 1 — Script Windows
Double-cliquez sur `START.bat`.

### Option 2 — Terminal
```bash
cd "Site Arena Test"
python -m http.server 8000
# Ouvrez : http://localhost:8000/
```

### Vérification de l'intégrité
```bash
python verify.py
```
Ce script vérifie les pages, CSS, JS, images et la cohérence du catalogue.

---

## Navigateurs Compatibles
- Chrome / Edge (versions récentes)
- Firefox (versions récentes)
- Safari (versions récentes)
- iOS Safari, Chrome Android

---

## Statistiques

| Métrique                  | Valeur         |
|---------------------------|----------------|
| Pages HTML                | 9              |
| Fichiers CSS              | 7              |
| Fichiers JavaScript       | 6              |
| Produits                  | 76            |
| Catégories                | 7              |
| Images standard           | 62             |
| Images HD                 | 19             |
| Lignes CSS approximatives | 3 500+         |
| Lignes JS approximatives  | 1 500+         |

---

## Améliorations Futures

- [ ] Intégration paiement réel (Stripe / PayPal)
- [ ] Compte client et historique de commandes
- [ ] Système de coupons / codes promo
- [ ] Avis clients avec photos
- [ ] Comparateur de produits
- [ ] Recherche avancée avec auto-complétion
- [ ] Recommandations produits
- [ ] Mode sombre / clair toggle

---

## Support

- Email : contact@chedoudoue.fr
- Tél : +33 (0)1 23 45 67 89
- Formulaire : `pages/contact.html`

---

**CHEDOUDOUE STORE** © 2026 — Luxe Français Premium
