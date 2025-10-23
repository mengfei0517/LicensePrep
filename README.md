# 🚗 LicensePrep - German Driving Test Preparation

An AI-powered platform for German driving test preparation, using **Hybrid AI Architecture** combining **Chrome Built-in AI** and **Google Gemini API**.

**Latest Update (v3.0):** Hybrid AI Architecture - Chrome Extension + Web App dual platform support

## 🏗️ Hybrid AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LicensePrep Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Mobile App          🌐 Web App       🧩 Chrome Extension│
│  (React Native)         (Flask/Next.js)  (Manifest V3)     │
│  ├─ GPS Recording       ├─ Data Analysis ├─ Local AI Q&A   │
│  ├─ Voice Notes         ├─ Route Review  ├─ Translation    │
│  └─ Real-time Sync      ├─ Exam Planning ├─ Summarization  │
│                         └─ Cloud Fallback└─ Context Notes  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
          ┌───────────────────────────────────────┐
          │      Firebase Backend (Planned)       │
          │  ├─ Authentication                    │
          │  ├─ Real-time Database                │
          │  ├─ Cloud Functions                   │
          │  └─ Storage (Voice Notes, GPS)        │
          └───────────────────────────────────────┘
                              ▼
          ┌───────────────────────────────────────┐
          │          AI Services                  │
          │  ├─ Chrome Built-in AI (Local) 🔒    │
          │  │   • Prompt API (Gemini Nano)      │
          │  │   • Translator API                 │
          │  │   • Summarizer API                 │
          │  └─ Google Gemini API (Cloud) ☁️     │
          │      • Gemini 2.5 Flash               │
          └───────────────────────────────────────┘
```

## 📁 Repository Structure

```
LicensePrep/
├── app.py                        # Flask web server entry point
│
├── chrome-extension/             # 🧩 Chrome Extension (NEW!)
│   ├── manifest.json             # Manifest V3 configuration
│   ├── popup/                    # Popup UI (AI Q&A)
│   ├── background/               # Service worker
│   ├── content/                  # Content scripts
│   ├── utils/                    # API clients (Prompt, Translator, etc.)
│   └── README.md                 # Extension documentation
│
├── data/                         # Knowledge base and resources
│   ├── rules/                    # Rule templates and examples
│   ├── samples/                  # Practice samples (GPS, screenshots)
│   └── metadata/
│       └── content.json          # Structured knowledge base
│
├── core/                         # Core business logic
│   ├── gemini_client.py          # Google Gemini API client
│   ├── simple_retrieval.py       # Keyword-based knowledge retrieval
│   └── utils.py                  # Shared utilities
│
├── agents/                       # AI agents (in development)
│   ├── replay_agent.py           # Practice replay analysis
│   └── planner_agent.py          # Route planning
│
├── web/                          # Frontend assets
│   ├── templates/                # Jinja2 HTML templates
│   └── static/                   # CSS, JavaScript, images
│
├── api/                          # REST API endpoints
│   ├── routes_rule_qa.py         # Q&A API endpoints
│   ├── routes_replay.py          # Replay analysis endpoints
│   └── routes_planner.py         # Planning endpoints
│
├── config/                       # Configuration
│   └── settings.py               # Application settings
│
├── .env                          # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### Choose Your Platform

#### 🧩 Chrome Extension (Recommended - Local AI Priority)
Complete local AI experience with privacy protection and offline capability.

👉 **[View Extension Installation Guide](chrome-extension/README.md)**

**Core Features:**
- 🔒 Local AI Q&A (Gemini Nano)
- 🌐 Multi-language translation
- 📝 Smart summarization
- 💾 Context notes

#### 🌐 Web App (Cloud AI)
Cross-browser support, no installation required, ready to use.

👉 **Continue to Web App setup below**

---

## 🛠️ Web App Setup

### 1. System Requirements

**Python**: 3.11+

**Optional System Dependencies** (for Chrome Extension icon generation):
- **ImageMagick**: For generating extension icons

```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick

# Fedora/RHEL
sudo dnf install imagemagick
```

### 2. Clone the Repository
```bash
git clone https://github.com/mengfei0517/LicensePrep.git
cd LicensePrep
```

### 3. Create Python Environment
```bash
# Using conda (recommended)
conda create -n license-prep-env python=3.11 -y
conda activate license-prep-env

# Or using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 4. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure API Key (Important!)

Create a `.env` file in the project root:

```bash
# Create .env file
cat > .env << EOF
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
APP_NAME=LicensePrep
EOF
```

Get your API key from: https://aistudio.google.com/app/apikey

**⚠️ Security Note:** Never commit `.env` file to git! It's already in `.gitignore`.

## ▶️ Run

```bash
# Start the web application
python app.py
```

The server will start on `http://localhost:5000/`

**Access the application:**
- Open your browser and visit: http://localhost:5000/
- Use any modern browser (Chrome, Firefox, Safari, Edge)
- No model download required!

## 🔌 API Endpoints

### 1. Retrieve Context
Get relevant knowledge chunks for a query.

**Endpoint:** `POST /api/qa/retrieve_context`

