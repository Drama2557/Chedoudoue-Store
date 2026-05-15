@echo off
REM ========================================
REM CHEDOUDOUE STORE - Démarrage Rapide
REM ========================================

echo.
echo 🎉 Bienvenue sur CHEDOUDOUE STORE
echo Maison de Luxe Française Premium
echo.
echo ⏳ Démarrage du serveur local...
echo.

REM Vérifier si Python est disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou pas dans PATH
    echo Téléchargez Python depuis : https://www.python.org
    pause
    exit /b 1
)

REM Lancer le serveur
echo ✅ Serveur démarré avec succès !
echo.
echo 🌐 Ouvrez votre navigateur à :
echo    http://localhost:8000/
echo.
echo 📌 Touches utiles :
echo    CTRL + C pour arrêter le serveur
echo.
echo ========================================

python -m http.server 8000

pause
