# 🏗️ LicensePrep - Hybrid AI Architecture

## Overview

LicensePrep is a Hybrid AI platform for German driving test preparation, using a **three-platform architecture** (Chrome Extension + Web App + Mobile App) with a **local-first AI** and **intelligent cloud fallback** strategy.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LicensePrep Platform                          │
│                  German Driving Test Hybrid AI Platform              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│ 📱 Mobile App│          │ 🌐 Web App   │          │🧩 Extension  │
│ React Native │          │ Flask/Next.js│          │ Manifest V3  │
└──────────────┘          └──────────────┘          └──────────────┘
│                          │                          │
│ • GPS Recording          │ • Data Analysis          │ • Local AI    │
│ • Voice Notes            │ • Route Review           │ • Translation │
│ • Real-time Sync         │ • Exam Planning          │ • Notes       │
│                          │ • Cloud Fallback         │               │
└──────────────────────────┼──────────────────────────┘
                           │
                           ▼
           ┌────────────────────────────────────┐
           │       Firebase Backend             │
           │  ┌──────────────────────────────┐  │
           │  │ Authentication               │  │
           │  │ Real-time Database           │  │
           │  │ Cloud Functions              │  │
           │  │ Storage (Voice, GPS, Images) │  │
           │  └──────────────────────────────┘  │
           └────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────┐
│ Chrome Built-in AI   │        │ Google Gemini API    │
│ (Local Processing)   │        │ (Cloud Processing)   │
├──────────────────────┤        ├──────────────────────┤
│ • Prompt API         │        │ • Gemini 2.5 Flash   │
│   (Gemini Nano)      │        │ • STT (Audio)        │
│ • Translator API     │        │ • Structured Output  │
│ • Summarizer API     │        │                      │
│ • Language Detector  │        │                      │
│ • Proofreader API    │        │                      │
└──────────────────────┘        └──────────────────────┘
     🔒 Privacy First              ☁️ Reliable Fallback
```

---

## Platform Responsibilities

### 🧩 Chrome Extension (Client-side AI Hub)

**Positioning**: Local AI priority platform, privacy protection, offline capability

**Core Features**:
- **F1.1 AI Q&A**: Prompt API local inference → Gemini Cloud Fallback
- **F1.2 Content Optimization**: Summarizer API for key points extraction
- **F1.3 Multi-language**: Translator API real-time translation
- **F5.2 Context Notes**: Annotate and save on any webpage

**Tech Stack**:
- Manifest V3
- Chrome Built-in AI APIs (primary)
- Chrome Storage API (local storage)
- Content Scripts (page injection)
- Service Worker (background tasks)

**Data Flow**:
```
User Input → Check Prompt API 
           ↓ (Available)
         Local Inference (Gemini Nano) → Return Answer 🔒
           ↓ (Unavailable)
         Fallback → Web App API → Gemini Cloud → Return Answer ☁️
