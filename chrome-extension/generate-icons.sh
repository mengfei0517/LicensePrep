#!/bin/bash

# LicensePrep Chrome Extension - Icon Generator
# Quick script to generate placeholder icons

echo "🎨 LicensePrep Extension Icon Generator"
echo "========================================"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed"
    echo ""
    echo "Installation:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS:         brew install imagemagick"
    echo "  Fedora:        sudo dnf install imagemagick"
    echo ""
    exit 1
fi

# Navigate to icons directory
cd icons || exit 1

echo "📝 Generating icons..."
echo ""

# Generate 16x16 icon
echo "  Generating icon16.png..."
convert -size 16x16 xc:#2563eb \
    -fill white \
    -pointsize 12 \
    -gravity center \
    -annotate +0+0 "LP" \
    icon16.png

# Generate 48x48 icon
echo "  Generating icon48.png..."
convert -size 48x48 xc:#2563eb \
    -fill white \
    -pointsize 36 \
    -gravity center \
    -annotate +0+0 "LP" \
    icon48.png

# Generate 128x128 icon
echo "  Generating icon128.png..."
convert -size 128x128 xc:#2563eb \
    -fill white \
    -pointsize 96 \
    -gravity center \
    -annotate +0+0 "LP" \
    icon128.png

echo ""
echo "✅ Icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh icon*.png
echo ""
echo "📦 Next steps:"
echo "   1. Go to chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the chrome-extension directory"
echo ""

