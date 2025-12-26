#!/bin/bash
# Test script to verify frontend-backend connection

echo "============================================================"
echo "Testing Frontend ↔️ Backend Connection"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL from frontend config
BACKEND_URL="https://budget-impact-lens-backend.onrender.com"

echo "📍 Backend URL: $BACKEND_URL"
echo ""

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
echo "----------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "Response: $BODY" | head -n 3
else
    echo -e "${RED}❌ Backend health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Policies API
echo "Test 2: Policies API"
echo "----------------------------"
POLICIES_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/policies?limit=3" 2>&1)
HTTP_CODE=$(echo "$POLICIES_RESPONSE" | tail -n1)
BODY=$(echo "$POLICIES_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Policies API working${NC}"
    POLICY_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
    echo "Found $POLICY_COUNT policies in response"
else
    echo -e "${RED}❌ Policies API failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 3: CORS Check
echo "Test 3: CORS Headers"
echo "----------------------------"
CORS_HEADERS=$(curl -s -I "$BACKEND_URL/health" 2>&1 | grep -i "access-control")

if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$CORS_HEADERS"
else
    echo -e "${YELLOW}⚠️  No CORS headers found${NC}"
    echo "This might cause issues with frontend requests"
fi
echo ""

# Test 4: Frontend Environment
echo "Test 4: Frontend Environment"
echo "----------------------------"
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    echo "Content:"
    cat frontend/.env.local
else
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Create it with: VITE_API_URL=$BACKEND_URL"
fi
echo ""

# Test 5: Check if frontend code uses env variable
echo "Test 5: Frontend Code Check"
echo "----------------------------"
if grep -q "import.meta.env.VITE_API_URL" frontend/src/pages/FeedPage.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ FeedPage.tsx uses environment variable${NC}"
else
    echo -e "${RED}❌ FeedPage.tsx not using environment variable${NC}"
    echo "Update it to use: import.meta.env.VITE_API_URL"
fi
echo ""

# Summary
echo "============================================================"
echo "Summary"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Visit: http://localhost:8081/feed"
echo "3. Check browser console for API requests to: $BACKEND_URL"
echo "4. Verify policies are loading from deployed backend"
echo ""
echo "If issues occur:"
echo "- Check browser console for CORS errors"
echo "- Verify network tab shows requests to $BACKEND_URL"
echo "- Ensure backend is running on Render dashboard"
echo ""
