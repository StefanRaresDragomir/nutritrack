@echo off
title NutriTrack Expo (Tunnel Mode)
cd /d "%~dp0"
echo Starting NutriTrack Expo in Tunnel Mode...
set "PATH=C:\Program Files\nodejs;%PATH%"
npx expo start --tunnel
pause
