#!/bin/bash

# Test script for React navigation and reload issues
echo "🔧 Testing DeFi Guard Frontend Navigation Fixes"
echo "=============================================="

cd frontend

echo "✅ Starting development server..."
npm run dev &
DEV_PID=$!

# Wait a moment for server to start
sleep 5

echo "✅ Development server started (PID: $DEV_PID)"
echo ""
echo "🧪 Testing checklist:"
echo "1. Right-click should now work (inspect element enabled)"
echo "2. Navigation between pages should not cause full page reload"
echo "3. Direct URL access (e.g., /dashboard) should work"
echo "4. Wallet chain changes should not reload the page"
echo ""
echo "💡 Open http://localhost:5173 and test navigation"
echo "💡 Right-click anywhere to test inspect element"
echo "💡 Try accessing http://localhost:5173/dashboard directly"
echo ""
echo "Press Ctrl+C to stop the development server"

# Keep script running until interrupted
wait $DEV_PID
