# ⚠️ IMPORTANT: Update Backend URL

## Current Status

The `.env.local` file is configured, but the **exact Render backend URL** needs to be verified.

## How to Find Your Render Backend URL

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your backend service**
3. **Look for the URL** at the top (e.g., `https://your-service-name.onrender.com`)
4. **Copy the exact URL**

## Common Render URL Patterns

- `https://budget-impact-lens.onrender.com`
- `https://budget-impact-lens-backend.onrender.com`
- `https://budget-impact-lens-api.onrender.com`
- Or whatever you named your service

## Update the Frontend Configuration

### Option 1: Quick Update (Recommended)

```bash
# Edit frontend/.env.local and replace with your EXACT Render URL
nano frontend/.env.local

# Change this line:
VITE_API_URL=https://budget-impact-lens.onrender.com

# To your actual URL (example):
VITE_API_URL=https://your-actual-service-name.onrender.com
```

### Option 2: Command Line

```bash
# Replace YOUR_ACTUAL_URL with your real Render URL
echo "VITE_API_URL=https://YOUR_ACTUAL_URL.onrender.com" > frontend/.env.local
```

## Verify Backend is Running

### 1. Test Health Endpoint
```bash
# Replace with your actual URL
curl https://YOUR_RENDER_URL.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "scraper": {
    "is_running": false,
    "last_run": "...",
    "total_runs": 5
  }
}
```

### 2. Test Policies Endpoint
```bash
curl https://YOUR_RENDER_URL.onrender.com/policies?limit=3
```

**Expected response:** Array of policies

### 3. Check Render Dashboard

- **Service Status:** Should show "Live" (green)
- **Logs:** Should show server startup messages
- **Environment Variables:** Should be set correctly

## Common Issues

### 502 Bad Gateway
**Cause:** Service is starting up or crashed

**Solutions:**
- Wait 30-60 seconds for service to wake up (free tier)
- Check Render logs for errors
- Verify build was successful
- Restart service in Render dashboard

### 404 Not Found
**Cause:** Wrong URL or service not deployed

**Solutions:**
- Double-check URL spelling
- Verify service is deployed
- Check if you're using the correct Render URL
- Try accessing root endpoint: `https://YOUR_URL.onrender.com/`

### CORS Errors
**Cause:** Backend CORS not configured

**Solutions:**
- Already configured to allow all origins (`allow_origins=["*"]`)
- If you restricted CORS, add your frontend domain

## After Updating URL

1. **Save the file**
2. **Restart frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Test in browser:**
   - Go to http://localhost:8081/feed
   - Open browser console (F12)
   - Check Network tab for API requests
   - Should see requests to your Render URL

## Quick Test Command

```bash
# Replace YOUR_RENDER_URL with your actual URL
export BACKEND_URL="https://YOUR_RENDER_URL.onrender.com"

echo "Testing: $BACKEND_URL"
curl -s "$BACKEND_URL/health" | python3 -m json.tool
```

## File Locations

- **Frontend Config:** `frontend/.env.local`
- **Frontend Code:** `frontend/src/pages/FeedPage.tsx` (already updated)
- **Test Script:** `test-connection.sh` (update BACKEND_URL variable)

## Next Steps

1. ✅ **Get your exact Render URL** from dashboard
2. ✅ **Update `frontend/.env.local`** with correct URL
3. ✅ **Test backend** with curl commands above
4. ✅ **Restart frontend** dev server
5. ✅ **Visit** http://localhost:8081/feed
6. ✅ **Verify** policies load from Render backend

---

**Once you have the correct URL, update it in:**
- `frontend/.env.local`
- `test-connection.sh` (BACKEND_URL variable)
- Run: `bash test-connection.sh` to verify
