# 🚗 LicensePrep - German Driving Test Preparation

An AI-powered application for German driving test preparation, featuring intelligent Q&A powered by **Google Gemini API** and a comprehensive knowledge hub.

**Latest Update:** Migrated from Chrome Built-in AI to Google Gemini API for improved reliability and cross-browser compatibility.

## 📁 Repository Structure

```
LicensePrep/
├── app.py                        # Flask web server entry point
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

## 🛠️ Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mengfei0517/LicensePrep.git
cd LicensePrep
```

### 2. Create Python Environment
```bash
# Using conda (recommended)
conda create -n license-prep-env python=3.11 -y
conda activate license-prep-env

# Or using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Key (Important!)

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

- 🤖 **AI-Powered Q&A**: Intelligent answers powered by Google Gemini 2.5 Flash
- 📚 **Knowledge Hub**: Structured content covering all aspects of German driving rules
- 🔍 **Smart Retrieval**: Keyword-based knowledge retrieval system
- 🌐 **Cross-Browser**: Works on any modern browser
- 🚀 **No Local Models**: Cloud-based AI, no downloads required
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 📝 Recent Updates

### v2.0.0 - Architecture Refactoring (2025-01-21)
- ✅ Migrated from Chrome Built-in AI to Google Gemini API
- ✅ Removed complex vector-based RAG pipeline
- ✅ Implemented simple keyword-based retrieval
- ✅ Improved reliability and cross-browser compatibility
- ✅ Simplified codebase for easier maintenance

### Previous Version (v1.0.0)
- Used Chrome Prompt API with local Gemini Nano model
- Required Chrome Dev/Canary browser
- Complex vector embeddings with FAISS

## 🔐 Security

- **API Key Protection**: `.env` file is git-ignored to protect your API key
- **Never commit secrets**: Always use `.env` for sensitive data
- **Create your own `.env`**: Follow the setup instructions to configure your API key

## 🌩️ Future Enhancements

- 📊 Practice replay analysis with GPS tracking
- 🗺️ Intelligent route planning for driving tests
- 📈 Progress tracking and analytics
- 🎯 Personalized study recommendations
- 🌍 Multi-language support


