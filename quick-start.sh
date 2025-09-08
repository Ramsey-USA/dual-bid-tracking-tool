#!/bin/bash

echo "🚀 Quick Firebase Setup & Test"

# Navigate to project directory
cd /workspaces/dual-bid-tracking-tool

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Install project dependencies
echo "📦 Installing dependencies..."
npm install

echo "🔥 Starting Firebase emulators..."
# Start Firebase emulators in background
firebase emulators:start --only firestore &
FIREBASE_PID=$!

echo "⏳ Waiting for Firebase to start..."
sleep 8

echo "🌐 Starting development server..."
# Start dev server in background
node dev-server.js &
DEV_PID=$!

sleep 3

echo ""
echo "🎉 Firebase Development Environment Ready!"
echo ""
echo "📱 Main App: http://localhost:3000"
echo "🔧 Admin Panel: http://localhost:3000/admin.html"
echo "🔥 Firebase UI: http://localhost:4000"
echo ""

# Open the admin panel to initialize data
echo "🚀 Opening admin panel to initialize data..."
"$BROWSER" http://localhost:3000/admin.html

echo ""
echo "📋 Next Steps:"
echo "1. Use the admin panel to initialize sample data"
echo "2. Then open the main app to see Firebase in action"
echo "3. Press Ctrl+C when done to stop all servers"
echo ""

# Wait for user to stop
wait $FIREBASE_PID $DEV_PID