#!/bin/bash

# Quick start script for development
echo "🚀 Starting Dual Bid Tracking Tool Development Server..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Make dev server executable
chmod +x dev-server.js

# Start the development server
echo "🌐 Starting development server on http://localhost:3000"
echo "📝 ES Modules supported for Firebase imports"
echo "🔄 Press Ctrl+C to stop"
echo ""

node dev-server.js