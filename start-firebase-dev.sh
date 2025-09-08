#!/bin/bash

echo "🔥 Starting Firebase Development Environment..."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Are you in the project directory?"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting Firebase emulators..."
# Start Firebase emulators in background
firebase emulators:start --only firestore,hosting &
FIREBASE_PID=$!

echo "⏳ Waiting for emulators to start..."
sleep 5

echo "🌐 Starting development server..."
# Start our custom dev server
node dev-server.js &
DEV_PID=$!

sleep 2

echo ""
echo "🎉 Development environment ready!"
echo "📱 App: http://localhost:3000"
echo "🔥 Firebase UI: http://localhost:4000"
echo "🗃️ Firestore: localhost:8080"
echo ""
echo "Opening app in browser..."
"$BROWSER" http://localhost:3000

echo "Press any key to stop all servers..."
read -n 1 -s

echo "🛑 Stopping servers..."
kill $FIREBASE_PID $DEV_PID 2>/dev/null
echo "✅ All servers stopped"