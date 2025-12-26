# 🚀 Production Deployment Guide - Budget Impact Lens

## Background Scraper Engine

The FastAPI backend now includes an **automatic background scraper** that runs continuously without manual intervention.

### ✨ Features

#### 1. **Automatic Startup Scraping**
- Server starts → Waits 5 seconds → Runs initial scrape
- Ensures fresh data is available immediately
- Can be disabled via `RUN_SCRAPER_ON_STARTUP=false`

#### 2. **Periodic Scheduled Scraping**
- Automatically runs every `SCRAPE_INTERVAL` seconds
- Default: 1 hour (3600 seconds)
- Configurable via environment variable
- Handles errors gracefully with automatic retry

#### 3. **Graceful Shutdown**
- Properly cancels background tasks on server shutdown
- No orphaned processes or hanging connections
- Clean exit with status messages

#### 4. **Production-Ready Error Handling**
- Catches and logs all scraper errors
- Automatic retry after 5 minutes on failure
- Doesn't crash the server if scraping fails
- Detailed logging for debugging

## Environment Variables

Add these to your `.env` file:

```bash
# Scraper Configuration
SCRAPE_INTERVAL=3600           # Time between scrapes in seconds (1 hour)
RUN_SCRAPER_ON_STARTUP=true    # Run scraper when server starts
ENVIRONMENT=production          # Environment name

# Gemini AI
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### Recommended Intervals:

| Environment | Interval | Reason |
|------------|----------|--------|
| Development | 7200s (2 hours) | Avoid quota limits during testing |
| Staging | 3600s (1 hour) | Match production frequency |
| Production | 1800s (30 min) | Fresh data, more API calls |
| Low-traffic | 7200s (2 hours) | Conserve resources |

## API Endpoints for Scraper Control

### 1. Get Scraper Status
```bash
GET /scraper/status

Response:
{
  "is_running": false,
  "enabled": true,
  "last_run": "2025-12-26T12:00:00",
  "last_result": {...},
  "total_runs": 42,
  "scrape_interval_seconds": 3600,
  "run_on_startup": true
}
```

### 2. Toggle Scheduled Scraping
```bash
# Disable automatic scraping
POST /scraper/toggle?enabled=false

# Re-enable automatic scraping
POST /scraper/toggle?enabled=true

Response:
{
  "message": "Scheduled scraping enabled",
  "enabled": true,
  "timestamp": "2025-12-26T12:00:00"
}
```

### 3. Manual Trigger (works even if disabled)
```bash
POST /trigger-scrape

Response:
{
  "message": "Scraper started in background",
  "status": "started",
  "timestamp": "2025-12-26T12:00:00"
}
```

### 4. Retry AI Analysis
```bash
POST /retry-analysis?limit=50

Response:
{
  "message": "AI analysis retry started for up to 50 unanalyzed policies",
  "status": "started",
  "timestamp": "2025-12-26T12:00:00"
}
```

## Server Startup Logs

When you start the server, you'll see:

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

============================================================
Government Policy Web Scraper
============================================================
...
```

## Production Deployment

### Option 1: Docker (Recommended)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Environment variables
ENV SCRAPE_INTERVAL=3600
ENV RUN_SCRAPER_ON_STARTUP=true
ENV ENVIRONMENT=production

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t budget-impact-lens .
docker run -p 8000:8000 --env-file .env budget-impact-lens
```

### Option 2: systemd Service (Linux)

Create `/etc/systemd/system/budget-impact-lens.service`:

```ini
[Unit]
Description=Budget Impact Lens API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/budget-impact-lens/backend
Environment="PATH=/var/www/budget-impact-lens/backend/venv/bin"
EnvironmentFile=/var/www/budget-impact-lens/backend/.env
ExecStart=/var/www/budget-impact-lens/backend/venv/bin/fastapi run main.py --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable budget-impact-lens
sudo systemctl start budget-impact-lens
sudo systemctl status budget-impact-lens
```

### Option 3: PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start "fastapi run main.py --host 0.0.0.0 --port 8000" --name budget-impact-lens --interpreter python3

# Save configuration
pm2 save

# Setup auto-restart on boot
pm2 startup
```

