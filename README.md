# LicensePrep - Hybrid AI Driving Coach Platform

**AI-Powered German Driving Test Preparation**

LicensePrep is a comprehensive hybrid AI platform combining **Web App (Next.js)**, **Chrome Extension**, and **Mobile App** (planned) to provide the ultimate German driving test preparation experience.

[![Chrome Built-in AI](https://img.shields.io/badge/Chrome-Built--in%20AI-blue)](https://developer.chrome.com/docs/ai)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-API-green)](https://flask.palletsprojects.com/)

---

## 🏗️ Platform Architecture

```
┌─────────────────────┐
│  Chrome Extension   │ ← Chrome Built-in AI (Gemini Nano)
│   - Q&A Assistant   │   + Cloud Gemini API Fallback
│   - Context Menus   │
└──────────┬──────────┘
           │
           ├──────────────┐
           │              │
┌──────────▼──────┐   ┌──▼──────────────┐
│  Next.js Web    │   │  Flask Backend  │
│   - Learning    │◄──┤   - API Server  │◄── Google Gemini API
│   - Q&A         │   │   - RAG System  │
│   - Simulation  │   └─────────────────┘
│   - Progress    │
└──────────┬──────┘           │
           │                  │
           ├──────────────────┤
           │                  │
       ┌───▼────────┐    ┌───▼────────┐
       │  Firebase  │    │  React     │
       │  (Planned) │    │  Native    │
       │  - Auth    │    │  (Planned) │
       │  - Firestore    │  - Routes  │
       └────────────┘    └────────────┘
```

---

## ✨ Features

### 🌐 Web App (Next.js)
- ✅ Modern learning platform with 8 categories, 42+ subcategories
- ✅ AI-powered Q&A system with Gemini API
- ✅ Interactive content (images, guides, step-by-step instructions)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Type-safe with TypeScript
- 🔜 Firebase authentication and progress tracking

### 🧩 Chrome Extension
- ✅ Chrome Built-in AI (Gemini Nano) for local, private processing
- ✅ Cloud Gemini API fallback for reliability
- ✅ Hybrid architecture: privacy + availability
- ✅ Context menus for quick access
- ✅ Custom API key support
- ✅ Multi-language support (German ↔ English)

### 🎮 Exam Simulation
- ✅ GPS route recording with OpenStreetMap
- ✅ Voice notes with GPS coordinates
- ✅ Speed analysis and visualization
- ✅ Route playback with variable speed
- ✅ Local storage (browser-based)

### 📱 Mobile App (Planned)
- 🔜 GPS route recording with React Native
- 🔜 Real-time Firebase sync
- 🔜 Offline-first architecture
- 🔜 AI-powered driving analysis

### 🤖 AI Backend (Flask)
- ✅ Google Gemini 2.5 Flash integration
- ✅ RAG system for accurate answers
- ✅ Route planning agent
- ✅ Replay analysis agent
- ✅ RESTful API for all clients

---

## 🚀 Quick Start

### Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+
- **Google Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Backend Setup (Flask)

```bash
# Clone repository
git clone https://github.com/yourusername/LicensePrep.git
cd LicensePrep

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set API key
export GOOGLE_API_KEY="your-gemini-api-key"

# Run server
python app.py
```

Backend runs on: **http://localhost:5000**

### 2. Frontend Setup (Next.js)

```bash
# Open new terminal
cd web-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Web app runs on: **http://localhost:3000**

### 3. Chrome Extension Setup

```bash
cd chrome-extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select chrome-extension folder
```

**Testing**: Click extension icon or press `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`)

---

## 📚 Documentation

- **[API Specification](docs/API_SPECIFICATION.md)** - Complete API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design and overview
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Guide to all documentation
- **[Chrome Extension](chrome-extension/README.md)** - Extension documentation
- **[Web App](web-app/README.md)** - Next.js app documentation
- **[Chrome API Setup](docs/CHROME_API_SETUP.md)** - Chrome Built-in AI configuration

---

## 🏛️ Project Structure

```
LicensePrep/
├── app.py                  # Flask backend entry point
├── api/                    # Flask API routes
│   ├── routes_content.py   # Content API
│   ├── routes_rule_qa.py   # Q&A API
│   ├── routes_replay.py    # Route analysis
│   └── routes_planner.py   # Route planning
├── core/                   # Backend services
│   ├── gemini_client.py    # Gemini API client
│   └── simple_retrieval.py # RAG retrieval
├── agents/                 # AI agents
│   ├── planner_agent.py
│   └── replay_agent.py
├── data/                   # Learning content
│   ├── metadata/
│   └── rules/
├── web/                    # Flask static files & templates
│   ├── static/images/      # Learning content images
│   └── templates/          # Route recorder/review (for simulate)
├── web-app/                # Next.js frontend
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── lib/                # API client & hooks
│   └── public/             # Static assets
└── chrome-extension/       # Chrome Extension
    ├── manifest.json
    ├── popup/
    ├── background/
    └── utils/
```

---

## 🔥 Key Features Explained

### Hybrid AI Architecture

**Why Hybrid?**
- **Privacy**: Chrome Built-in AI (Gemini Nano) processes data locally
- **Reliability**: Cloud fallback ensures service availability
- **Performance**: Local AI = instant responses, no network latency
- **Cost**: Reduced API costs with local processing

### Learning Content

- **8 Categories**: Basic driving, Five skills, 30-zone, City zones, Country roads, Highways, Technical questions, ADAS
- **42+ Subcategories**: Detailed topics with images and instructions
- **Interactive**: Step-by-step guides with visual aids

### Exam Simulation

1. **Record**: GPS route recording with voice notes
2. **Analyze**: Speed analysis, acceleration, braking patterns
3. **Review**: Route playback with synchronized voice notes
4. **Improve**: AI-powered feedback on performance

---

## 🎯 Hackathon Highlights

### Chrome Built-in AI Integration
- ✅ Uses Gemini Nano for local, private AI processing
- ✅ Automatic fallback to Cloud Gemini API
- ✅ Demonstrates hybrid architecture benefits
- ✅ Custom API key support for power users

### Innovation
- ✅ Hybrid AI platform (Web + Extension + Mobile planned)
- ✅ Privacy-first with local AI processing
- ✅ Seamless fallback ensures reliability
- ✅ Multi-platform content synchronization (planned)

### Technical Excellence
- ✅ Modern tech stack (Next.js, React, TypeScript)
- ✅ API-first design for cross-platform support
- ✅ Type-safe development with full TypeScript coverage
- ✅ Well-documented and maintainable code

---

## 📊 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **SWR** - Data fetching and caching

### Backend
- **Flask** - Python web framework
- **Google Gemini API** - AI language model
- **FAISS** - Vector similarity search (RAG)
- **Langchain** - LLM application framework

### Chrome Extension
- **Manifest V3** - Latest extension architecture
- **Chrome Built-in AI APIs** - Gemini Nano integration
- **Vanilla JavaScript** - No framework dependencies

### Planned
- **React Native** - Mobile app development
- **Firebase** - Authentication, Firestore, Storage
- **Expo** - React Native toolchain

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🆘 Troubleshooting

### Backend Issues

**Flask won't start**
```bash
# Ensure correct environment
conda activate license-prep-env  # or source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Check API key
echo $GOOGLE_API_KEY
```

### Frontend Issues

**Next.js can't connect to backend**
```bash
# Check Flask is running
curl http://localhost:5000/api/content/categories

# Verify CORS in app.py
# Should read allowed origins from config/settings.py (env: CORS_ALLOWED_ORIGINS)
```

**Images not displaying**
- Ensure Flask backend is running on port 5000
- Check `web-app/next.config.ts` rewrites configuration
- Restart Next.js: `npm run dev`

### Chrome Extension Issues

**Extension not working**
- Ensure Flask backend is running (for cloud API)
- Check browser console for errors
- Try using custom API key in Settings
- Reload extension after changes

---

## 📞 Support

- **Documentation**: See markdown files in project root and subdirectories
- **Issues**: Open a GitHub issue
- **Questions**: Check existing documentation first

---

## 🎉 Getting Started

1. **Clone the repository**
2. **Get your Gemini API key** from Google AI Studio
3. **Start Flask backend**: `python app.py`
4. **Start Next.js frontend**: `cd web-app && npm run dev`
5. **Load Chrome Extension**: Follow instructions in `chrome-extension/README.md`
6. **Open browser**: Visit http://localhost:3000

**Happy Learning! 🚗📚**
