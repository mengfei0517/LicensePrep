# Mobile App MVP Implementation Plan

## 🎯 MVP Goals

Build a minimal React Native app that can:
1. ✅ Track GPS location in real-time
2. ✅ Record audio notes with GPS coordinates
3. ✅ Upload data to Flask backend in real-time
4. ✅ Basic UI for start/stop recording

---

## 🛠️ Tech Stack

### Core
- **React Native**: Cross-platform mobile framework
- **Expo**: Managed workflow for rapid development
- **TypeScript**: Type-safe development

### Key Libraries
- `expo-location`: GPS tracking
- `expo-av`: Audio recording
- `axios`: HTTP requests to Flask backend
- `@react-navigation/native`: Navigation

---

## 📱 App Structure

```
mobile-app/
├── App.tsx                      # Entry point
├── app.json                     # Expo config
├── package.json
│
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Main dashboard
│   │   └── RecordScreen.tsx     # GPS + Audio recording
│   │
│   ├── components/
│   │   ├── GPSTracker.tsx       # GPS tracking component
│   │   └── AudioRecorder.tsx    # Audio recording component
│   │
│   ├── services/
│   │   ├── locationService.ts   # GPS tracking logic
│   │   ├── audioService.ts      # Audio recording logic
│   │   └── apiService.ts        # Flask API communication
│   │
│   └── types/
│       └── index.ts             # TypeScript types
```

---

## 🔌 Flask Backend API Updates

### New Endpoints

#### POST `/api/mobile/routes/start`
Start a new route recording session
```json
{
  "device_id": "unique_device_id",
  "start_time": "2025-10-23T10:00:00Z"
}
```
Response:
```json
{
  "session_id": "session_123",
  "upload_url": "/api/mobile/routes/session_123/upload"
}
```

#### POST `/api/mobile/routes/:session_id/gps`
Upload GPS points
```json
{
  "points": [
    {
      "latitude": 48.1351,
      "longitude": 11.5820,
      "altitude": 520,
      "accuracy": 10,
      "speed": 50,
      "timestamp": "2025-10-23T10:01:00Z"
    }
  ]
}
```

#### POST `/api/mobile/routes/:session_id/audio`
Upload audio note
```
Content-Type: multipart/form-data
- audio_file: <audio file>
- latitude: 48.1351
- longitude: 11.5820
- timestamp: 2025-10-23T10:05:00Z
```

#### POST `/api/mobile/routes/:session_id/finish`
Finish recording session
```json
{
  "end_time": "2025-10-23T10:45:00Z",
  "total_distance": 15.2,
  "total_duration": 45
}
```

---

## 📝 Implementation Steps

### Step 1: Setup Expo Project (15 min)
```bash
cd /home/fiona/projects/LicensePrep
npx create-expo-app mobile-app --template blank-typescript
cd mobile-app
npm install @react-navigation/native @react-navigation/native-stack
npm install expo-location expo-av axios
```

### Step 2: Configure Permissions (5 min)
Update `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow LicensePrep to access your location for route recording."
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow LicensePrep to record audio notes during your drive."
        }
      ]
    ]
  }
}
```

### Step 3: Build GPS Tracker (30 min)
- Implement location tracking with `expo-location`
- Background location updates
- Store points locally
- Upload in batches every 5 seconds

### Step 4: Build Audio Recorder (20 min)
- Implement audio recording with `expo-av`
- Record with GPS coordinates
- Upload immediately after recording

### Step 5: Build API Service (20 min)
- Axios client for Flask backend
- Retry logic for failed uploads
- Queue management for offline scenarios

### Step 6: Build UI (30 min)
- Simple start/stop button
- Real-time stats (distance, duration, points)
- Audio recording button
- Upload status indicator

### Step 7: Test End-to-End (30 min)
- Test on iOS Simulator
- Test on Android Emulator
- Test real device (if available)
- Verify Flask receives data

---

## 🎨 Minimal UI Design

### Home Screen
```
┌─────────────────────────┐
│   LicensePrep Mobile    │
├─────────────────────────┤
│                         │
│   📍 Route Recorder     │
│   Ready to record       │
│                         │
│   [Start Recording]     │
│                         │
│   Recent Routes:        │
│   • Route 1 - 15.2km    │
│   • Route 2 - 12.5km    │
│                         │
└─────────────────────────┘
```

### Recording Screen
```
┌─────────────────────────┐
│   🔴 Recording...       │
├─────────────────────────┤
│                         │
│   Duration: 00:15:30    │
│   Distance: 5.2 km      │
│   Speed: 45 km/h        │
│   Points: 310           │
│                         │
│   [🎤 Voice Note]       │
│                         │
│   [Stop Recording]      │
│                         │
│   📡 Upload: ✅ OK      │
│                         │
└─────────────────────────┘
```

---

## 🔐 Permissions Needed

### iOS
- Location (Always) - For background tracking
- Microphone - For voice notes

### Android
- ACCESS_FINE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- RECORD_AUDIO

---

## 📊 Data Flow

```
Mobile App
    │
    ├─ GPS Service (every 5s)
    │   └─> Flask POST /api/mobile/routes/:session/gps
    │
    ├─ Audio Service (on demand)
    │   └─> Flask POST /api/mobile/routes/:session/audio
    │
    └─ Session Management
        ├─> Flask POST /api/mobile/routes/start
        └─> Flask POST /api/mobile/routes/:session/finish
```

---

## 🧪 Testing Strategy

### Development
1. iOS Simulator - Primary testing
2. Android Emulator - Cross-platform verification
3. Expo Go app - Quick testing on real device

### Data Verification
1. Check Flask logs for incoming data
2. Verify GPS coordinates are accurate
3. Test audio playback on backend
4. Check data persistence

---

## ⏱️ Estimated Time

| Task | Time |
|------|------|
| Setup & Config | 20 min |
| GPS Implementation | 30 min |
| Audio Implementation | 20 min |
| API Integration | 20 min |
| UI Development | 30 min |
| Flask Backend Updates | 30 min |
| Testing | 30 min |
| **Total** | **~3 hours** |

---

## 🚀 Quick Start Commands

```bash
# Start Flask backend
python app.py

# Start mobile app (new terminal)
cd mobile-app
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

---

## 📦 Deliverables

1. ✅ Working React Native app (iOS + Android)
2. ✅ GPS tracking functionality
3. ✅ Audio recording with coordinates
4. ✅ Real-time upload to Flask
5. ✅ Basic UI for recording
6. ✅ Updated Flask API endpoints

---

## 🔄 Future Enhancements (Post-MVP)

- [ ] Offline mode with sync queue
- [ ] Firebase integration for user auth
- [ ] Route visualization in app
- [ ] Push notifications
- [ ] Background mode optimization
- [ ] Battery usage optimization



