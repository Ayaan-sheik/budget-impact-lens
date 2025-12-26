# 🚨 URGENT FIX: Production 404 & CORS Errors

## Your Current Error

```
Cross-Origin Request Blocked: CORS header 'Access-Control-Allow-Origin' missing
Status code: 404
URL: https://budget-impact-lens-backend.onrender.com/categories
```

## Root Cause

**The 404 error means your backend isn't deployed or isn't running.** The CORS error is a side effect—you can't get CORS headers from a non-existent endpoint.

---

## ✅ Step-by-Step Fix

### Step 1: Check Render Deployment

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Find your backend service**
3. **Check the status:**
   - ✅ **"Live"** = Working (go to Step 2)
   - ❌ **"Build Failed"** = Fix build (go to Step 3)
   - ❌ **"Deploy Failed"** = Fix deployment (go to Step 3)
   - ❌ **Service doesn't exist** = Create it (go to Step 4)

### Step 2: Backend is Live - Verify URL

If your service shows "Live":

1. **Get the actual URL from Render dashboard**
   - Look for "Your service is live at: https://..."
   - Copy this exact URL

2. **Test it in your browser:**
   ```
   https://YOUR-ACTUAL-URL.onrender.com/
   ```
   
   Should return:
   ```json
   {
     "name": "Budget Impact Lens API",
     "version": "1.0.0",
     "status": "running"
   }
   ```

3. **If it doesn't work:**
   - Check Render logs for errors
   - Look for startup messages
   - Check environment variables are set

4. **Update frontend with correct URL:**
   ```bash
   cd frontend
   echo "VITE_API_URL=https://YOUR-ACTUAL-URL.onrender.com" > .env.production
   git add .env.production
   git commit -m "Fix production API URL"
   git push
   ```

5. **Redeploy frontend** (Vercel will auto-deploy, or run `vercel --prod`)

### Step 3: Build/Deploy Failed

**Check Render Logs:**

1. Go to service → **Logs** tab
2. Look for error messages

**Common Errors:**

#### Error: "Module not found: google.genai"

**Fix:** Already fixed! Just redeploy:
```bash
cd /home/bomber/Hackathon/budget-impact-lens
git add backend/
git commit -m "Fix Gemini imports for production"
git push origin main
```

Render will auto-redeploy.

#### Error: "playwright install failed"

**Fix:** Environment variable missing

1. Go to Environment tab in Render
2. Add: `PLAYWRIGHT_BROWSERS_PATH=/opt/render/.cache/ms-playwright`
3. Click "Save"
4. Manual Deploy → "Deploy latest commit"

#### Error: "Build timeout" or "Start timeout"

**Fix:** Disable startup scraper (it's too slow for free tier)

1. Go to Environment tab
2. Change: `RUN_SCRAPER_ON_STARTUP=false`
3. Save and redeploy

### Step 4: Service Doesn't Exist - Deploy It

**Quick Deploy (Using render.yaml):**

1. **Push deployment config to GitHub:**
   ```bash
   cd /home/bomber/Hackathon/budget-impact-lens
   git add backend/render.yaml backend/build.sh backend/Procfile
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **In Render:**
   - Click **New** → **Blueprint**
   - Connect repo: `Ayaan-sheik/budget-impact-lens`
   - Render detects `backend/render.yaml`
   - Click **Apply**

3. **Add Environment Variables:**
   ```
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_KEY=<your-supabase-key>
   GEMINI_API_KEY=AIzaSyBZMSBXMKot3VLXipYfnYkTBc1t9c-Ome4
   ```

4. **Deploy!**

**OR Manual Deploy:**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

---

## 🔍 Quick Diagnostic Commands

**Test if backend is alive:**
```bash
curl https://budget-impact-lens-backend.onrender.com/
```

**Expected response:**
```json
{
  "name": "Budget Impact Lens API",
  "version": "1.0.0",
  "status": "running"
}
```

**Test CORS:**
```bash
curl -I https://budget-impact-lens-backend.onrender.com/policies
```

**Should include:**
```
Access-Control-Allow-Origin: *
```

**Test locally to verify code works:**
```bash
cd backend
python3 main.py
# In another terminal:
curl http://localhost:8000/
```

---

## 📋 Deployment Checklist

Before deploying:

- [ ] Latest code pushed to GitHub (`git push origin main`)
- [ ] `analyzer.py` has correct imports (google.generativeai)
- [ ] `render.yaml` exists in `backend/` folder
- [ ] `build.sh` is executable (`chmod +x build.sh`)
- [ ] Requirements.txt has all dependencies

Environment variables in Render:

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_KEY` - Your Supabase anon key
- [ ] `GEMINI_API_KEY` - Your Gemini API key
- [ ] `GEMINI_MODEL=gemini-1.5-flash`
- [ ] `RUN_SCRAPER_ON_STARTUP=false` (important for free tier!)
- [ ] `SCRAPE_INTERVAL=3600`
- [ ] `ENVIRONMENT=production`
- [ ] `PLAYWRIGHT_BROWSERS_PATH=/opt/render/.cache/ms-playwright`

After backend is live:

- [ ] Copy exact URL from Render dashboard
- [ ] Update `frontend/.env.production` with correct URL
- [ ] Push frontend changes to GitHub
- [ ] Redeploy frontend (Vercel auto-deploys)
- [ ] Test frontend → backend connection

---

## 🎯 Most Likely Issue

Based on your error, the most likely scenarios are:

1. **Backend never deployed** → Follow Step 4 above
2. **Backend deployment failed** → Check logs, follow Step 3
3. **Wrong URL in frontend** → Follow Step 2

**Quick check:** Can you access https://dashboard.render.com and see a service called "budget-impact-lens-backend"?

- **Yes, and it's Live** → Problem is frontend URL, update `.env.production`
- **Yes, but it's failed** → Check logs and fix errors
- **No** → Deploy it using Step 4

---

## 💬 Still Stuck?

Share these details:
1. Screenshot of your Render dashboard showing service status
2. Last 50 lines of Render logs (if service exists)
3. Result of: `curl https://budget-impact-lens-backend.onrender.com/`
4. Confirm: Did you set all environment variables in Render?

The backend code is correct and has proper CORS. The issue is 100% deployment-related.
