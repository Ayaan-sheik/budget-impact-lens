# 🚀 Deployment Checklist - Frontend ↔️ Backend Connection

## ✅ Completed Steps

### Backend Deployment (Render)
- [x] Backend deployed on Render
- [x] Background scraper configured
- [x] CORS enabled for all origins
- [x] Environment variables set on Render

### Frontend Configuration
- [x] `.env.local` created with backend URL
- [x] `FeedPage.tsx` updated to use `import.meta.env.VITE_API_URL`
- [x] `.env.example` created for reference
- [x] `.gitignore` already includes `*.local`
- [x] API keys removed from markdown files

## 🔧 Configuration Files

### Frontend `.env.local`
```bash
VITE_API_URL=https://budget-impact-lens-backend.onrender.com
```

### Backend CORS (main.py)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Testing Steps

### 1. Test Backend Health
```bash
curl https://budget-impact-lens-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "scraper": {...}
}
```

### 2. Test Backend Policies API
```bash
curl https://budget-impact-lens-backend.onrender.com/policies?limit=5
```

Should return array of policies.

### 3. Test Frontend Connection

1. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   # or
   bun dev
   ```

2. **Navigate to feed page:**
   ```
   http://localhost:8081/feed
   ```

3. **Check browser console:**
   - Should see API requests to: `https://budget-impact-lens-backend.onrender.com/policies`
   - No CORS errors
   - Policies loading successfully

4. **Check network tab:**
   - Look for requests to your Render backend URL
   - Status should be 200 OK
   - Response should contain policy data

### 4. Test Refresh Button
- Click refresh button on feed page
- Should trigger: `POST https://budget-impact-lens-backend.onrender.com/trigger-scrape`
- Check backend logs on Render dashboard

## ⚠️ Common Issues & Solutions

### Issue: CORS Errors
**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
1. Verify backend CORS middleware is set to `allow_origins=["*"]`
2. For production, update to specific domains:
   ```python
   allow_origins=[
       "https://your-frontend-domain.vercel.app",
       "http://localhost:8081"  # for development
   ]
   ```

### Issue: 404 Not Found
**Symptoms:** API calls return 404

**Solutions:**
1. Check backend URL is correct in `.env.local`
2. Verify backend service is running on Render
3. Test backend directly with curl
4. Check if endpoint path is correct (e.g., `/policies` not `/policy`)

### Issue: Environment Variable Not Working
**Symptoms:** Still connecting to localhost

**Solutions:**
1. Restart dev server after changing `.env.local`
2. Clear browser cache
3. Check console: `console.log(import.meta.env.VITE_API_URL)`
4. Verify variable starts with `VITE_` prefix

### Issue: Backend Not Responding
**Symptoms:** Requests hang or timeout

**Solutions:**
1. Check Render dashboard - is service running?
2. View Render logs for errors
3. Verify Render service didn't sleep (free tier)
4. Check if backend port is correct (should be from Render, not :8000)

### Issue: Policies Not Loading
**Symptoms:** Empty feed or loading spinner forever

**Solutions:**
1. Check network tab - is request succeeding?
2. Verify backend has policies in database
3. Run scraper manually: `POST /trigger-scrape`
4. Check backend logs for database connection errors

## 🔒 Production Security (TODO)

Before going to production:

- [ ] **Update CORS origins** in `backend/main.py`:
  ```python
  allow_origins=[
      "https://your-production-domain.com",
      "https://your-staging-domain.com"
  ]
  ```

- [ ] **Add rate limiting** to prevent abuse

- [ ] **Enable HTTPS** (Render handles this automatically)

- [ ] **Set up monitoring** (Render logs, Sentry, etc.)

- [ ] **Configure proper environment variables** on Render:
  - `ENVIRONMENT=production`
  - `SCRAPE_INTERVAL=1800` (30 minutes)
  - Database credentials
  - API keys

- [ ] **Review API keys** - ensure they're secure and not exposed

## 📊 Expected Behavior

### Development
- Frontend: `http://localhost:8081`
- Backend: `https://budget-impact-lens-backend.onrender.com`
- API calls: Frontend → Render backend
- Live reload: Yes

### Production (After Frontend Deployment)
- Frontend: `https://your-domain.vercel.app` (or similar)
- Backend: `https://budget-impact-lens-backend.onrender.com`
- API calls: Production frontend → Render backend
- CORS: Restricted to your frontend domain

## 🎯 Next Steps

1. **Test the connection:**
   ```bash
   cd frontend
   npm run dev
   # Navigate to http://localhost:8081/feed
   # Check if policies load from Render backend
   ```

2. **Deploy frontend** to Vercel/Netlify:
   ```bash
   # On Vercel
   vercel --prod
   
   # Set environment variable in Vercel dashboard:
   # VITE_API_URL=https://budget-impact-lens-backend.onrender.com
   ```

3. **Update CORS** in backend when frontend is deployed

4. **Monitor** both services for errors

## 📝 Files Changed

- ✅ `frontend/.env.local` - Backend URL configuration
- ✅ `frontend/.env.example` - Example for reference
- ✅ `frontend/src/pages/FeedPage.tsx` - Use env variable
- ✅ `backend/AI_ANALYSIS_README.md` - Removed API key
- ✅ `frontend/ENVIRONMENT_SETUP.md` - Setup guide
- ✅ `frontend/DEPLOYMENT_CHECKLIST.md` - This file

---

**Status:** ✅ Ready to Test  
**Backend:** Deployed on Render  
**Frontend:** Configured to connect to Render backend  
**Next:** Test the connection and deploy frontend