```json
{
  "query": "What is the speed limit on autobahn?",
  "k": 5
}
```

### 2. Generate Answer
Generate AI-powered answer using Google Gemini API.

**Endpoint:** `POST /api/qa/generate`

```json
{
  "query": "What is the speed limit on autobahn?",
  "context": "Retrieved knowledge context..."
}
```

### 3. Q&A (Combined)
All-in-one endpoint that retrieves and generates.

**Endpoint:** `POST /api/qa/ask`

```json
{
  "question": "What is the speed limit in 30 zone?"
}
```

Response:
```json
{
  "answer": "In a 30 km/h zone, the maximum speed limit is 30 km/h..."
}
```

## 🧪 Testing

```bash
# Test with curl
curl -X POST http://localhost:5000/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the speed limit on autobahn?"}'

# Or use the web interface at http://localhost:5000/
```

## ✨ Features

### 🧩 Chrome Extension Features
- 🔒 **Local AI Priority**: Gemini Nano local inference (privacy protection)
- ☁️ **Cloud Fallback**: Auto-switch to cloud API (reliability guarantee)
- 🌐 **Multi-language**: German ↔ English auto-translation
- 📝 **Smart Summarization**: Extract key points, condense long answers
- 💾 **Context Notes**: Save notes from any webpage
- 📜 **Q&A History**: Local storage, quick re-questioning

### 🌐 Web App Features
- 🤖 **AI-Powered Q&A**: Google Gemini 2.5 Flash
- 📚 **Knowledge Hub**: Complete German driving rules database
- 🔍 **Smart Retrieval**: Keyword-based search system
- 🌐 **Cross-Browser**: Any modern browser
- 🚀 **No Setup**: Cloud AI, no model download required
- 📱 **Responsive Design**: Desktop and mobile adapted

### 📱 Mobile App (Planned)
- 📍 **GPS Route Recording**: Real-time driving route recording
- 🎙️ **Voice Notes**: Voice-mark key moments
- 🔄 **Real-time Sync**: Sync data with Web App

## 📝 Recent Updates

### v3.0.0 - Hybrid AI Architecture (2025-10-23)
- ✅ **Chrome Extension Release**: Complete local AI support
- ✅ **Hybrid Fallback**: Local-first + cloud backup
- ✅ **Multi-API Integration**: Prompt, Translator, Summarizer APIs
- ✅ **Privacy Protection**: Local processing, data doesn't leave device
- ✅ **Cross-Platform Architecture**: Extension + Web App + Mobile (planned)

### v2.0.0 - Architecture Refactoring (2025-01-21)
- ✅ Migrated to Google Gemini API
- ✅ Implemented keyword-based retrieval
- ✅ Cross-browser compatibility

### v1.0.0 - Initial Release
- Chrome Prompt API with Gemini Nano
- FAISS vector embeddings

## 🔐 Security

- **API Key Protection**: `.env` file is git-ignored to protect your API key
- **Never commit secrets**: Always use `.env` for sensitive data
- **Create your own `.env`**: Follow the setup instructions to configure your API key

## 🌩️ Roadmap

### Phase 1: Extension ✅ (Completed)
- ✅ Chrome Extension base framework
- ✅ Prompt API integration (local AI)
- ✅ Translator & Summarizer APIs
- ✅ Hybrid Fallback mechanism

### Phase 2: Web App Upgrade (In Progress)
- 🔄 Migration to Next.js
- 🔄 Hybrid AI frontend integration
- 🔄 Extension data sync

### Phase 3: Mobile App (Planned)
- 📱 React Native/Expo development
- 📍 GPS route recording
- 🎙️ Voice notes functionality
- 🔄 Firebase real-time sync

### Phase 4: Complete Ecosystem (Planned)
- 📊 Driving data analysis
- 🗺️ Exam route planning
- 📈 Learning progress tracking
- 💰 Freemium subscription model

---

## 🎯 Hackathon Highlights

This project participates in **Google Chrome Built-in AI Hackathon**, core highlights:

### 1. Deep Multi-API Integration
- ✅ **Prompt API** - Core Q&A functionality
- ✅ **Translator API** - Multi-language support
- ✅ **Summarizer API** - Content optimization
- ✅ **Language Detector API** - Auto-detection

### 2. Hybrid AI Architecture Innovation
- 🔒 **Local-First**: Priority local processing (privacy)
- ☁️ **Cloud Fallback**: Intelligent degradation (reliability)
- 🌐 **Cross-Platform**: Multi-platform collaboration

### 3. Real-World Application
- 🎓 Solves real learning pain points (German driving license)
- 💼 Complete business model (Freemium)
- 🌍 Internationalization potential (multi-language, multi-market)

---

## 📚 Documentation

- [Chrome Extension README](chrome-extension/README.md)
- [Architecture Design](ARCHITECTURE.md)

---

## 🤝 Contributing

Contributions welcome! Please check:

1. **Issues**: https://github.com/mengfei0517/LicensePrep/issues
2. **Pull Requests**: https://github.com/mengfei0517/LicensePrep/pulls
3. **Discussions**: https://github.com/mengfei0517/LicensePrep/discussions
