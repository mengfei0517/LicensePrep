from flask import Flask, render_template, jsonify
import os
from config.settings import settings

# Initialize Flask with relocated template/static folders
app = Flask(
    __name__,
    template_folder=settings.FLASK_TEMPLATE_FOLDER,
    static_folder=settings.FLASK_STATIC_FOLDER,
)

@app.route("/")
def index():
    """API Information and Status"""
    return jsonify({
        "name": "LicensePrep API",
        "version": "2.0",
        "status": "running",
        "description": "Backend API for LicensePrep - AI-powered German driving test preparation",
        "frontend": "http://localhost:3000",
        "endpoints": {
            "api": {
                "content": "/api/content/categories",
                "qa": "/api/qa/ask",
                "routes": "/api/routes",
                "plan": "/api/plan"
            },
            "tools": {
                "route_recorder": "/route-recorder",
                "route_review": "/route-review/<route_id>"
            },
            "static": "/static/images/"
        },
        "documentation": {
            "api_spec": "https://github.com/yourusername/LicensePrep/blob/main/docs/API_SPECIFICATION.md",
            "architecture": "https://github.com/yourusername/LicensePrep/blob/main/docs/ARCHITECTURE.md"
        },
        "message": "This is a backend API server. Please visit http://localhost:3000 for the web application."
    })

@app.route("/route-recorder")
def route_recorder():
    """GPS Route Recorder page (Using OpenStreetMap)"""
    return render_template("route_recorder.html")

@app.route("/route-review/<route_id>")
def route_review(route_id):
    """Route Review and Replay page"""
    return render_template("route_review.html", route_id=route_id)

# Register API blueprints
from api.routes_rule_qa import bp as bp_rule_qa
from api.routes_replay import bp as bp_replay
from api.routes_planner import bp as bp_planner
from api.routes_content import bp as bp_content
from api.routes_mobile import bp as bp_mobile
from api.routes_analysis import bp as bp_analysis

app.register_blueprint(bp_rule_qa)
app.register_blueprint(bp_replay)
app.register_blueprint(bp_planner)
app.register_blueprint(bp_content)
app.register_blueprint(bp_mobile)
app.register_blueprint(bp_analysis)

# Enable CORS for Next.js frontend
from flask_cors import CORS
CORS(app, origins=settings.CORS_ALLOWED_ORIGINS, supports_credentials=True)

if __name__ == "__main__":
    # Bind to 0.0.0.0 to allow both localhost and 127.0.0.1 access
    # Chrome Prompt API requires Secure Context - use localhost for testing
    print("\n" + "="*60)
    print("🚀 LicensePrep Server Starting...")
    print("="*60)
    backend_host = settings.FLASK_HOST
    backend_port = settings.FLASK_PORT
    print(f"📍 Backend API: http://{backend_host}:{backend_port}/")
    print("📍 Next.js App: http://localhost:3000/")
    print("⚠️  For Chrome Extension, MUST use 'localhost' not '127.0.0.1'")
    print(f"🌐 Allowed Origins: {', '.join(settings.CORS_ALLOWED_ORIGINS)}")
    print("="*60 + "\n")
    app.run(host=backend_host, port=backend_port, debug=True)
