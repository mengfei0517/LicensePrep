from __future__ import annotations
from flask import Blueprint, request, jsonify
from agents.planner_agent import PlannerAgent

bp = Blueprint("planner", __name__, url_prefix="/api/plan")
agent = PlannerAgent()

@bp.post("")
def plan():
    data = request.get_json(silent=True) or {}
    start = data.get("start", "Test Center")
    duration = int(data.get("duration_min", 45))
    result = agent.plan(start=start, duration_min=duration)
    return jsonify(result)
