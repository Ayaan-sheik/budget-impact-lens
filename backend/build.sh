#!/bin/bash
# Render build script

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🎭 Installing Playwright browsers..."
playwright install chromium

echo "✅ Build complete!"