```

---

### 🌐 Web App (Data Analysis Center)

**Positioning**: Cross-browser cloud platform, complex analysis, data visualization

**Core Features**:
- **F1.1 AI Q&A**: Gemini Cloud API (stable and reliable)
- **F3.1 Data Analysis**: Driving route replay and trend charts
- **F3.2 Behavior Recognition**: AI identifies driving issues
- **F4.1 Exam Planning**: Route simulation and voice navigation
- **F5.1 Knowledge Hub**: Structured rules browsing

**Tech Stack**:
- **Current**: Flask + Jinja2 + vanilla JS
- **Planned**: Next.js 14 (App Router) + React + TypeScript

**Why Next.js Migration**:
1. Frontend/backend separation for Extension/Mobile integration
2. Server Components for SEO optimization
3. Share React components with Mobile App
4. Modern development experience and ecosystem

---

### 📱 Mobile App (Data Collection Center)

**Positioning**: Real-time data collection, voice notes, GPS tracking

**Core Features**:
- **F2.1 Route Recording**: GPS + sensor real-time collection
- **F2.2 Voice Notes**: Mark key driving moments
- **F2.3 Real-time Sync**: Stream data upload to Firebase

**Tech Stack** (Planned):
- React Native / Expo (recommended)
- Expo Location (GPS)
- Expo AV (audio recording)
- Firebase SDK (real-time sync)

**Why React Native/Expo**:
1. Code reuse: Share React components with Web App (Next.js)
2. Cross-platform: One codebase for iOS + Android
3. Fast iteration: Expo provides complete toolchain
4. Community ecosystem: Rich third-party libraries

---

## Hybrid AI Strategy

### Local-First

**Advantages**:
- ✅ **Privacy Protection**: Data never leaves device
- ✅ **Low Latency**: < 3 seconds response
- ✅ **Offline Capable**: Works without network
- ✅ **Zero Cost**: No API call fees

**Limitations**:
- ⚠️ Device Requirements: Recommended 22GB RAM
- ⚠️ Browser Limitation: Chrome Canary/Dev only
- ⚠️ Model Download: ~1.7GB space required

### Cloud Fallback

**Trigger Conditions**:
1. Prompt API unavailable
2. Local inference fails
3. User actively chooses cloud mode

**Advantages**:
- ✅ **High Reliability**: 99.9% availability
- ✅ **Cross-browser**: Any modern browser
- ✅ **Zero Configuration**: No model download needed

**Cost Control**:
- Use Gemini API free tier (60 req/min monthly)
- Users can subscribe to Premium for unlimited access

---

## Data Flow Design

### 1. Q&A Data Flow

```
┌─────────────┐
│ User Question│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│Extension: Check Prompt API      │
└─────────┬───────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼(Available)▼(Unavailable)
┌─────────┐  ┌─────────────────┐
│Local AI │  │Call Web App API │
│(Nano)   │  └────────┬────────┘
└────┬────┘           │
     │                ▼
     │         ┌──────────────┐
     │         │ Gemini Cloud │
     │         └──────┬───────┘
     │                │
     └────────┬───────┘
              │
              ▼
       ┌──────────────┐
       │Return Answer │
       │+ Privacy Tag │
       └──────────────┘
```

### 2. Driving Data Flow (Mobile → Firebase → Web)

```
┌──────────────┐
│ Mobile App   │
│Record Driving│
└──────┬───────┘
       │ (Real-time)
       ▼
┌────────────────────────┐
│ Firebase Realtime DB   │
│ ├─ routes/{id}/points  │
│ └─ routes/{id}/notes   │
└──────┬─────────────────┘
       │ (Listen)
       ▼
┌──────────────────────┐
│ Web App              │
│ ├─ Map Replay        │
│ ├─ Data Visualization│
│ └─ AI Analysis       │
└──────────────────────┘
```

### 3. Notes Sync Flow (Extension ↔ Firebase ↔ Web)

```
Extension Saves Note
       ↓
Chrome Storage (Local)
       ↓
Background Sync to Firebase
       ↓
Web App Real-time Receives
       ↓
Display in Notes List
```

---

## API Integration Strategy

### Chrome Built-in AI APIs

| API | Purpose | Priority | Fallback |
|-----|---------|----------|----------|
| **Prompt API** | Core Q&A | ⭐⭐⭐ | Gemini Cloud |
| **Translator API** | Multi-language | ⭐⭐ | Gemini Cloud |
| **Summarizer API** | Content condensing | ⭐⭐ | Manual summary |
| **Language Detector** | Language detection | ⭐ | User selection |
| **Proofreader API** | Text verification | ⭐ | Skip |

### Google Cloud APIs

| API | Purpose | Usage Scenario |
|-----|---------|----------------|
| **Gemini 2.5 Flash** | Q&A Fallback | Built-in AI unavailable |
| **Speech-to-Text** | Voice transcription | F3.3 voice note processing |
| **Cloud Storage** | File storage | Audio, image uploads |

---

## Technology Stack

### Frontend
```
Extension:  Vanilla JS (ES6+) + Chrome APIs
Web App:    Next.js 14 + React + TypeScript (planned)
            Flask + Jinja2 (current)
