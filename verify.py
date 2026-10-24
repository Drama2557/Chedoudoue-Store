#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CHEDOUDOUE STORE — Outil de vérification du projet

Vérifie :
  - Présence de toutes les pages HTML
  - Présence de tous les fichiers CSS et JS
  - Présence du logo et des données JSON
  - Cohérence du catalogue produits (champs requis, images sur disque)
  - Dossiers d'images standard et HD

Usage : python verify.py
"""

import os
import sys
import json
from pathlib import Path


# ── helpers ──────────────────────────────────────────────────────────────────

def check_file(root, rel_path):
    """Vérifie qu'un fichier existe. Retourne True/False et affiche le résultat."""
    full = os.path.join(root, rel_path)
    if os.path.isfile(full):
        size = os.path.getsize(full)
        size_str = f"{size / 1024:.1f} KB" if size >= 1024 else f"{size} B"
        print(f"  OK   {rel_path} ({size_str})")
        return True
    print(f"  MANQUANT   {rel_path}")
    return False


def count_images(folder):
    """Retourne le nombre d'images (jpg/jpeg/png/webp) dans un dossier."""
    if not os.path.isdir(folder):
        return -1
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    return sum(1 for f in os.listdir(folder) if Path(f).suffix.lower() in exts)


# ── section checks ───────────────────────────────────────────────────────────

def check_pages(root):
    print("Pages HTML")
    pages = [
        "index.html",
        "pages/shop.html",
        "pages/produits.html",
        "pages/cart.html",
        "pages/checkout.html",
        "pages/confirmation.html",
        "pages/collections.html",
        "pages/about.html",
        "pages/contact.html",
    ]
    results = [check_file(root, p) for p in pages]
    print()
    return all(results)


def check_css(root):
    print("Fichiers CSS")
    files = [
        "assets/css/theme.css",
        "assets/css/style.css",
        "assets/css/components.css",
        "assets/css/premium.css",
        "assets/css/animations.css",
        "assets/css/notifications.css",
        "assets/css/responsive.css",
    ]
    results = [check_file(root, f) for f in files]
    print()
    return all(results)


def check_js(root):
    print("Fichiers JavaScript")
    files = [
        "assets/js/currency.js",
        "assets/js/products.js",
        "assets/js/cart.js",
        "assets/js/main.js",
        "assets/js/app.js",
        "assets/js/effects.js",
    ]
    results = [check_file(root, f) for f in files]
    print()
    return all(results)


def check_static_assets(root):
    print("Ressources statiques")
    files = [
        "assets/logo/logo.jpg",
        "assets/data/products.json",
    ]
    results = [check_file(root, f) for f in files]
    print()
    return all(results)


def check_images(root):
    print("Images produits")

    # Standard category folders with expected counts from original catalogue
    categories = [
        ("assets/images/bijoux",          "Bijoux"),
        ("assets/images/lace-frontal",    "Beauté / Cheveux"),
        ("assets/images/parfums-unisex",  "Parfums"),
        ("assets/images/sandales-unisex", "Sandales"),
        ("assets/images/valises-fille",   "Voyage"),
        ("assets/images/vetements-femme", "Mode Femme"),
        ("assets/images/vetements-homme", "Mode Homme"),
    ]

    total_standard = 0
    all_ok = True
    for rel, name in categories:
        full = os.path.join(root, rel)
        count = count_images(full)
        if count == -1:
            print(f"  MANQUANT   {name} (dossier absent : {rel})")
            all_ok = False
        else:
            print(f"  OK   {name}: {count} image(s)  ({rel})")
            total_standard += count

    # HD folder (no required minimum — just report the count)
    hd_path = os.path.join(root, "assets/images/hd")
    hd_count = count_images(hd_path)
    if hd_count == -1:
        print("  MANQUANT   HD haute résolution (dossier absent : assets/images/hd)")
        all_ok = False
    else:
        print(f"  OK   HD haute résolution: {hd_count} image(s)  (assets/images/hd)")

    print(f"\n  Total images standard : {total_standard}")
    print(f"  Total images HD       : {hd_count if hd_count >= 0 else 0}")
    print(f"  Total général         : {total_standard + max(hd_count, 0)}")
    print()
    return all_ok


