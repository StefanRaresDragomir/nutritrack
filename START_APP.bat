@echo off
title NutriTrack Expo Mobile App
cd /d "%~dp0"
echo Starting NutriTrack in Expo Go mode...
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.154"
npx expo start --go
pause
