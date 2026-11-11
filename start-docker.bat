@echo off
REM Script de démarrage Docker - KHIDMA Tchad
REM Windows

echo ============================================================
echo   KHIDMA Tchad - Demarrage Docker
echo ============================================================
echo.

echo [1/4] Verification de Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas installe ou n'est pas dans le PATH
    echo Installez Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo     OK - Docker installe

echo.
echo [2/4] Construction des images Docker...
docker-compose build
if errorlevel 1 (
    echo ERREUR lors de la construction
    pause
    exit /b 1
)

echo.
echo [3/4] Demarrage des conteneurs...
docker-compose up -d
if errorlevel 1 (
    echo ERREUR lors du demarrage
    pause
    exit /b 1
)

echo.
echo [4/4] Verification du statut...
timeout /t 3 >nul
docker-compose ps

echo.
echo ============================================================
echo   KHIDMA Tchad - Demarrage reussi !
echo ============================================================
echo.
echo   Frontend:     http://localhost
echo   Backend API:  http://localhost:3001/api
echo   Health Check: http://localhost:3001/health
echo.
echo Pour voir les logs:   docker-compose logs -f
echo Pour arreter:         docker-compose down
echo.
echo ============================================================

pause
