from __future__ import annotations
from flask import Blueprint, request, jsonify
from agents.replay_agent import ReplayAgent

bp = Blueprint("replay", __name__, url_prefix="/api/replay")
agent = ReplayAgent()

@bp.post("/analyze")
def analyze():
    # Placeholder: expect file path or uploaded file handling in future
    data = request.get_json(silent=True) or {}
    path = data.get("gpx_path", "")
    result = agent.analyze(path)
    return jsonify(result)