### Option 4: Gunicorn with Uvicorn Workers

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Monitoring

### Health Check Endpoint

```bash
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-12-26T12:00:00",
  "scraper": {
    "is_running": false,
    "last_run": "2025-12-26T11:00:00",
    "total_runs": 42
  }
}
```

Set up monitoring with:
- **Uptime Kuma**: Self-hosted monitoring
- **Better Uptime**: Cloud-based monitoring
- **Cronitor**: Scheduled task monitoring

### Logging

The scraper logs include:
- `🔄` Scheduled scrape started
- `✅` Scrape completed successfully
- `❌` Errors with stack traces
- `⏸️` Scraper paused
- `🛑` Graceful shutdown

View logs:
```bash
# Docker
docker logs -f budget-impact-lens

# systemd
journalctl -u budget-impact-lens -f

# PM2
pm2 logs budget-impact-lens
```

## Production Checklist

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Configure appropriate `SCRAPE_INTERVAL` (recommended: 1800-3600s)
- [ ] Set `RUN_SCRAPER_ON_STARTUP=true` for fresh data
- [ ] Use production Supabase URL (not localhost)
- [ ] Secure your Gemini API key
- [ ] Set up CORS properly (not `allow_origins=["*"]`)
- [ ] Enable HTTPS in production
- [ ] Set up monitoring/health checks
- [ ] Configure log rotation
- [ ] Set up database backups
- [ ] Test graceful shutdown behavior
- [ ] Configure firewall rules

## Testing the Background Scraper

### Test Startup Scraping:
```bash
# Terminal 1: Start server and watch logs
fastapi dev main.py

# You should see:
# ⏰ Running initial scrape on startup...
# 🌐 Scraping with BeautifulSoup: Economic Times
```

### Test Scheduled Scraping:
```bash
# Set interval to 60 seconds for testing
export SCRAPE_INTERVAL=60

# Start server
fastapi dev main.py

# Watch it run every 60 seconds
```

### Test Toggle:
```bash
# Disable scheduled scraping
curl -X POST http://localhost:8000/scraper/toggle?enabled=false

# Check status
curl http://localhost:8000/scraper/status

# Re-enable
curl -X POST http://localhost:8000/scraper/toggle?enabled=true
```

### Test Graceful Shutdown:
```bash
# Start server
fastapi dev main.py

# Press Ctrl+C

# You should see:
# 🛑 Budget Impact Lens API - Shutting Down
# ✅ Scraper task cancelled successfully
```

## Troubleshooting

### Scraper not running automatically:
1. Check `scraper_state['enabled']` is `true`
2. Verify `SCRAPE_INTERVAL` is set
3. Check logs for errors
4. Ensure `lifespan` is attached to FastAPI app

### Scraper running too often:
- Increase `SCRAPE_INTERVAL` value
- Check if multiple instances are running

### Server hanging on shutdown:
- Ensure asyncio tasks are properly cancelled
- Check for blocking operations in scraper

### Out of memory:
- Reduce scrape frequency
- Implement rate limiting
- Use pagination for large datasets

## Performance Optimization

### For High Traffic:
```bash
# Use multiple Gunicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# But note: Each worker runs its own scraper!
# Better: Run scraper in separate process
```

### Separate Scraper Process:
```python
# scraper_daemon.py
import asyncio
from scraper import run_pib_scraper

async def main():
    while True:
        print("Running scraper...")
        run_pib_scraper()
        await asyncio.sleep(3600)

asyncio.run(main())
```

Run separately:
```bash
pm2 start scraper_daemon.py --name scraper
pm2 start "fastapi run main.py" --name api
```

## Success Metrics

✅ Server starts automatically  
✅ Initial scrape runs on startup  
✅ Periodic scraping every N seconds  
✅ Graceful shutdown with cleanup  
✅ Error handling with retry logic  
✅ Can be toggled on/off via API  
✅ Manual triggers still work  
✅ Full logging and monitoring  

---

**Status**: ✅ Production Ready  
**Last Updated**: December 26, 2025  
**Deployment**: Verified on FastAPI 0.115.0+
