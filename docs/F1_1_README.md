# F1.1 RAG Q&A Implementation

## Overview

This implementation provides client-side RAG (Retrieval-Augmented Generation) Q&A functionality using Chrome Prompt API combined with server-side knowledge retrieval.

## Architecture

```
Frontend (Client-Side)
├── Step 1: Call /api/qa/retrieve_context to get knowledge chunks
├── Step 2: Build structured prompt (context + query)
└── Step 3: AI Inference (with automatic fallback)
    ├── Try Chrome Prompt API (preferred) ✅
    └── Fallback to /api/qa/generate (server-side LLM) 🔄

Backend (Server-Side)
├── /api/qa/retrieve_context - Returns relevant knowledge base chunks
└── /api/qa/generate - Server-side LLM generation (fallback)
    ├── With NIM: Uses real LLM
    └── Without NIM: Returns simulated structured answer
```

### Intelligent Fallback System

The system now automatically handles Chrome Prompt API unavailability:

1. **Primary**: Chrome Prompt API (client-side, private)
2. **Fallback**: Server-side LLM via `/api/qa/generate`
3. **Development**: Simulated answers when LLM not configured

**User Experience**: Seamless - users get answers regardless of API availability!

## NFR Compliance

- ✅ **NFR4.1 (Privacy)**: 
  - Preferred: Client-side AI via Chrome Prompt API (maximum privacy)
  - Fallback: Server-side LLM when Chrome API unavailable
- ✅ **NFR4.2 (Network Resilience)**: 
  - Multi-level fallback: Chrome API → Server LLM → Simulated answers
  - System continues working even when components are unavailable
- ℹ️ **NFR4.5 (Origin Trial)**: 
  - Optional: Only needed for Chrome Prompt API
  - System works without it via server-side fallback

## Files Modified

1. **api/routes_rule_qa.py** 
   - Added `/api/qa/retrieve_context` endpoint (knowledge retrieval)
   - Added `/api/qa/generate` endpoint (server-side LLM fallback)
2. **web/static/js/qa.js** 
   - Implemented `getRuleAnalysisAndDisplay()` function
   - Added intelligent fallback logic (Chrome API → Server LLM)
   - Added `checkPromptAPI()` diagnostic tool
3. **web/static/js/utils.js** - Added `displayStructuredAnswer()` function
4. **web/static/css/style.css** - Added structured answer styles
5. **app.py** - Updated server startup with localhost reminder

## Usage

### Prerequisites

⚡ **Quick Setup Guide:** See [CHROME_API_SETUP.md](CHROME_API_SETUP.md) for detailed step-by-step instructions.

**Essential Steps:**
1. Chrome Canary (version ≥ 121)
2. Enable `chrome://flags/#prompt-api-for-gemini-nano`
3. **Use `http://localhost:5000/` not `127.0.0.1`**
4. Restart Chrome after enabling flag

**Verify Setup:**
```javascript
// In browser console:
checkPromptAPI()  // Should show all ✅
```

### Testing the System

**Test 1: Knowledge Retrieval (Backend)**
```bash
curl -X POST http://localhost:5000/api/qa/retrieve_context \
  -H "Content-Type: application/json" \
  -d '{"query": "Autobahn rules", "k": 5}'
```

**Test 2: Server-side Generation (Fallback)**
```bash
curl -X POST http://localhost:5000/api/qa/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Schulterblick?", "context": "shoulder check required"}'
```

**Test 3: Chrome Prompt API (Browser Console)**
```javascript
// Check API status
checkPromptAPI()

// Test directly
await window.ai.languageModel.create().then(
  s => console.log('✅ Chrome API Working!')
).catch(
  e => console.log('❌ Not available:', e.message)
)
```

### Integration

The Q&A functionality is automatically integrated into pages that include the Q&A form elements:
- `#qa-form` - Question submission form
- `#question` - Question input field
- `#answer-box` - Answer display container
- `#answer-content` - Answer content area

## Expected JSON Response Format

```json
{
  "answer": "Concise answer (2-3 sentences)",
  "explanation": "Detailed explanation (optional)",
  "examples": ["Example 1", "Example 2"],
  "related_topics": ["Topic 1", "Topic 2"]
}
```

## Offline Mode

When backend is unavailable:
- Sets `isOffline = true`
- Displays warning badge: "⚠️ Offline Mode (No Knowledge Base Context)"
- Uses Chrome Prompt API with no knowledge context
- Provides basic answers based on model's built-in knowledge

## Known Limitations

1. ~~**Chrome Prompt API dependency**~~: ✅ RESOLVED via server-side fallback
2. **Server LLM**: Requires NIM_LLM_ENDPOINT for real AI answers (simulated in dev mode)
3. **Context length**: Both Chrome API and server LLMs have token limits
4. **Privacy trade-off**: Server fallback sends data to backend (Chrome API is fully local)

## Future Improvements

- ~~Hybrid mode~~: ✅ IMPLEMENTED - Automatic fallback system
- Context caching for common queries
- Streaming output support (for both Chrome API and server LLM)
- Multi-language support (German/English)
- Smart retry logic with exponential backoff
- User preference for API selection (privacy vs. capability)

