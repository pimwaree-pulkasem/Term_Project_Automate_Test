#!/bin/bash

echo "🖼️  Running Playwright in Virtual Display (Xvfb)"
echo "================================================"

# Install Xvfb if not installed
if ! command -v Xvfb &> /dev/null; then
    echo "📦 Installing Xvfb..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq xvfb
fi

# Start Xvfb on display :99
echo "🚀 Starting virtual display..."
Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 &
XVFB_PID=$!

# Wait for Xvfb to start
sleep 2

# Export DISPLAY variable
export DISPLAY=:99

echo "✅ Virtual display ready on :99"
echo ""
echo "🎭 Running Playwright tests in headed mode..."
echo "================================================"
echo ""

# Run Playwright in headed mode
npx playwright test --headed "$@"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $XVFB_PID 2>/dev/null

echo "✅ Done!"
