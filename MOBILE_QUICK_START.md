# Mobile App Quick Start Guide

## 🎯 Goal
Get the mobile app running and recording GPS + audio data in under 5 minutes.

## ⚡ Quick Setup

### Step 1: Start Flask Backend (Terminal 1)
```bash
cd /home/fiona/projects/LicensePrep

# Activate conda environment
conda activate license-prep-env

# Set API key (either GOOGLE_GEMINI_API_KEY or legacy GOOGLE_API_KEY)
export GOOGLE_GEMINI_API_KEY="your-key"

# Start Flask
python app.py
```

✅ Flask running on http://localhost:5000

### Step 2: Start Mobile App (Terminal 2)
```bash
cd /home/fiona/projects/LicensePrep/mobile-app

# Start Expo
npx expo start
```

### Step 3: Run on Simulator
Press `i` for iOS or `a` for Android in the terminal

### Step 4: Test Recording
1. Wait for "Backend Online" status
2. Tap "▶️ Start Recording"
3. Watch stats update
4. Tap "🎤 Voice Note" to test audio
5. Tap "⏹️ Stop Recording"

## 📊 Verify Data

Check Flask terminal - you should see:
```
[Mobile API] ✅ Session started: session_20251023_103045_abc12345
[Mobile API] ✅ Uploaded 5 GPS points for session_...
[Mobile API] ✅ Audio note uploaded for session_...
[Mobile API] ✅ Session finished: session_...
```

Check data folder:
```bash
ls data/mobile_uploads/sessions/
ls data/mobile_uploads/audio/
```

## 🔧 Common Issues

### "Backend Offline"
```bash
# Make sure Flask is running
python app.py

# Check it's accessible
curl http://localhost:5000
```

### "Permission Denied"
- Uninstall app from simulator
- Restart: `npx expo start --clear`
- Allow permissions when prompted

### GPS Not Changing (iOS Simulator)
- Features → Location → Custom Location
- Or use: Features → Location → City Run

## 📱 Test on Real Device

1. Install "Expo Go" from App Store/Google Play
2. Configure `.env` in `mobile-app/`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:5000/api/mobile
   ```
3. Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
4. Scan QR code in Expo CLI with Expo Go app
5. Test with real GPS movement

## ✅ Success Criteria

- [ ] App shows "Backend Online"
- [ ] Can start/stop recording
- [ ] GPS points count increases
- [ ] Voice notes can be recorded
- [ ] Flask logs show data uploads
- [ ] Session JSON file created in `data/mobile_uploads/sessions/`
- [ ] Route appears on the web dashboard after refresh

## 🎉 Next Steps

1. Walk around with phone to test real GPS
2. Review recorded data in Flask backend
3. Integrate with Next.js web app for visualization
4. Add Firebase for cloud storage
5. Implement offline sync queue

---

**Need help?** Check `mobile-app/README.md` for detailed documentation.

