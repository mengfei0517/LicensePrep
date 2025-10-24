#!/bin/bash

# LicensePrep Development Server Starter
# This script starts both Flask backend and Next.js frontend

echo "=================================="
echo "🚀 LicensePrep Development Server"
echo "=================================="

# Check if Python environment is activated
if [[ -z "$VIRTUAL_ENV" ]] && [[ -z "$CONDA_DEFAULT_ENV" ]]; then
    echo "⚠️  Warning: No Python virtual environment detected!"
    echo "Please activate your environment first:"
    echo "  conda activate license-prep-env"
    echo "  OR"
    echo "  source venv/bin/activate"
    exit 1
fi

# Check if Gemini API key is set
if [[ -z "$GOOGLE_GEMINI_API_KEY" && -z "$GOOGLE_API_KEY" ]]; then
    echo "⚠️  Warning: Google Gemini API key not set!"
    echo "Please set your API key:"
    echo "  export GOOGLE_GEMINI_API_KEY='your-api-key-here'"
    echo "  # or keep using legacy GOOGLE_API_KEY"
    exit 1
fi

echo ""
echo "✅ Environment check passed"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $FLASK_PID $NEXTJS_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Flask backend
echo "📍 Starting Flask Backend (http://localhost:5000)..."
python app.py &
FLASK_PID=$!

# Wait for Flask to start
sleep 3

# Start Next.js frontend
echo "📍 Starting Next.js Frontend (http://localhost:3000)..."
cd web-app
npm run dev &
NEXTJS_PID=$!
cd ..

echo ""
echo "=================================="
echo "✅ Servers Running!"
echo "=================================="
echo "Backend API:  http://localhost:5000"
echo "Frontend App: http://localhost:3000"
echo "=================================="
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $FLASK_PID $NEXTJS_PID
