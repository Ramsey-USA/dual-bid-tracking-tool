#!/bin/bash

echo "🔥 Starting Firebase Emulators for Testing..."

cd /workspaces/dual-bid-tracking-tool

# Kill any existing processes
echo "🛑 Cleaning up existing processes..."
pkill -f firebase 2>/dev/null || true
pkill -f node 2>/dev/null || true

# Start Firebase emulators
echo "🚀 Starting Firebase emulators..."
firebase emulators:start --only firestore --project demo-project &
FIREBASE_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to start..."
sleep 8

# Start development server
echo "🌐 Starting development server..."
node dev-server.js &
DEV_PID=$!

sleep 3

echo ""
echo "🎉 Testing Environment Ready!"
echo "🧪 Test Page: http://localhost:3000/test.html"
echo "🔧 Admin Panel: http://localhost:3000/admin.html"
echo "📱 Main App: http://localhost:3000"
echo "🔥 Firebase UI: http://localhost:4000"
echo ""

# Open test page first
echo "🧪 Opening test page to verify Firebase connection..."
"$BROWSER" http://localhost:3000/test.html

echo ""
echo "📋 Next Steps:"
echo "1. The test page should show Firebase connection success"
echo "2. If tests pass, open admin panel to initialize sample data"
echo "3. Then test the main app with real Firebase data"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo "🛑 Stopping servers..."; kill $FIREBASE_PID $DEV_PID 2>/dev/null; exit 0' INT

wait