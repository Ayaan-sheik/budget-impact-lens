# 🚨 IMMEDIATE ACTION REQUIRED: Set Render Environment Variables

## Current Status

✅ **Backend is LIVE:** https://budget-impact-lens.onrender.com  
✅ **Frontend configuration is CORRECT** - using full URLs  
❌ **Database connection FAILED** - "Connection refused"

## Problem

Your backend is deployed but **can't connect to Supabase** because environment variables are missing in Render.

Error: `{"detail":"[Errno 111] Connection refused"}`

This happens when `SUPABASE_URL` or `SUPABASE_KEY` are not set.

---

## ✅ SOLUTION: Add Environment Variables in Render

### Step 1: Go to Render Dashboard

1. Visit: https://dashboard.render.com
2. Click on your service: **budget-impact-lens**
3. Go to **Environment** tab (left sidebar)

### Step 2: Add These Environment Variables

Click **Add Environment Variable** for each:

```bash
# Required - Supabase Connection
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>

# Required - AI Analysis
GEMINI_API_KEY=AIzaSyBZMSBXMKot3VLXipYfnYkTBc1t9c-Ome4
GEMINI_MODEL=gemini-1.5-flash

# Optional - Scraper Configuration
SCRAPE_INTERVAL=3600
RUN_SCRAPER_ON_STARTUP=false
ENVIRONMENT=production
```

### Step 3: Get Your Supabase Credentials

**Option A: From Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_KEY`

**Option B: From Your Local .env File**

```bash
cat backend/.env | grep SUPABASE
```

Copy the values and add them to Render.

### Step 4: Save and Redeploy

1. After adding all variables, click **Save Changes**
2. Render will automatically redeploy
3. Wait 2-3 minutes for deployment to complete

---

## 🧪 Test After Deployment

Run this command to verify it works:

```bash
curl https://budget-impact-lens.onrender.com/policies?limit=5
```

**Expected response:**
```json
{
  "data": [...],
  "count": 5,
  "offset": 0,
  "limit": 5
}
```

**If you still get errors:**
- Check Render logs for specific error messages
- Verify SUPABASE_URL format: `https://xxxxx.supabase.co`
- Verify SUPABASE_KEY is the **anon/public key**, not the service role key

---

## 📋 Complete Environment Variables Checklist

Copy this into Render (Environment tab):

| Variable Name | Value | Required? |
|--------------|-------|-----------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | ✅ YES |
| `SUPABASE_KEY` | `eyJhbG...` (anon key) | ✅ YES |
| `GEMINI_API_KEY` | `AIzaSyBZMSBXMKot3VLXipYfnYkTBc1t9c-Ome4` | ✅ YES |
| `GEMINI_MODEL` | `gemini-1.5-flash` | ✅ YES |
| `SCRAPE_INTERVAL` | `3600` | ⚪ Optional |
| `RUN_SCRAPER_ON_STARTUP` | `false` | ⚪ Optional |
| `ENVIRONMENT` | `production` | ⚪ Optional |

---

## 🎯 Frontend is Already Configured Correctly!

Your frontend is already using the correct URL:

```typescript
// ✅ CORRECT - Already in your code
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const response = await fetch(`${API_BASE_URL}/policies?limit=50`);
```

**Production (.env.production):**
```bash
VITE_API_URL=https://budget-impact-lens.onrender.com
```

**Local Development (.env.local):**
```bash
VITE_API_URL=http://localhost:8000
```

✅ **No changes needed to frontend!** Just fix the backend environment variables.

---

## 🔄 What Happens Next

1. **Add environment variables in Render** → Takes 1 minute
2. **Render auto-redeploys** → Takes 2-3 minutes
3. **Backend connects to Supabase** → Works!
4. **Frontend loads data** → Success!

No code changes needed. Just configuration.

---

## 🆘 Still Having Issues?

Check the Render logs:
1. Render Dashboard → Your Service
2. Click **Logs** tab
3. Look for error messages
4. Common issues:
   - `Connection refused` = Missing SUPABASE_URL or SUPABASE_KEY
   - `Invalid API key` = Wrong GEMINI_API_KEY
   - `Authentication failed` = Wrong SUPABASE_KEY (using service role instead of anon key)

Share the logs if you need help debugging.
