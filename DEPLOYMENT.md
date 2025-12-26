# 🚀 Production Deployment Guide

## Quick Fix for Current Error

Your production backend is returning **404 errors** because either:
1. The Render deployment failed
2. The service isn't running
3. Wrong repository/branch configured

### Immediate Steps:

1. **Check Render Dashboard** (https://dashboard.render.com)
   - Go to your `budget-impact-lens-backend` service
   - Check the **Logs** tab for errors
   - Look for deployment status (should show "Live")

2. **Common Issues:**
   - ❌ Build failed → Check logs for Python/dependency errors
   - ❌ Service crashed → Check for missing environment variables
   - ❌ Wrong branch → Make sure it's deploying from `main`

3. **If deployment failed, redeploy with these settings:**

---

## 🔧 Render Deployment (Backend)

### Option 1: Using Blueprint (Recommended)

1. **Push the render.yaml file to your repo:**
   ```bash
   cd /home/bomber/Hackathon/budget-impact-lens
   git add backend/render.yaml backend/build.sh backend/Procfile
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to **Blueprints** → **New Blueprint Instance**
   - Connect your GitHub repo: `Ayaan-sheik/budget-impact-lens`
   - Render will auto-detect `backend/render.yaml`
   - Click **Apply**

3. **Add Environment Variables:**
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key
   - `GEMINI_API_KEY`: Your Gemini API key

### Option 2: Manual Setup

1. **Create New Web Service:**
   - Dashboard → **New** → **Web Service**
   - Connect GitHub: `Ayaan-sheik/budget-impact-lens`
   - Settings:
     - **Name**: `budget-impact-lens-backend`
     - **Root Directory**: `backend`
     - **Environment**: Python 3
     - **Build Command**: `bash build.sh`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

2. **Environment Variables:**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key
   GEMINI_MODEL=gemini-1.5-flash
   SCRAPE_INTERVAL=3600
   RUN_SCRAPER_ON_STARTUP=false
   ENVIRONMENT=production
   PYTHON_VERSION=3.10.12
   PLAYWRIGHT_BROWSERS_PATH=/opt/render/.cache/ms-playwright
   ```

3. **Deploy!**

### Troubleshooting Render Deployment

**Problem: Build Fails**
```bash
# Check logs for these common issues:
- "Module not found" → Missing dependency in requirements.txt
- "Playwright install failed" → Add PLAYWRIGHT_BROWSERS_PATH env var
- "Timeout" → Build script is too slow, disable startup scraper
```

**Solution:**
- Set `RUN_SCRAPER_ON_STARTUP=false` (scraper can timeout on free tier)
- Trigger scraping manually via API after deployment

**Problem: Service Crashes on Startup**
```bash
# Check logs for:
- ImportError → Missing environment variables
- Connection refused → Wrong SUPABASE_URL
- API key errors → Check GEMINI_API_KEY
```

**Solution:**
- Verify all environment variables are set
- Test locally first: `python3 backend/main.py`

---

## 🌐 Frontend Deployment (Vercel/Netlify)

### Current Issue: Wrong Backend URL

Your frontend is pointing to:
```
https://budget-impact-lens-backend.onrender.com
```

But your actual Render URL might be different. Check your Render dashboard.

### Update Frontend Configuration

1. **Create `.env.production` file:**
   ```bash
   cd frontend
   echo "VITE_API_URL=https://YOUR-ACTUAL-RENDER-URL.onrender.com" > .env.production
   ```

2. **Verify the URL format** (check Render dashboard):
   - Could be: `budget-impact-lens-backend.onrender.com`
   - Or: `budget-impact-lens.onrender.com`
   - Or: Custom domain you configured

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-render-url.onrender.com`
   - Redeploy

### Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd frontend
   netlify deploy --prod
   ```

3. **Environment Variables in Netlify:**
   - Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-render-url.onrender.com`
   - Trigger new build

---

## 🔍 Debugging Production Issues

### Test Backend Directly

```bash
# Replace with your actual Render URL
curl https://your-app.onrender.com/

# Should return:
{
  "name": "Budget Impact Lens API",
  "version": "1.0.0",
  "status": "running"
}
```

### Check CORS Headers

```bash
curl -I https://your-app.onrender.com/policies

# Should include:
Access-Control-Allow-Origin: *
```

### View Render Logs

```bash
# In Render Dashboard:
1. Click your service
2. Go to "Logs" tab
3. Look for startup messages:
   🚀 Budget Impact Lens API - Starting Up
   ✅ Background scraper task started
```

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables set in Render
- [ ] `render.yaml` pushed to GitHub
- [ ] Build script (`build.sh`) is executable
- [ ] `RUN_SCRAPER_ON_STARTUP=false` for free tier
- [ ] Supabase database has tables created
- [ ] Gemini API key is valid
- [ ] Frontend `.env.production` has correct backend URL
- [ ] CORS is enabled in backend (already done)

---

## 🚨 Current Error Fix

**Your exact error:**
```
CORS header 'Access-Control-Allow-Origin' missing
Status code: 404
```

**Root cause:** Backend isn't running (404 = not found)

**Fix:**
1. Go to https://dashboard.render.com
2. Check if your service exists and is "Live"
3. If it failed, check logs and redeploy
4. Get the actual URL from Render
5. Update frontend `VITE_API_URL` to match
6. Redeploy frontend

**Expected backend URL format:**
```
https://budget-impact-lens-backend.onrender.com
```
(But check your dashboard for the exact URL!)

---

## 💡 Free Tier Limitations

**Render Free Tier:**
- ⚠️ Service spins down after 15 mins of inactivity
- ⚠️ First request takes 50+ seconds (cold start)
- ⚠️ 750 hours/month free
- ⚠️ Limited CPU/RAM

**Recommendations:**
- Set `RUN_SCRAPER_ON_STARTUP=false`
- Trigger scraping manually via API
- Use cron jobs for periodic scraping (upgrade to paid)

**Cold Start Solution:**
```javascript
// In frontend, add loading state:
const [loading, setLoading] = useState(true);
const [coldStart, setColdStart] = useState(false);

// Show "Waking up server..." message if taking >5 seconds
```

---

## 🎯 Post-Deployment

Once backend is live:

1. **Test API:**
   ```bash
   curl https://your-render-url.onrender.com/health
   ```

2. **Trigger initial scrape:**
   ```bash
   curl -X POST https://your-render-url.onrender.com/trigger-scrape
   ```

3. **Check policies:**
   ```bash
   curl https://your-render-url.onrender.com/policies?limit=10
   ```

4. **Update frontend and redeploy**

5. **Test frontend:** Visit your Vercel/Netlify URL

---

## 📞 Support

If still having issues:
1. Share Render deployment logs
2. Share the actual Render URL from dashboard
3. Confirm environment variables are set
4. Test locally first: `cd backend && python3 main.py`
