#!/bin/bash

echo "🚀 Installing Playwright on Codespace..."
echo "=========================================="

# 1. Install npm dependencies
echo ""
echo "📦 Step 1/6: Installing npm packages..."
npm install

# 2. Fix yarn repository
echo ""
echo "🔧 Step 2/6: Fixing yarn repository..."
sudo rm -f /etc/apt/sources.list.d/yarn.list
sudo apt-get update -qq

# 3. Install Chromium dependencies
echo ""
echo "🌐 Step 3/6: Installing Chromium dependencies..."
sudo apt-get install -y -qq \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2t64 \
  libatspi2.0-0 \
  libwayland-client0 \
  libxshmfence1 \
  libnss3 \
  libnspr4 \
  libdbus-1-3 \
  libxcb-shm0

# 4. Install Firefox/WebKit dependencies
echo ""
echo "🦊 Step 4/6: Installing Firefox/WebKit dependencies..."
sudo apt-get install -y -qq \
  libxcursor1 \
  libgtk-3-0t64 \
  libcairo-gobject2 \
  libgdk-pixbuf-2.0-0

# 5. Install browsers
echo ""
echo "🎭 Step 5/6: Installing Playwright browsers..."
echo "This may take a few minutes..."
npx playwright install chromium firefox webkit

# 6. Install WebKit dependencies
echo ""
echo "🌐 Step 6/6: Installing WebKit dependencies..."
sudo npx playwright install-deps webkit > /dev/null 2>&1

# 7. Run test
echo ""
echo "=========================================="
echo "✅ Testing installation..."
echo "=========================================="
npx playwright test

echo ""
echo "=========================================="
echo "🎉 Setup complete!"
echo "=========================================="
echo ""
echo "📝 Useful commands:"
echo "  - Run all tests:        npx playwright test"
echo "  - Run Chromium only:    npx playwright test --project=chromium"
echo "  - Show test report:     npx playwright show-report"
echo "  - See more commands:    cat SETUP.md"
echo ""
