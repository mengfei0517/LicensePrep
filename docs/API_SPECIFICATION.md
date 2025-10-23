# LicensePrep API Specification

**Version**: 2.0  
**Last Updated**: October 23, 2025  
**Purpose**: Unified API for Web App (Next.js) and Mobile App (React Native)

---

## Overview

This specification defines the RESTful API endpoints for the LicensePrep platform. The API is designed to support both web and mobile clients with consistent data formats.

### Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.licenseprep.com` (TBD)

### Authentication

- **Current**: No authentication (hackathon MVP)
- **Planned**: Firebase Authentication (JWT tokens)
  - Header: `Authorization: Bearer <token>`

---

## API Endpoints

### 1. Content & Categories

#### GET `/api/content/categories`

Get all learning categories.

**Response**:
```json
{
  "categories": [
    {
      "id": "basic-driving",
      "name": "Grundlegende Fahraufgaben",
      "description": "Basic driving skills and operations",
      "image": "/static/images/basic-driving.jpg",
      "subcategories_count": 6
    }
  ]
}
```

#### GET `/api/content/categories/:categoryId`

Get detailed category with subcategories.

**Response**:
```json
{
  "id": "basic-driving",
  "name": "Grundlegende Fahraufgaben",
  "description": "...",
  "image": "/static/images/basic-driving.jpg",
  "subcategories": [
    {
      "id": "straight-driving",
      "name": "Geradeausfahren",
      "description": "...",
      "content": [...]
    }
  ]
}
```

#### GET `/api/content/subcategory/:categoryId/:subcategoryId`

Get specific subcategory content.

**Response**:
```json
{
  "id": "straight-driving",
  "name": "Geradeausfahren",
  "description": "...",
  "content": [
    {
      "type": "text",
      "content": "..."
    },
    {
      "type": "image",
      "url": "/static/images/..."
    },
    {
      "type": "list",
      "items": ["...", "..."]
    }
  ],
  "category": {
    "id": "basic-driving",
    "name": "Grundlegende Fahraufgaben"
  }
}
```

---

### 2. Q&A (Rule-based Learning)

#### POST `/api/qa/ask`

Ask a question about driving rules (simplified endpoint).

**Request**:
```json
{
  "question": "What is Rechts vor Links?"
}
```

**Response**:
```json
{
  "answer": "Rechts vor Links means 'right before left'...",
  "source": "google_gemini_api"
}
```

#### POST `/api/qa/retrieve_context`

Retrieve relevant knowledge chunks for a query.

**Request**:
```json
{
  "query": "speed limit in 30 zone",
  "k": 5
}
```

**Response**:
```json
{
  "chunks": [
    {
      "text": "In 30 km/h zones...",
      "category": "30-zone",
      "subcategory": "speed-limits",
      "description": "...",
      "score": 0.85
    }
  ],
  "count": 5
}
```

#### POST `/api/qa/generate`

Generate structured answer with context (full endpoint).

**Request**:
```json
{
  "query": "How to enter the Autobahn?",
  "context": "Optional pre-retrieved context...",
  "api_key": "optional_custom_gemini_key"
}
```

**Response**:
```json
{
  "answer": {
    "answer": "To enter the Autobahn...",
    "explanation": "The acceleration lane allows...",
    "examples": ["Example 1", "Example 2"],
    "related_topics": ["highway-speed", "lane-merging"]
  },
  "source": "google_gemini_api",
  "api_used": "Gemini 2.5 Flash"
}
```

---

### 3. Route Planning (Exam Preparation)

#### POST `/api/plan`

Generate a practice route plan.

**Request**:
```json
{
  "start": "Test Center Munich",
  "duration_min": 45,
  "focus_areas": ["autobahn", "30-zone", "parking"]
}
```

**Response**:
```json
{
  "plan": {
    "route_id": "route_123",
    "waypoints": [
      {
        "name": "Test Center",
        "lat": 48.1351,
        "lng": 11.5820,
        "instructions": "Start here"
      }
    ],
    "focus_areas": ["autobahn", "30-zone"],
    "duration_min": 45,
    "distance_km": 15.2
  }
}
```

---

### 4. Route Recording & Replay (Mobile-First)

#### POST `/api/routes/upload`

Upload a recorded GPS route.

**Request** (multipart/form-data):
```
gpx_file: <GPX file>
metadata: {
  "recorded_at": "2025-10-23T10:30:00Z",
  "duration_min": 45,
  "distance_km": 15.2,
  "user_id": "optional_firebase_uid"
}
```

**Response**:
```json
{
  "route_id": "route_abc123",
  "uploaded_at": "2025-10-23T10:35:00Z",
  "file_url": "/uploads/routes/route_abc123.gpx",
  "preview_url": "/api/routes/route_abc123/preview"
}
```

