#!/bin/bash

# Fuel Bill Generator - Easy Start Script
# Double-click this file to start the server

echo "🚀 Starting Fuel Bill Generator..."
echo ""

# Navigate to the project directory
cd "/Users/manas/Vibe Coding/Fuel App"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "✅ Server starting on http://localhost:3000"
echo "🌐 Opening browser..."
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Open browser after a short delay
(sleep 3 && open http://localhost:3000) &

# Start the development server
npm run dev
