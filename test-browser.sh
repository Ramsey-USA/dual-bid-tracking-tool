#!/bin/bash

echo "🧪 Testing ES Module loading..."

# Start development server in background
node /workspaces/dual-bid-tracking-tool/dev-server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Development server started (PID: $SERVER_PID)"
    echo "🌐 Opening browser..."
    
    # Open in browser
    "$BROWSER" http://localhost:3000
    
    echo "📝 Check browser console for module loading messages"
    echo "🔄 Press any key to stop the server..."
    read -n 1 -s
    
    # Stop server
    kill $SERVER_PID
    echo "🛑 Server stopped"
else
    echo "❌ Failed to start development server"
fi