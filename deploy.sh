#!/bin/bash

# Firebase Deployment Script for Dual Bid Tracking Tool
# This script automates the build and deployment process

set -e  # Exit on any error

echo "🚀 Starting Firebase deployment for Dual Bid Tracking Tool..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build for production
echo "🔨 Building for production..."
npm run build:production

# Test the build locally (optional)
read -p "🔍 Do you want to test the build locally before deploying? (y/N): " test_local
if [[ $test_local =~ ^[Yy]$ ]]; then
    echo "🌐 Starting local server..."
    echo "   Visit http://localhost:5000 to test"
    echo "   Press Ctrl+C when ready to deploy"
    npm run serve
fi

# Confirm deployment
read -p "🚀 Ready to deploy to Firebase? (y/N): " confirm_deploy
if [[ ! $confirm_deploy =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

# Get the hosting URL
PROJECT_ID=$(firebase use --current)
HOSTING_URL="https://${PROJECT_ID}.web.app"

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Your app is available at: $HOSTING_URL"
echo ""
echo "📊 Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}"
echo ""

# Open the app in browser (optional)
read -p "🌐 Open the app in your browser? (y/N): " open_browser
if [[ $open_browser =~ ^[Yy]$ ]]; then
    if command -v "$BROWSER" &> /dev/null; then
        "$BROWSER" "$HOSTING_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$HOSTING_URL"
    elif command -v open &> /dev/null; then
        open "$HOSTING_URL"
    else
        echo "Please open $HOSTING_URL in your browser"
    fi
fi

echo "🎉 Deployment script completed!"