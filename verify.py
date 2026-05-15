#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CHEDOUDOUE STORE - Test de Vérification Rapide
Vérifie que toutes les pages et images se chargent correctement
"""

import os
import sys
import json
from pathlib import Path

def check_file(path, file_type="fichier"):
    """Vérifier qu'un fichier existe"""
    if os.path.exists(path):
        size = os.path.getsize(path)
        size_str = f"{size/1024:.1f}KB" if size > 1024 else f"{size}B"
        print(f"  ✅ {os.path.basename(path)} ({size_str})")
        return True
    else:
        print(f"  ❌ {os.path.basename(path)} - MANQUANT")
        return False

def check_images(folder, category_name, expected_count):
    """Vérifier les images d'une catégorie"""
    if os.path.exists(folder):
        images = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if len(images) == expected_count:
            print(f"  ✅ {category_name}: {len(images)} images")
            return True
        else:
            print(f"  ⚠️  {category_name}: {len(images)} images (attendu: {expected_count})")
            return False
    else:
        print(f"  ❌ {category_name}: DOSSIER MANQUANT")
        return False

def main():
    print("\n" + "="*60)
    print("CHEDOUDOUE STORE - Vérification du Site")
    print("="*60 + "\n")
    
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    
    all_good = True
    
    # 1. Vérifier les pages HTML
    print("📄 Pages HTML:")
    pages = [
        "index.html",
        "pages/shop.html",
        "pages/produits.html",
        "pages/cart.html",
        "pages/contact.html",
        "pages/about.html"
    ]
    for page in pages:
        if not check_file(page, "page"):
            all_good = False
    print()
    
    # 2. Vérifier les fichiers JS
    print("🔧 Fichiers JavaScript:")
    scripts = [
        "assets/js/products.js",
        "assets/js/cart.js"
    ]
    for script in scripts:
        if not check_file(script, "script"):
            all_good = False
    print()
    
    # 3. Vérifier les fichiers CSS
    print("🎨 Fichiers CSS:")
    styles = [
        "assets/css/theme.css"
    ]
    for style in styles:
        if not check_file(style, "style"):
            all_good = False
    print()
    
    # 4. Vérifier les données
    print("📊 Données:")
    if check_file("assets/data/products.json", "données"):
        with open("assets/data/products.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            product_count = len(data.get("products", []))
            category_count = len(data.get("categories", []))
            print(f"  📦 Produits: {product_count}")
            print(f"  🏷️  Catégories: {category_count}")
    else:
        all_good = False
    print()
    
    # 5. Vérifier les images
    print("🖼️  Images Produits:")
    image_categories = {
        "assets/images/bijoux": ("Bijoux", 9),
        "assets/images/lace-frontal": ("Beauté/Cheveux", 7),
        "assets/images/parfums-unisex": ("Parfums", 10),
        "assets/images/sandales-unisex": ("Sandales", 8),
        "assets/images/valises-fille": ("Voyage", 8),
        "assets/images/vetements-femme": ("Mode Femme", 10),
        "assets/images/vetements-homme": ("Mode Homme", 10)
    }
    
    total_images = 0
    for folder, (name, count) in image_categories.items():
        if check_images(folder, name, count):
            total_images += count
    
    print(f"  📊 Total: {total_images}/62 images")
    if total_images == 62:
        print("  ✅ TOUTES LES IMAGES PRÉSENTES!")
    else:
        print(f"  ⚠️  Manquent {62 - total_images} images")
        all_good = False
    print()
    
    # 6. Résumé
    print("="*60)
    if all_good and total_images == 62:
        print("✅ VÉRIFICATION RÉUSSIE - SITE PRÊT!")
        print("Lancez: python -m http.server 8000")
        print("Puis accédez à: http://localhost:8000/")
    else:
        print("⚠️  VÉRIFICATION INCOMPLÈTE - Vérifiez les fichiers manquants")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
