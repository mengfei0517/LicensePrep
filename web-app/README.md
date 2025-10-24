# LicensePrep Web App (Next.js)

Modern web frontend for the LicensePrep platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Flask backend running on `http://localhost:5000`

### Installation

```bash
cd web-app
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
web-app/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home page
│   ├── learn/             # Learning pages
│   │   ├── page.tsx       # Categories list
│   │   └── [categoryId]/  
│   │       ├── page.tsx   # Subcategories list
│   │       └── [subcategoryId]/
│   │           └── page.tsx  # Content detail
│   ├── qa/                # Q&A page
│   ├── routes/            # Route recording/review
│   └── progress/          # Progress tracking
├── components/            # React components
│   └── Navigation.tsx     # Main navigation
├── lib/                   # Utilities and API
│   ├── api-client.ts      # Type-safe API client
│   └── hooks/             # Custom React hooks
│       ├── use-content.ts
│       └── use-routes.ts
└── public/                # Static assets
```

## 🔌 API Integration

### Flask Backend

The web app proxies all API calls through Next.js to the Flask backend defined by `FLASK_BACKEND_URL` (defaults to `http://localhost:5000`). Client requests are made to `/backend/api/*`, avoiding CORS issues even when opening the site from another device on the network.

Configure in `web-app/.env.local`:
```env
FLASK_BACKEND_URL=http://localhost:5000
# Optional: override proxy target for the browser
# NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

### Available Endpoints

- `GET /api/content/categories` - All categories
- `GET /api/content/categories/:id` - Category details
- `GET /api/content/subcategory/:categoryId/:subcategoryId` - Content
- `POST /api/qa/ask` - Ask questions
- `POST /api/qa/generate` - Structured answers
- `GET /api/mobile/routes` - Mobile-recorded route summaries
- `GET /api/mobile/routes/:sessionId` - Detailed session payload (GPS + audio metadata)
- `DELETE /api/mobile/routes/:sessionId` - Remove a recorded session and audio blobs
- More documented in `/docs/API_SPECIFICATION.md`

## 🎨 Features

### ✅ Implemented

- **Learning Content**: Browse categories and subcategories
- **Q&A System**: AI-powered question answering
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage
- **Data Fetching**: SWR for efficient caching and revalidation
- **Error Handling**: Graceful error states with fallbacks
- **Mobile Route Sync**: Finished sessions from the Expo app appear automatically in the dashboard

### 🚧 In Development

- **Advanced Route Analytics**: Segment analysis, scoring, and heatmaps
- **Progress Tracking**: Firebase-backed user progress
- **Authentication**: Firebase Auth integration
- **Offline Support**: Service workers and caching

## 🔥 Firebase Integration (Upcoming)

### Setup

1. Create Firebase project at https://console.firebase.google.com
2. Add web app to project
3. Copy config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Install Firebase SDK:
```bash
npm install firebase
```

### Planned Firebase Features

- **Authentication**: User login/registration
- **Firestore**: Route data synchronization
- **Storage**: GPX file uploads
- **Functions**: Server-side route analysis

## 🛠️ Development

### Code Quality

```bash
# Type checking
npm run build

# Linting
npm run lint
```

### Environment Variables

Create `.env.local`:

```env
# Flask Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Firebase (optional, for future features)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ... other Firebase config

# Gemini API (optional, client-side fallback)
NEXT_PUBLIC_GEMINI_API_KEY=
```

## 📦 Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 🌐 Deployment Options

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Mobile App Integration

The web app is designed to work seamlessly with the React Native mobile app:

- Shared API client interface
- Consistent data models
- Firebase sync for cross-platform data
- Offline-first architecture

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

See LICENSE file in root directory.

## 🆘 Troubleshooting

### Backend Connection Issues

**Error**: "Failed to load categories"

**Solution**: 
- Ensure Flask backend is running on port 5000
- Check CORS configuration in `app.py`
- Verify `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`

### Build Errors

**Error**: Type errors during build

**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript configuration in `tsconfig.json`
- Clear `.next` folder: `rm -rf .next && npm run dev`

### Hydration Errors

**Error**: "Hydration failed"

**Solution**:
- Ensure server and client components are properly marked
- Check for mismatched HTML structure
- Use `'use client'` directive when needed

## 🔗 Related Documentation

- [API Specification](/API_SPECIFICATION.md)
- [Architecture Overview](/ARCHITECTURE.md)
- [Chrome Extension](/chrome-extension/README.md)
- [Flask Backend](/README.md)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API specification
