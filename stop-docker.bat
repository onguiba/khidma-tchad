@echo off
REM Script d'arrêt Docker - KHIDMA Tchad
REM Windows

echo ============================================================
echo   KHIDMA Tchad - Arret Docker
echo ============================================================
echo.

echo Arret des conteneurs...
docker-compose down

echo.
echo ============================================================
echo   Conteneurs arretes avec succes !
echo ============================================================
echo.

pause
