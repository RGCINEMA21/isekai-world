@echo off
echo 🌍 ISEKAI WORLD - Starting server...
echo 📌 Buka browser ke: http://localhost:3000
echo 📌 Tekan Ctrl+C untuk stop
echo.
cd /d "%~dp0"
python -m http.server 3000
pause
