@echo off
REM Script de test Docker - KHIDMA Tchad
REM Windows

echo ============================================================
echo   KHIDMA Tchad - Test de la configuration Docker
echo ============================================================
echo.

echo [1/3] Test de la base de donnees...
docker-compose exec backend node test-db.js

echo.
echo [2/3] Test du Health Check API...
curl http://localhost:3001/health
echo.

echo.
echo [3/3] Test du endpoint API categories...
curl http://localhost:3001/api/categories
echo.

echo.
echo ============================================================
echo   Tests termines !
echo ============================================================
echo.

pause
