@echo off
echo.
echo  =========================================
echo   KHIDMA TCHAD - Demarrage du Backend
echo  =========================================
echo.
echo  Demarrage du serveur API sur http://localhost:3001
echo.
cd /d "%~dp0backend"
node server.js
pause