def check_products_json(root):
    print("Catalogue produits (products.json)")

    json_path = os.path.join(root, "assets/data/products.json")
    if not os.path.isfile(json_path):
        print("  MANQUANT   products.json introuvable")
        print()
        return False

    try:
        with open(json_path, encoding="utf-8") as fh:
            data = json.load(fh)
    except json.JSONDecodeError as exc:
        print(f"  ERREUR JSON   {exc}")
        print()
        return False

    products   = data.get("products", [])
    categories = data.get("categories", [])
    print(f"  OK   {len(products)} produit(s), {len(categories)} catégorie(s)")

    # Map category → image folder (mirrors getImageFolder() in products.js)
    folder_map = {
        "bijoux":    "bijoux",
        "beaute":    "lace-frontal",
        "parfums":   "parfums-unisex",
        "sandales":  "sandales-unisex",
        "voyage":    "valises-fille",
        "femme":     "vetements-femme",
        "homme":     "vetements-homme",
    }

    required_fields = {"id", "name", "category", "price", "image"}
    field_errors    = []
    missing_images  = []

    for p in products:
        pid = p.get("id", "?")

        # Check required fields
        missing_fields = required_fields - p.keys()
        if missing_fields:
            field_errors.append(f"{pid} : champs manquants — {sorted(missing_fields)}")
            continue  # skip image check if fields are missing

        # Resolve image path (same logic as products.js getImageFolder)
        image_folder = p.get("image_folder") or folder_map.get(p["category"], p["category"])
        image_file   = p.get("image", "")
        if image_file:
            image_path = os.path.join(root, "assets", "images", image_folder, image_file)
            if not os.path.isfile(image_path):
                missing_images.append(
                    f"{pid} → assets/images/{image_folder}/{image_file}"
                )

    # Report field errors
    if field_errors:
        print(f"\n  Champs manquants ({len(field_errors)} produit(s)) :")
        for e in field_errors[:10]:
            print(f"    {e}")
        if len(field_errors) > 10:
            print(f"    … et {len(field_errors) - 10} autre(s)")
    else:
        print("  OK   Tous les produits ont les champs requis")

    # Report missing images
    if missing_images:
        print(f"\n  Images référencées introuvables ({len(missing_images)}) :")
        for m in missing_images[:10]:
            print(f"    {m}")
        if len(missing_images) > 10:
            print(f"    … et {len(missing_images) - 10} autre(s)")
    else:
        print("  OK   Toutes les images référencées sont présentes sur disque")

    print()
    return not field_errors and not missing_images


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print()
    print("=" * 58)
    print("  CHEDOUDOUE STORE — Vérification du projet")
    print("=" * 58)
    print()

    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root)

    sections = [
        ("Pages HTML",      check_pages(root)),
        ("CSS",             check_css(root)),
        ("JavaScript",      check_js(root)),
        ("Ressources",      check_static_assets(root)),
        ("Images",          check_images(root)),
        ("Produits JSON",   check_products_json(root)),
    ]

    failed = [name for name, ok in sections if not ok]

    print("=" * 58)
    if not failed:
        print("  VERIFICATION REUSSIE — Projet complet et coherent")
        print()
        print("  Pour lancer le site :")
        print("    python -m http.server 8000")
        print("    Puis ouvrez : http://localhost:8000/")
    else:
        print(f"  {len(failed)} section(s) avec probleme(s) :")
        for name in failed:
            print(f"    - {name}")
        print()
        print("  Corrigez les elements marques MANQUANT ci-dessus.")
    print("=" * 58)
    print()

    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