Mobile App: React Native + Expo (planned)
```

### Backend
```
Current:  Flask + Python 3.11
Planned:  Firebase Functions + TypeScript
```

### AI/ML
```
Local:  Chrome Built-in AI (Gemini Nano)
Cloud:  Google Gemini 2.5 Flash API
```

### Database
```
Current:  Chrome Storage (Extension)
          In-memory JSON (Web App)
Planned:  Firebase Realtime Database
          Firebase Storage
```

### Deployment
```
Extension: Chrome Web Store
Web App:   Vercel / Google Cloud Run
Mobile:    Google Play + Apple App Store
Backend:   Firebase Hosting + Functions
```

---

## Security and Privacy

### Local Data Processing (Extension)
- ✅ Q&A History: Chrome Local Storage
- ✅ User Notes: Chrome Local Storage
- ✅ Settings: Chrome Local Storage
- ✅ **No data sent to servers** (in local mode)

### Cloud Data Processing (Web App)
- ⚠️ Q&A Requests: Sent to Gemini API (encrypted)
- ⚠️ User Data: Stored in Firebase (GDPR compliant)
- ✅ No sensitive info storage (passwords use Firebase Auth)

### User Control
- Users can choose local-only mode (Extension)
- Clear indication of data processing location (🔒 Local / ☁️ Cloud)
- Data export and deletion features provided

---

## Performance Targets

| Metric | Local Mode | Cloud Mode | Target |
|--------|-----------|-----------|--------|
| Q&A Response Latency | 2-3 sec | 3-5 sec | < 5 sec |
| Translation Latency | < 1 sec | 1-2 sec | < 2 sec |
| Summarization Latency | 1-2 sec | 2-3 sec | < 3 sec |
| Data Sync Latency | N/A | < 1 sec | Real-time |
| Offline Capability | ✅ | ❌ | Local-first |

---

## Business Model (Freemium)

### Free Tier
- ✅ Extension basic features (local AI)
- ✅ Knowledge hub browsing
- ✅ Limited Q&A (10/day)
- ✅ Notes functionality

### Premium Tier (€9.99/month)
- ✅ Unlimited Q&A
- ✅ Driving route recording (Mobile)
- ✅ Deep data analysis (Web)
- ✅ Exam route simulation
- ✅ Priority customer support

---

## Development Roadmap

### ✅ Phase 1: Extension MVP (Completed)
- ✅ Manifest V3 architecture
- ✅ Prompt API integration
- ✅ Translator & Summarizer APIs
- ✅ Hybrid Fallback logic
- ✅ Basic UI and interactions

### 🔄 Phase 2: Web App Upgrade (In Progress)
- 🔄 Migration to Next.js
- 🔄 Hybrid AI frontend integration
- 🔄 Extension data sync
- 🔄 Knowledge hub enhancement

### 📅 Phase 3: Mobile App (2-3 months)
- 📱 React Native initialization
- 📍 GPS recording feature
- 🎙️ Voice notes
- 🔄 Firebase real-time sync

### 📅 Phase 4: Complete Ecosystem (3-4 months)
- 📊 Data analysis dashboard
- 🗺️ Exam route planning
- 💰 Payment system integration
- 🌍 Full multi-language support

---

## Contributing

### Code Organization
```
chrome-extension/   → Extension related code
web/               → Web App frontend
api/               → Web App API endpoints
core/              → Shared business logic
agents/            → AI Agents (planned)
```

### Development Standards
- **Extension**: Use ESLint + Prettier
- **Web App**: Follow Next.js best practices
- **Mobile**: React Native style guide

---

## Contact

- **Project Home**: https://github.com/mengfei0517/LicensePrep
- **Issues**: https://github.com/mengfei0517/LicensePrep/issues
- **Author**: [@mengfei0517](https://github.com/mengfei0517)

---

*Last Updated: 2025-10-23*