#### GET `/api/routes`

List user's recorded routes.

**Query Parameters**:
- `user_id` (optional): Filter by user
- `limit`: Max results (default: 20)
- `offset`: Pagination offset

**Response**:
```json
{
  "routes": [
    {
      "route_id": "route_abc123",
      "recorded_at": "2025-10-23T10:30:00Z",
      "duration_min": 45,
      "distance_km": 15.2,
      "preview_url": "/api/routes/route_abc123/preview",
      "analysis_status": "pending" | "completed" | "failed"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### GET `/api/routes/:routeId`

Get detailed route information.

**Response**:
```json
{
  "route_id": "route_abc123",
  "recorded_at": "2025-10-23T10:30:00Z",
  "duration_min": 45,
  "distance_km": 15.2,
  "gpx_url": "/uploads/routes/route_abc123.gpx",
  "waypoints": [...],
  "metadata": {
    "avg_speed_kmh": 35.5,
    "max_speed_kmh": 90.0,
    "zones_visited": ["30-zone", "stadt-zone", "autobahn"]
  }
}
```

#### POST `/api/replay/analyze`

Analyze a recorded route (AI-powered).

**Request**:
```json
{
  "route_id": "route_abc123",
  "gpx_path": "/uploads/routes/route_abc123.gpx"
}
```

**Response**:
```json
{
  "route_id": "route_abc123",
  "analysis": {
    "score": 85,
    "violations": [
      {
        "timestamp": "10:32:15",
        "location": { "lat": 48.1351, "lng": 11.5820 },
        "type": "speed_limit_exceeded",
        "severity": "medium",
        "description": "Speed was 35 km/h in 30 zone"
      }
    ],
    "strengths": [
      "Good mirror checking at intersections",
      "Proper lane positioning"
    ],
    "suggestions": [
      "Pay more attention to speed limits",
      "Practice shoulder checks before lane changes"
    ]
  },
  "analyzed_at": "2025-10-23T10:40:00Z"
}
```

---

### 5. User Progress & Stats (Firebase-Ready)

#### GET `/api/users/:userId/progress`

Get learning progress for a user.

**Response**:
```json
{
  "user_id": "firebase_uid_123",
  "progress": {
    "categories_completed": 3,
    "total_categories": 8,
    "subcategories_completed": 15,
    "total_subcategories": 42,
    "quiz_score_avg": 82.5
  },
  "completed_categories": ["basic-driving", "30-zone"],
  "current_focus": "autobahn"
}
```

#### POST `/api/users/:userId/progress`

Update user progress.

**Request**:
```json
{
  "category_id": "basic-driving",
  "subcategory_id": "straight-driving",
  "action": "completed" | "bookmarked" | "in_progress"
}
```

**Response**:
```json
{
  "success": true,
  "updated_at": "2025-10-23T10:45:00Z"
}
```

---

## Error Handling

All endpoints follow consistent error format:

**Error Response**:
```json
{
  "error": "Error message describing what went wrong",
  "error_code": "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR" | "RATE_LIMIT",
  "details": {
    "field": "question",
    "message": "Question is required"
  }
}
```

**HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error
- `503`: Service Unavailable (e.g., Gemini API overloaded)

---

## Rate Limiting

- **Free Tier**: 100 requests/hour per IP
- **Authenticated**: 1000 requests/hour per user
- **Premium**: 10000 requests/hour per user

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## CORS Configuration

**Allowed Origins** (Development):
- `http://localhost:3000` (Next.js)
- `http://localhost:19000` (React Native Expo)
- `http://localhost:5000` (Flask)

**Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`

**Allowed Headers**: `Content-Type, Authorization`

---

## Versioning

API version specified in URL path:
- Current: `/api/v1/...` (or `/api/...` as default v1)
- Future: `/api/v2/...`

---

## WebSocket Support (Future)

For real-time features like live route tracking:

**Endpoint**: `ws://localhost:5000/ws/routes/:routeId`

**Events**:
- `location_update`: GPS location update
- `analysis_update`: Real-time analysis feedback
- `session_end`: Route recording ended

---

## Mobile App Considerations

### Offline Support
- Content should be cached locally
- Queue API requests for later sync
- Use Firebase Firestore for offline-first data

### Data Efficiency
- Support for `fields` query parameter to request only needed data
- Image optimization with size parameters
- Compressed responses (gzip)

### Example with field filtering:
```
GET /api/content/categories?fields=id,name,image
```

---

## Next Steps

1. ✅ Document all existing endpoints
2. ⏳ Implement missing endpoints (routes upload, user progress)
3. ⏳ Add Firebase Authentication
4. ⏳ Optimize for mobile data efficiency
5. ⏳ Add API versioning
6. ⏳ Deploy to production with proper CORS

