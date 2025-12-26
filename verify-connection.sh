#!/bin/bash
# Verification script for frontend-backend connection

echo "🔍 Checking Frontend Configuration..."
echo ""

# Check .env.production
echo "📄 Production environment (.env.production):"
cat frontend/.env.production | grep VITE_API_URL
echo ""

# Check .env.local
echo "📄 Local environment (.env.local):"
cat frontend/.env.local | grep VITE_API_URL | grep -v "^#"
echo ""

# Check FeedPage.tsx
echo "📄 FeedPage.tsx API configuration:"
grep "const API_BASE_URL" frontend/src/pages/FeedPage.tsx
echo ""

# Test backend connectivity
BACKEND_URL="https://budget-impact-lens.onrender.com"
echo "🌐 Testing backend connectivity: $BACKEND_URL"
echo ""

echo "Testing root endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/" 
echo ""

echo "Testing /policies endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/policies?limit=5"
echo ""

echo "Testing /categories endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/categories"
echo ""

echo "✅ Verification complete!"
echo ""
echo "Expected results:"
echo "  - .env.production should have: VITE_API_URL=https://budget-impact-lens.onrender.com"
echo "  - .env.local should have: VITE_API_URL=http://localhost:8000"
echo "  - FeedPage.tsx should use: import.meta.env.VITE_API_URL"
echo "  - All backend endpoints should return: Status: 200"
echo ""
echo "If backend returns 404, it's not deployed yet. Check Render dashboard."
echo "If backend returns 503, it's cold starting (wait 30-60 seconds)."
