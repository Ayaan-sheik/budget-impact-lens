#!/bin/bash
# Test script for background scraper

echo "============================================================"
echo "Testing Background Scraper - Budget Impact Lens"
echo "============================================================"
echo ""

# Configuration
export SCRAPE_INTERVAL=120  # 2 minutes for testing
export RUN_SCRAPER_ON_STARTUP=true
export ENVIRONMENT=testing

cd "$(dirname "$0")"
source venv/bin/activate

echo "✅ Configuration:"
echo "   - Scrape interval: ${SCRAPE_INTERVAL}s"
echo "   - Run on startup: ${RUN_SCRAPER_ON_STARTUP}"
echo "   - Environment: ${ENVIRONMENT}"
echo ""

echo "🚀 Starting FastAPI server..."
echo "   Watch for startup scrape in 5 seconds..."
echo ""

# Start server (will show startup logs)
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

# Note: Press Ctrl+C to see graceful shutdown messages
