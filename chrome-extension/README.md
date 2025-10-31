# LicensePrep Chrome Extension

AI-powered German driving test preparation using Chrome Built-in AI APIs.

## Features

- **Hybrid AI Q&A**: Local AI (Gemini Nano) with cloud fallback
- **Multi-language Support**: Auto-translate German ↔ English
- **Smart Summarization**: Extract key points from long answers
- **Context Notes**: Save highlights from any webpage
- **Q&A History**: Local storage, fast re-questioning

## Quick Start

### Prerequisites

- **Chrome Canary/Dev** (version ≥ 128)
- **ImageMagick** (optional, for icon generation)

### Installation

**1. Enable Chrome Flags**

Visit the following URLs and enable:

```
chrome://flags/#optimization-guide-on-device-model
→ Enabled BypassPerfRequirement

chrome://flags/#prompt-api-for-gemini-nano
→ Enabled

chrome://flags/#translation-api
→ Enabled

chrome://flags/#summarization-api-for-gemini-nano
→ Enabled
```

Restart Chrome after enabling flags.

**2. Download Gemini Nano Model** (optional for local AI)

1. Visit `chrome://components/`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait 5-15 minutes (~1.7GB)

**3. Generate Icons** (optional)

```bash
cd /path/to/LicensePrep/chrome-extension
./generate-icons.sh
```

Or skip this step - extension will work without custom icons.

**4. Load Extension**

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Pin extension to toolbar

### Verify Installation

- Extension icon appears in toolbar
- Status shows "🔒 Local AI Ready" or "☁️ Cloud Mode"
- Ask a question to test

## Architecture

### Hybrid AI Strategy

```
User Question
     ↓
Check Prompt API
     ↓
[Available] → Local AI (Gemini Nano) → Answer 🔒 Private
     ↓
[Not Available] → Cloud API (Gemini 2.5 Flash) → Answer ☁️ Cloud
```

### Chrome Built-in AI APIs Used

- **Prompt API**: Core Q&A functionality
- **Translator API**: Multi-language support
- **Summarizer API**: Content optimization
- **Language Detector API**: Auto-language detection

### File Structure

```
chrome-extension/
├── manifest.json              # Manifest V3 config
├── popup/                     # Popup UI (Q&A interface)
├── background/                # Service worker (context menus)
├── content/                   # Content scripts (web injection)
├── utils/                     # API clients & utilities
└── icons/                     # Extension icons
```

## Usage

### Ask Questions

1. Click extension icon
2. Type question (e.g., "What is Rechts vor Links?")
3. Click "Ask Driving Coach"
4. View answer with privacy indicator

### Translate

- Input German text
- Click 🌐 button
- Auto-translated to English

### Summarize

- Get an answer
- Click "📝 Summarize"
- View condensed version

### Save Notes

- Select text on any webpage
- Right-click → "📝 Save to LicensePrep Notes"
- Access via History panel

## Configuration

### Backend URL

Default: `http://localhost:5000`

To change, edit `utils/prompt-api.js`:

```javascript
this.backendUrl = 'https://your-domain.com';
```

### System Requirements

**For Local AI Mode:**
- RAM: 22GB recommended (8GB minimum)
- Disk: 2GB for Gemini Nano model
- Chrome Canary/Dev 128+

**For Cloud Mode Only:**
- Any modern browser
- Internet connection
- Backend with Gemini API key

## Troubleshooting

### "Prompt API not available"

**Cause**: Gemini Nano not downloaded or feature not enabled

**Solution**:
1. Check Chrome flags are enabled
2. Visit `chrome://components/`
3. Update "Optimization Guide On Device Model"
4. Wait for download, restart Chrome

Extension will automatically use cloud fallback.

### Extension shows "☁️ Cloud Mode"

**Normal behavior** - Local AI not available, using cloud API.

To enable local mode:
1. Download Gemini Nano model
2. Ensure device has 22GB+ RAM
3. Restart browser

### Backend connection failed

**Solution**:
```bash
# Start Web App backend
cd /path/to/LicensePrep
python app.py
```

Backend should run on `http://localhost:5000`

## Development

### Generate Icons

```bash
# Install ImageMagick first
sudo apt-get install imagemagick  # Ubuntu/Debian
brew install imagemagick          # macOS

# Generate icons
./generate-icons.sh
```

### Refresh After Changes

1. Go to `chrome://extensions/`
2. Find LicensePrep extension
3. Click 🔄 reload button

### View Console Logs

- Right-click extension icon → "Inspect"
- Switch to Console tab

## Performance

| Metric | Local Mode | Cloud Mode |
|--------|-----------|-----------|
| Latency | 2-3 seconds | 3-5 seconds |
| Privacy | 🔒 Fully local | ⚠️ Data sent to Google |
| Offline | ✅ Yes | ❌ No |
| Cost | ✅ Free | ✅ Free (quota limits) |

## Privacy

### Local Mode (🔒)
- All data processed on device
- No server communication
- Fully offline capable

### Cloud Mode (☁️)
- Questions sent to Google Gemini API
- Complies with Google privacy policy
- Clearly indicated in UI

## License

MIT License - See LICENSE file

## Links

- [Main Project](https://github.com/mengfei0517/LicensePrep)
- [Issues](https://github.com/mengfei0517/LicensePrep/issues)
- [Web App Documentation](../README.md)
