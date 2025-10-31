# Flask Backend API Guide

## 🎯 Purpose

After migrating the frontend to Next.js, Flask now serves as a **pure backend API server** with the following responsibilities:

### Core Responsibilities

1. **RESTful API Server** 📡
   - Provides `/api/*` endpoints for Next.js frontend
   - Serves Chrome Extension API requests
   - Future: Mobile app API support

2. **Route Recording/Review Tools** 🗺️
   - Hosts HTML pages for GPS route recording
   - Provides route playback and analysis interface
   - Accessed from Next.js `/simulate` page

3. **Static File Server** 🖼️
   - Serves learning content images
   - Provides GPX files and route data
   - Proxied by Next.js for seamless integration

---

## 🌐 Available Endpoints

### Root Endpoint
**GET** `http://localhost:5000/`
- Returns API information and status
- Lists all available endpoints
- Provides documentation links

**Response**:
```json
{
  "name": "LicensePrep API",
  "version": "2.0",
  "status": "running",
  "frontend": "http://localhost:3000",
  "endpoints": {...},
  "message": "Visit http://localhost:3000 for the web application"
}
```

---

### API Endpoints (for Next.js/Mobile)

#### Content & Learning
- `GET /api/content/categories` - All learning categories
- `GET /api/content/categories/:id` - Category details
- `GET /api/content/subcategory/:categoryId/:subcategoryId` - Specific content

#### Q&A System
- `POST /api/qa/ask` - Simple Q&A
- `POST /api/qa/retrieve_context` - Retrieve relevant context
- `POST /api/qa/generate` - Generate structured answer with AI

#### Route Planning & Replay
- `POST /api/plan` - Generate practice route plan
- `POST /api/replay/analyze` - Analyze recorded route

**Full API Documentation**: `/docs/API_SPECIFICATION.md`

---

### Tools & Utilities

#### Route Recorder
**GET** `http://localhost:5000/route-recorder`
- Full-page GPS route recording interface
- OpenStreetMap integration
- Voice notes with GPS coordinates
- Speed tracking and analysis
- Saves to browser localStorage

**Accessed from**: Next.js `/simulate` page → "Record New Route" button

#### Route Review
**GET** `http://localhost:5000/route-review/<route_id>`
- Route playback and visualization
- Speed analysis charts
- Synchronized voice note playback
- Variable-speed replay

**Accessed from**: Next.js `/simulate` page → "Review" button on each route

---

### Static Files
**GET** `http://localhost:5000/static/images/*`
- Learning content images
- Category/subcategory illustrations
- Driving technique diagrams

**Note**: Next.js proxies these requests, so frontend uses `/static/images/*` directly.

---

## 🔧 How to Use

### Start Flask Backend

```bash
# Activate Python environment
conda activate license-prep-env

# Set API key
export GOOGLE_API_KEY="your-gemini-api-key"

# Run Flask server
python app.py
```

Backend runs on: **http://localhost:5000**

### Test API

```bash
# Check API status
curl http://localhost:5000/

# Test content endpoint
curl http://localhost:5000/api/content/categories

# Test Q&A endpoint
curl -X POST http://localhost:5000/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Rechts vor Links?"}'
```

---

## 🏗️ Architecture Flow

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌────────────────┐
│  Next.js Web   │    │  Chrome Ext    │
│  (Port 3000)   │    │  (Built-in AI) │
└────────┬───────┘    └────────┬───────┘
         │                      │
         │ API Calls            │ API Calls
         ├──────────────────────┤
         │                      │
         ▼                      ▼
┌─────────────────────────────────┐
│      Flask Backend API          │
│        (Port 5000)              │
│                                 │
│  ┌──────────────────────────┐  │
│  │  API Routes              │  │
│  │  - Content               │  │
│  │  - Q&A (Gemini)          │  │
│  │  - Routes                │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Tools                   │  │
│  │  - Route Recorder HTML   │  │
│  │  - Route Review HTML     │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Static Files            │  │
│  │  - Images                │  │
│  │  - GPX Files             │  │
│  └──────────────────────────┘  │
└──────────────┬──────────────────┘
               │
               ▼
       Google Gemini API
```

---

## 🚫 What Flask NO Longer Does

After Next.js migration, Flask **no longer**:
- ❌ Serves the main web application UI
- ❌ Renders category/subcategory pages
- ❌ Handles frontend routing
- ❌ Manages user session UI

**These are now handled by Next.js** at `http://localhost:3000`

---

## 📝 Key Points

1. **Flask is now API-only** (except for route recorder/review tools)
2. **Always start BOTH servers** for full functionality:
   - Flask: `python app.py` (port 5000)
   - Next.js: `cd web-app && npm run dev` (port 3000)
3. **Use `./start-dev.sh`** to start both servers automatically
4. **Access main app** at `http://localhost:3000`, NOT `http://localhost:5000`
5. **Flask root** (`http://localhost:5000/`) now shows API information

---

## 🔍 Common Scenarios

### Scenario 1: Developing New Feature
**Frontend (Next.js)**: Add UI components and pages
**Backend (Flask)**: Add API endpoint if needed
**Update**: `/docs/API_SPECIFICATION.md` with new endpoints

### Scenario 2: Testing API
```bash
# Start Flask
python app.py

# Test endpoint
curl http://localhost:5000/api/your-endpoint

# Or visit API info page
open http://localhost:5000/
```

### Scenario 3: Full Stack Development
```bash
# Use convenience script
./start-dev.sh

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 🆘 Troubleshooting

### Problem: "Not Found" when visiting `http://localhost:5000/`
**Solution**: This is expected! Visit API info page to see available endpoints.

### Problem: Next.js can't connect to Flask
**Check**:
1. Flask is running: `curl http://localhost:5000/`
2. CORS is enabled (check `app.py`)
3. API base URL in Next.js config: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`

### Problem: Images not loading in Next.js
**Check**:
1. Flask static folder is accessible: `curl http://localhost:5000/static/images/basic-driving.jpg`
2. Next.js proxy is configured in `web-app/next.config.ts`
3. Both servers are running

---

## 📚 Related Documentation

- **API Specification**: `/docs/API_SPECIFICATION.md`
- **Architecture Overview**: `/docs/ARCHITECTURE.md`
- **Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md`
- **Next.js Frontend**: `/web-app/README.md`

---

## ✅ Quick Reference

| What | Where |
|------|-------|
| **Flask Backend** | `http://localhost:5000/` |
| **API Endpoints** | `http://localhost:5000/api/*` |
| **Route Recorder** | `http://localhost:5000/route-recorder` |
| **Route Review** | `http://localhost:5000/route-review/<id>` |
| **Next.js Frontend** | `http://localhost:3000/` |
| **Start Both** | `./start-dev.sh` |

