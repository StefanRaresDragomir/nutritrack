@echo off
title NutriTrack Expo Mobile App
cd /d "%~dp0"
echo Starting NutriTrack Expo App on 192.168.1.154...
set "PATH=C:\Program Files\nodejs;%PATH%"
set "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.154"
npm start
pause
