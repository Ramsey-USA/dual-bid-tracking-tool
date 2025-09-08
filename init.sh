#!/bin/bash

# Dual Bid Tracking Tool - Project Initialization Script
# This script helps set up the project for the first time

echo "🏗️  Initializing Dual Bid Tracking Tool..."
echo ""

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == "not installed" ]]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "⚠️  Warning: Node.js $NODE_VERSION detected. Node.js 18+ is recommended."
fi

echo "✅ Node.js $NODE_VERSION found"

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not installed")
echo "✅ npm $NPM_VERSION found"

# Install Firebase CLI if not present
echo ""
echo "🔍 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI globally..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
else
    FIREBASE_VERSION=$(firebase --version | head -n1)
    echo "✅ Firebase CLI found: $FIREBASE_VERSION"
fi

# Install project dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install
echo "✅ Dependencies installed"

# Make scripts executable
echo ""
echo "🔧 Setting up scripts..."
chmod +x deploy.sh
echo "✅ Scripts configured"

# Firebase login check
echo ""
echo "🔐 Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo "✅ Already logged in to Firebase"
    CURRENT_PROJECT=$(firebase use --current 2>/dev/null || echo "none")
    if [ "$CURRENT_PROJECT" != "none" ]; then
        echo "📋 Current project: $CURRENT_PROJECT"
    else
        echo "⚠️  No Firebase project selected"
    fi
else
    echo "❌ Not logged in to Firebase"
    read -p "🔐 Do you want to login to Firebase now? (y/N): " login_firebase
    if [[ $login_firebase =~ ^[Yy]$ ]]; then
        firebase login
    fi
fi

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. 🔧 Set up Firebase project:"
echo "   - Create a new project at https://console.firebase.google.com"
echo "   - Enable Firestore Database"
echo "   - Enable Hosting"
echo ""
echo "2. 📝 Configure Firebase:"
echo "   - Update js/firebase-config.js with your project credentials"
echo "   - Run: firebase use --add [your-project-id]"
echo ""
echo "3. 🚀 Development:"
echo "   - Start emulators: npm run dev"
echo "   - Or visit: npm run firebase:emulators"
echo ""
echo "4. 🌐 Deployment:"
echo "   - Deploy: ./deploy.sh"
echo "   - Or manually: npm run deploy"
echo ""
echo "📚 For detailed instructions, see FIREBASE_SETUP.md"
echo ""
echo "✨ Happy coding!"