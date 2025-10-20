from flask import Flask, render_template
import json
import os
from config.settings import settings

# Initialize Flask with relocated template/static folders
app = Flask(
    __name__,
    template_folder=settings.FLASK_TEMPLATE_FOLDER,
    static_folder=settings.FLASK_STATIC_FOLDER,
)

# Load structured content
CONTENT_PATH = os.path.join("data", "metadata", "content.json")
with open(CONTENT_PATH, "r", encoding="utf-8") as f:
    content = json.load(f)

@app.route("/")
def index():
    return render_template("index.html", categories=content["categories"])

@app.route("/subcategory/<category_id>/<subcategory_id>")
def subcategory(category_id, subcategory_id):
    # Find category and subcategory in memory
    category = next((c for c in content["categories"] if c["id"] == category_id), None)
    if category:
        subcat = next((s for s in category["subcategories"] if s["id"] == subcategory_id), None)
        if subcat:
            return render_template("subcategory.html", category=category, subcategory=subcat)
    return "Subcategory not found", 404

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

app.register_blueprint(bp_rule_qa)
app.register_blueprint(bp_replay)
app.register_blueprint(bp_planner)

if __name__ == "__main__":
    app.run(debug=True)
