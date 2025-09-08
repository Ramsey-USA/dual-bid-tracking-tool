#!/bin/bash

echo "🔥 Starting Firebase Emulators and Testing Connection..."

cd /workspaces/dual-bid-tracking-tool

# Start Firebase emulators
echo "🚀 Starting Firebase emulators..."
firebase emulators:start --only firestore &
FIREBASE_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to start..."
sleep 10

# Start development server
echo "🌐 Starting development server..."
node dev-server.js &
DEV_PID=$!

sleep 3

echo ""
echo "🎉 Environment Ready!"
echo "📱 App: http://localhost:3000"
echo "🔧 Admin: http://localhost:3000/admin.html"
echo "🔥 Firebase UI: http://localhost:4000"
echo ""

# Open admin panel for data initialization
echo "🚀 Opening admin panel..."
"$BROWSER" http://localhost:3000/admin.html

echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo "🛑 Stopping servers..."; kill $FIREBASE_PID $DEV_PID 2>/dev/null; exit 0' INT

wait