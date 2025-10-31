# LicensePrep Deployment Guide

Complete deployment guide for the Hybrid AI platform (Web App, Mobile App, Chrome Extension).

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  Chrome Ext     │────┐
│  (Manifest V3)  │    │
└─────────────────┘    │
                       ├──► Flask Backend ────► Gemini API
┌─────────────────┐    │      (Port 5000)
│  Next.js Web    │────┤
│  (Port 3000)    │    │
└─────────────────┘    │      ┌──────────────┐
                       ├──────│  Firebase    │
┌─────────────────┐    │      │  - Auth      │
│  React Native   │────┘      │  - Firestore │
│  Mobile App     │           │  - Storage   │
└─────────────────┘           └──────────────┘
```

---

## 📋 Prerequisites

### Development Environment

- **Node.js**: 18+ (for Next.js and Chrome Extension)
- **Python**: 3.11+ (for Flask backend)
- **npm/yarn**: Package management
- **Git**: Version control
- **Firebase Account**: For authentication and data sync
- **Google Cloud Account**: For Gemini API
- **ImageMagick**: For Chrome Extension icon generation

### API Keys Required

1. **Google Gemini API Key**
   - Get from: https://aistudio.google.com/app/apikey
   - Required for: Backend AI features

2. **Firebase Config**
   - Get from: https://console.firebase.google.com
   - Required for: Auth, Firestore, Storage

---

## 🚀 Deployment: Flask Backend

### Local Development

```bash
cd /path/to/LicensePrep

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY="your-gemini-api-key"

# Run server
python app.py
```

Backend runs on: `http://localhost:5000`

### Production Deployment Options

#### Option 1: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx

# Clone repository
git clone https://github.com/yourusername/LicensePrep.git
cd LicensePrep

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
nano .env
# Add: GOOGLE_API_KEY=your-key

# Run with gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Nginx Configuration** (`/etc/nginx/sites-available/licenseprep`):
```nginx
server {
    listen 80;
    server_name api.licenseprep.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
# Build and run
docker build -t licenseprep-backend .
docker run -p 5000:5000 -e GOOGLE_API_KEY=your-key licenseprep-backend
```

#### Option 3: Railway/Render/Fly.io

1. Connect GitHub repository
2. Set environment variables:
   - `GOOGLE_API_KEY`
   - `PORT=5000`
3. Deploy automatically on push

---

## 🌐 Deployment: Next.js Web App

### Local Development

```bash
cd web-app

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URLs and Firebase config

# Run development server
npm run dev
```

Web app runs on: `http://localhost:3000`

### Production Deployment

#### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Choose `web-app` as root directory

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.licenseprep.com/api
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Deploy**
   - Vercel auto-deploys on git push
   - Custom domain: `www.licenseprep.com`

#### Option 2: Netlify

```bash
cd web-app

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option 3: Docker

```dockerfile
# web-app/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t licenseprep-web .
docker run -p 3000:3000 licenseprep-web
```

---

## 🧩 Deployment: Chrome Extension

### Build & Package

```bash
cd chrome-extension

# Install dependencies
npm install

# Generate icons
./generate-icons.sh

# Package extension
zip -r licenseprep-extension.zip . \
  -x "*.git*" "node_modules/*" "*.DS_Store"
```

### Publish to Chrome Web Store

1. **Prepare Assets**
   - Extension ZIP file
   - 128x128px icon
   - 1280x800px screenshots (at least 1)
   - 440x280px promotional tile (optional)

2. **Developer Dashboard**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time developer fee (if first time)

3. **Upload Extension**
   - Click "New Item"
   - Upload `licenseprep-extension.zip`
   - Fill in details:
     - Name: "LicensePrep - AI Driving Coach"
     - Description: See `manifest.json`
     - Category: Education
     - Language: English

4. **Privacy & Permissions**
   - Privacy policy URL (required)
   - Justify all permissions in manifest

5. **Submit for Review**
   - Review time: 1-3 business days
   - Once approved, extension goes live

### Distribution Options

- **Chrome Web Store** (Public): Anyone can install
- **Unlisted**: Only people with link can install
- **Private**: Only specific Google Workspace domain
- **Developer Mode** (Testing): Load unpacked extension

---

## 📱 Deployment: React Native Mobile App (Future)

### Setup

```bash
# Install Expo CLI
npm install -g expo-cli

# Create new Expo project
npx create-expo-app mobile-app

# Navigate to project
cd mobile-app

# Install dependencies
npm install
```

### Development

```bash
# Start Expo server
npx expo start

# Run on iOS Simulator
npx expo start --ios

