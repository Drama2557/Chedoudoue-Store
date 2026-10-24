@echo off
REM ========================================
REM CHEDOUDOUE STORE - Démarrage Rapide
REM ========================================

REM Naviguer vers le dossier du projet (quel que soit l'endroit depuis lequel
REM le .bat est lancé)
cd /d "%~dp0"

echo.
echo  CHEDOUDOUE STORE
echo  Maison de Luxe Francaise Premium
echo.

REM Vérifier si Python est disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo  ERREUR : Python n'est pas installe ou introuvable dans PATH.
    echo  Telechargez Python depuis : https://www.python.org
    echo.
    pause
    exit /b 1
)

echo  Conseil : lancez "python verify.py" pour verifier l'integrite du projet.
echo.
echo  Demarrage du serveur local sur le port 8000...
echo.
echo  Ouvrez votre navigateur a :
echo     http://localhost:8000/
echo.
echo  Appuyez sur CTRL+C pour arreter le serveur.
echo ========================================
echo.

python -m http.server 8000

pause
