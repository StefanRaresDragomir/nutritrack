@echo off
title NutriTrack Backend Server (Port 3001)
cd /d "%~dp0"
echo Starting NutriTrack Secure Local Backend...
set "PATH=C:\Program Files\nodejs;%PATH%"
npm run backend
pause