# Run on Android Emulator
npx expo start --android

# Run on physical device (scan QR code with Expo Go app)
```

### Production Build

#### iOS (App Store)

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect setup
- App icons and screenshots
- Privacy policy URL

#### Android (Google Play)

```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

**Requirements**:
- Google Play Developer Account ($25 one-time)
- App icons and screenshots
- Privacy policy URL
- Content rating questionnaire

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: "LicensePrep"
4. Disable Google Analytics (optional)
5. Create project

### 2. Enable Services

#### Authentication
- Go to Authentication → Get Started
- Enable Email/Password sign-in
- (Optional) Enable Google sign-in

#### Firestore Database
- Go to Firestore Database → Create database
- Start in production mode
- Choose location (europe-west3 for EU)

**Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User progress
    match /user_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Routes
    match /routes/{routeId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

#### Storage
- Go to Storage → Get Started
- Start in production mode

**Storage Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /routes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Get Configuration

1. Go to Project Settings
2. Scroll to "Your apps"
3. Click "Add app" → Web
4. Copy configuration object
5. Add to `.env.local` in Next.js and mobile apps

---

## 🔒 Security Checklist

### Backend
- ✅ Use environment variables for API keys
- ✅ Enable CORS only for known origins
- ✅ Implement rate limiting
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

### Frontend
- ✅ Never expose API keys client-side
- ✅ Use Firebase Auth for user management
- ✅ Implement proper error boundaries
- ✅ Sanitize user-generated content
- ✅ Use Content Security Policy headers

### Firebase
- ✅ Configure security rules properly
- ✅ Enable App Check for abuse prevention
- ✅ Monitor quota usage
- ✅ Set up budget alerts

---

## 📊 Monitoring & Analytics

### Backend Monitoring

**Option 1: PM2**
```bash
npm install -g pm2
pm2 start app.py --name licenseprep-api
pm2 monit
```

**Option 2: New Relic / DataDog**
- Sign up for account
- Install agent
- Configure monitoring

### Frontend Analytics

**Google Analytics 4**:
```typescript
// web-app/lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';

export function trackEvent(eventName: string, params?: object) {
  const analytics = getAnalytics();
  logEvent(analytics, eventName, params);
}
```

**Vercel Analytics** (automatic on Vercel):
```bash
npm install @vercel/analytics
```

---

## 🧪 Testing Deployment

### End-to-End Testing

1. **Backend Health Check**
   ```bash
   curl https://api.licenseprep.com/api/content/categories
   ```

2. **Frontend Smoke Test**
   - Visit https://licenseprep.com
   - Click through all main pages
   - Test Q&A functionality
   - Check mobile responsiveness

3. **Extension Testing**
   - Install from Chrome Web Store
   - Test Q&A functionality
   - Verify API calls work
   - Check context menu

4. **Mobile App Testing**
   - Test on iOS device
   - Test on Android device
   - Verify Firebase sync
   - Test offline functionality

---

## 📈 Scaling Considerations

### Database
- **Small (<1000 users)**: Firebase free tier
- **Medium (<10k users)**: Firebase Blaze plan
- **Large (>10k users)**: Consider PostgreSQL + managed hosting

### Backend API
- **Small**: Single EC2 instance / Cloud Run
- **Medium**: Load balancer + multiple instances
- **Large**: Kubernetes cluster

### Storage
- **Routes/GPX files**: Firebase Storage or S3
- **Static assets**: CDN (Cloudflare, Cloudinary)

---

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**:
- Check Flask CORS configuration
- Verify allowed origins include your domain

**Firebase Connection Issues**:
- Verify environment variables are set
- Check Firebase project settings
- Ensure security rules allow access

**Build Failures**:
- Clear caches: `rm -rf node_modules .next && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

---

## 📞 Support & Resources

- **Documentation**: `/README.md`, `/docs/API_SPECIFICATION.md`
- **Architecture**: `/docs/ARCHITECTURE.md`
- **Chrome Extension**: `/chrome-extension/README.md`
- **Web App**: `/web-app/README.md`

---

## ✅ Deployment Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] API keys secured and tested
- [ ] Firebase project set up
- [ ] Security rules configured
- [ ] CORS properly configured
- [ ] SSL certificates obtained
- [ ] Domain names configured

### Launch
- [ ] Backend deployed and healthy
- [ ] Web app deployed and accessible
- [ ] Chrome extension submitted/published
- [ ] Mobile app build tested
- [ ] Analytics configured
- [ ] Monitoring set up

### Post-Launch
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan feature updates
- [ ] Schedule security audits

