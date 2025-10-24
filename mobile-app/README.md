# LicensePrep Mobile App

React Native mobile app for recording driving routes with GPS tracking and voice notes.

## 🎯 Features

- ✅ **Real-time GPS tracking** - High-accuracy location recording
- ✅ **Voice notes** - Record audio observations with GPS coordinates
- ✅ **Real-time upload** - Data syncs to Flask backend automatically
- ✅ **Live statistics** - Distance, duration, speed, points count
- ✅ **Offline-ready** - Works without backend (data stored locally)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Flask backend running and reachable on your network (default http://localhost:5000)

### Installation

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Running the App

**iOS Simulator** (requires macOS):
```bash
npx expo start --ios
```

**Android Emulator**:
```bash
npx expo start --android
```

**Physical Device** (recommended for GPS testing):
1. Install "Expo Go" app from App Store / Google Play
2. Run `npx expo start`
3. Scan QR code with Expo Go app

## 📱 Testing on Real Device

For accurate GPS testing, use a real device:

### Configure API URL

Create or update `.env` inside `mobile-app/`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.X:5000/api/mobile
```

- Replace `192.168.1.X` with your development machine's IP if using a real device.
- When running in Expo Go on the same machine, the app will auto-detect the host (no change needed).

### Find Your Computer's IP

**macOS/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows**:
```cmd
ipconfig
```

Look for "IPv4 Address" on your WiFi adapter.

## 🔧 Configuration

### Permissions

The app requires:
- **Location** (Always) - For GPS tracking during recording
- **Microphone** - For voice notes

Permissions are requested automatically on first use.

### Backend Connection

Make sure Flask backend is running:
```bash
cd ..
python app.py
```

Backend should be accessible at `http://<FLASK_HOST>:<FLASK_PORT>` (defaults to `http://localhost:5000`).

## 📊 How It Works

### 1. Start Recording
- Tap "▶️ Start Recording"
- App requests location permissions
- Creates session with Flask backend
- Starts GPS tracking (updates every 1 second or 5 meters)

### 2. During Recording
- **GPS Data**: Automatically uploaded in batches every 5 seconds
- **Voice Notes**: Tap "🎤 Voice Note" to record audio with GPS coordinates
- **Statistics**: Real-time display of distance, duration, speed

### 3. Stop Recording
- Tap "⏹️ Stop Recording"
- Final data uploaded to backend
- Session marked as completed

## 📂 Project Structure

```
mobile-app/
├── App.tsx                      # Entry point
├── app.json                     # Expo configuration
│
├── src/
│   ├── screens/
│   │   └── RecordScreen.tsx     # Main recording screen
│   │
│   ├── services/
│   │   ├── locationService.ts   # GPS tracking
│   │   ├── audioService.ts      # Audio recording
│   │   └── apiService.ts        # Flask API client
│   │
│   └── types/
│       └── index.ts             # TypeScript types
│
└── package.json
```

## 🐛 Troubleshooting

### "Backend Offline" Warning

**Problem**: App shows "Backend is offline"

**Solutions**:
1. Ensure Flask is running: `python app.py`
2. Check Flask is on port 5000
3. If on real device, set `EXPO_PUBLIC_API_BASE_URL` (see configuration above)

### GPS Not Working in Simulator

**Problem**: GPS coordinates don't change in simulator

**Solution**: iOS Simulator allows simulating location:
- Features → Location → Custom Location
- Or use pre-defined locations (Apple, City Run, Freeway Drive)

**Better**: Test on real device for accurate GPS

### Permissions Not Requested

**Problem**: App doesn't ask for permissions

**Solution**:
1. Uninstall app completely
2. Reinstall: `npx expo start --clear`
3. Permissions will be requested on first launch

### Audio Recording Fails

**Problem**: Voice notes don't record

**Solutions**:
1. Check microphone permission in device settings
2. Ensure no other app is using microphone
3. Try recording again

## 📊 Data Storage

### During Recording
- GPS points buffered in memory
- Uploaded to Flask every 5 seconds
- Session data stored at: `data/mobile_uploads/sessions/`

### After Recording
Session JSON file contains:
```json
{
  "session_id": "session_20251023_103045_abc12345",
  "device_id": "device_identifier",
  "start_time": "2025-10-23T10:30:45Z",
  "end_time": "2025-10-23T11:15:30Z",
  "gps_points": [...],
  "audio_notes": [...],
  "total_distance_km": 15.2,
  "total_duration_min": 45,
  "status": "completed"
}
```

Audio files stored at: `data/mobile_uploads/audio/`

The web dashboard (Exam Route Simulation page) consumes these sessions via `GET /api/mobile/routes`, so completed drives appear automatically without manual uploads.

## 🚧 Known Limitations (MVP)

- No offline sync queue (data lost if upload fails)
- No user authentication
- No route visualization in app
- No background mode optimization
- Limited battery optimization

## 🔮 Future Enhancements

- [ ] Offline mode with sync queue
- [ ] Firebase user authentication
- [ ] In-app route visualization with map
- [ ] Battery usage optimization
- [ ] Background recording support
- [ ] Route sharing
- [ ] Push notifications

## 📝 Testing Checklist

- [ ] Start recording on simulator
- [ ] Verify GPS points appear in stats
- [ ] Simulate location changes (iOS Simulator)
- [ ] Record voice note
- [ ] Stop recording
- [ ] Check Flask logs for uploaded data
- [ ] Verify JSON file in `data/mobile_uploads/sessions/`
- [ ] Refresh web dashboard (`/learn/simulate`) and confirm the new route appears
- [ ] Test on real device with actual GPS

## 🆘 Support

- **Mobile App Issues**: Check this README
- **Backend Issues**: See `/README.md`
- **API Documentation**: See `/docs/API_SPECIFICATION.md`

---

## 📱 Demo Workflow

1. **Start Flask Backend**
   ```bash
   python app.py
   ```

2. **Start Mobile App**
   ```bash
   cd mobile-app
   npx expo start
   ```

3. **In App**:
   - Wait for "Backend Online" status
   - Tap "▶️ Start Recording"
   - Walk/drive around (or simulate location)
   - Tap "🎤 Voice Note" to add audio
   - Tap "⏹️ Stop Recording"

4. **Check Results**:
   - Flask logs show uploaded data
   - Session file in `data/mobile_uploads/sessions/`
   - Audio files in `data/mobile_uploads/audio/`

Happy Recording! 🚗📍
