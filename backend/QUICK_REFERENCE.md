# 🚀 Quick Reference - Background Scraper

## Start Server

```bash
cd backend
source venv/bin/activate
fastapi run main.py  # Production
# OR
fastapi dev main.py  # Development
```

## Environment Variables

```bash
# Add to backend/.env
SCRAPE_INTERVAL=3600              # 1 hour (in seconds)
RUN_SCRAPER_ON_STARTUP=true       # Auto-scrape on startup
ENVIRONMENT=production            # Environment name
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info + scraper status |
| `/health` | GET | Health check |
| `/scraper/status` | GET | Detailed scraper status |
| `/scraper/toggle?enabled=true` | POST | Enable/disable scheduled scraping |
| `/trigger-scrape` | POST | Manual scrape (works when disabled) |
| `/retry-analysis?limit=50` | POST | Retry AI analysis |
| `/policies?limit=50` | GET | Get policies |

## Quick Tests

```bash
# Check status
curl http://localhost:8000/scraper/status

# Pause scheduled scraping
curl -X POST http://localhost:8000/scraper/toggle?enabled=false

# Manual trigger (still works!)
curl -X POST http://localhost:8000/trigger-scrape

# Resume scheduled scraping  
curl -X POST http://localhost:8000/scraper/toggle?enabled=true

# Check health
curl http://localhost:8000/health
```

## What Happens Automatically

1. **Server starts** → Background task created
2. **Wait 5 seconds** → Initial scrape runs
3. **Wait SCRAPE_INTERVAL** → Next scrape runs
4. **Repeat forever** → Or until server stops
5. **Server stops** (Ctrl+C) → Graceful shutdown

## Startup Logs

```
============================================================
🚀 Budget Impact Lens API - Starting Up
============================================================
📍 Environment: production
⏰ Scrape interval: 3600s (60 minutes)
🔄 Run on startup: True
🤖 AI Model: gemini-2.5-flash
============================================================

✅ Background scraper task started

⏰ Running initial scrape on startup...
```

## Production Deployment

### Docker
```bash
docker run -p 8000:8000 --env-file .env budget-impact-lens
```

### Systemd
```bash
sudo systemctl start budget-impact-lens
sudo systemctl status budget-impact-lens
```

### PM2
```bash
pm2 start "fastapi run main.py" --name api
pm2 logs api
```

## Files to Check

- ✅ `backend/main.py` - Background scraper implementation
- ✅ `backend/.env` - Configuration
- ✅ `backend/BACKGROUND_SCRAPER_SUMMARY.md` - Full documentation
- ✅ `backend/PRODUCTION_DEPLOYMENT.md` - Deployment guide
- ✅ `backend/test_background_scraper.sh` - Test script

## Success Checklist

- [x] Lifespan context manager implemented
- [x] Periodic scraper with configurable interval
- [x] Automatic startup scraping (optional)
- [x] Graceful shutdown on Ctrl+C
- [x] Error handling with retry logic
- [x] Toggle endpoint to pause/resume
- [x] Manual trigger always works
- [x] Comprehensive logging
- [x] Production-ready

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: December 26, 2025
