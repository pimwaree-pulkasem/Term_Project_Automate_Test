#!/bin/bash

echo "🖥️  Setting up VNC Server for Codespace..."
echo "==========================================="

# 1. Install VNC Server and Desktop Environment
echo ""
echo "📦 Step 1/5: Installing VNC Server and XFCE Desktop..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
  tightvncserver \
  xfce4 \
  xfce4-goodies \
  dbus-x11

# 2. Set VNC Password
echo ""
echo "🔐 Step 2/5: Setting up VNC Password..."
mkdir -p ~/.vnc
echo "password" | vncpasswd -f > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd

# 3. Create VNC startup script
echo ""
echo "📝 Step 3/5: Creating VNC startup script..."
cat > ~/.vnc/xstartup << 'EOF'
#!/bin/bash
xrdb $HOME/.Xresources
startxfce4 &
EOF
chmod +x ~/.vnc/xstartup

# 4. Start VNC Server
echo ""
echo "🚀 Step 4/5: Starting VNC Server..."
vncserver :1 -geometry 1920x1080 -depth 24

# 5. Install noVNC for web access
echo ""
echo "🌐 Step 5/5: Installing noVNC for web access..."
cd /tmp
git clone https://github.com/novnc/noVNC.git
cd noVNC
./utils/novnc_proxy --vnc localhost:5901 --listen 6080 &

echo ""
echo "==========================================="
echo "✅ VNC Setup Complete!"
echo "==========================================="
echo ""
echo "📝 Access Methods:"
echo ""
echo "1. Web Browser (noVNC):"
echo "   - VSCode will show port 6080"
echo "   - Click 'Open in Browser'"
echo "   - Password: password"
echo ""
echo "2. VNC Client:"
echo "   - Use any VNC client"
echo "   - Connect to forwarded port 5901"
echo "   - Password: password"
echo ""
echo "🎭 Now you can run Playwright with --headed:"
echo "   npx playwright test --headed"
echo ""
