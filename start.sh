#!/bin/bash
echo "🌍 ISEKAI WORLD - Starting server..."
echo "📌 Buka browser ke: http://localhost:3000"
echo "📌 Tekan Ctrl+C untuk stop"
echo ""
cd "$(dirname "$0")"
python3 -m http.server 3000
