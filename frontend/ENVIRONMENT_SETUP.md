# Frontend Configuration Guide

## Environment Variables

The frontend uses **Vite** environment variables to connect to the backend API.

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update with your backend URL:**
   ```bash
   # For production (Render deployment)
   VITE_API_URL=https://budget-impact-lens-backend.onrender.com
   
   # For local development
   VITE_API_URL=http://localhost:8000
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

### Environment Variable Rules

- **Prefix:** All client-side env vars must start with `VITE_`
- **Access:** Use `import.meta.env.VITE_API_URL` in your code
- **Security:** Never commit `.env.local` to Git (already in `.gitignore`)
- **Build:** Env vars are embedded during build time

### Usage in Code

```typescript
// Correct way to use environment variables in Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Example API call
const response = await fetch(`${API_BASE_URL}/policies`);
```

### Deployment

When deploying to **Vercel/Netlify/etc**:

1. Add environment variable in dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://budget-impact-lens-backend.onrender.com`

2. Redeploy the frontend

### Troubleshooting

**API calls failing?**
- ✅ Check `.env.local` exists
- ✅ Verify `VITE_API_URL` is set correctly
- ✅ Restart dev server after changing env vars
- ✅ Check browser console for actual URL being used
- ✅ Verify backend is running and accessible

**CORS errors?**
- Backend must have frontend URL in CORS allowed origins
- Check `backend/main.py` CORS middleware settings

**404 errors?**
- Verify backend URL is correct
- Test backend directly: `curl https://your-backend-url.onrender.com/health`
- Check if backend service is running on Render

### Current Configuration

- **Development:** `http://localhost:8000` (fallback)
- **Production:** `https://budget-impact-lens-backend.onrender.com`

---

**Last Updated:** December 26, 2025
