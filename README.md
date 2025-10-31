# FahrerLab

AI-powered German driving test preparation and route simulation platform (Flask backend + Next.js frontend + Chrome extension).

---

## Quick Start

### 1) Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key (Get from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 2) Environment Variables
Set at least the following in your terminal:

```bash
export GOOGLE_GEMINI_API_KEY="your-gemini-api-key"   # or use GOOGLE_API_KEY for compatibility
# Optional: for /route-review template (Google Maps, only needed for that page)
export GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 3) One-Click Start (Recommended)

```bash
conda activate license-prep-env  # or source venv/bin/activate
./start-dev.sh
```

After running:
- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000

**Note**: The script will automatically install `web-app` dependencies if missing and start both Flask and Next.js development servers in parallel.

---

## Project Structure

```
FahrerLab/
├── app.py                  # Flask backend entry point
├── start-dev.sh            # One-click local development launcher (main program)
├── requirements.txt        # Backend dependencies
├── api/                    # Flask API routes
├── core/                   # Backend core (Gemini client, simple retrieval, etc.)
├── agents/                 # Planning/replay agents
├── config/                 # Settings and environment variables
├── data/                   # Learning content/rules/samples/mobile uploads
├── web/                    # Flask templates & static assets (route recorder/review pages)
├── web-app/                # Next.js frontend (independent package.json)
└── chrome-extension/       # Chrome extension (independent package.json)
```

---

## Development Notes

- Backend provides REST API via Flask (see `app.py` and `api/`).
- Frontend provides web interface via Next.js (see `web-app/`).
- Chrome extension uses Chrome Built-in AI (Gemini Nano) with fallback to cloud Gemini API (see `chrome-extension/`).
- CORS allowed origins are configured via `config/settings.py` from environment variables.

---

## Documentation

- `docs/API_SPECIFICATION.md` - API specification
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DEPLOYMENT_GUIDE.md` - Deployment guide
- `docs/CHROME_API_SETUP.md` - Chrome Built-in AI setup

---

## Troubleshooting

- **Backend won't start**: Ensure virtual environment is activated and run `pip install -r requirements.txt`. Check if `GOOGLE_GEMINI_API_KEY` is set.
- **Frontend can't access backend**: Ensure Flask is running on port 5000 and check CORS configuration.
- **Images or static assets not displaying**: Ensure Flask is running and restart Next.js.
- **Extension not working**: Ensure backend is running. Optionally set custom API key in extension settings and reload the extension in Chrome extension management page.

---

## License

MIT
