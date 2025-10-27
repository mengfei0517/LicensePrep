from __future__ import annotations
from flask import Blueprint, jsonify, request

from agents.planner_agent import PlannerAgent

bp = Blueprint("planner", __name__, url_prefix="/api/plan")
agent = PlannerAgent()

@bp.post("")
def plan():
    data = request.get_json(silent=True) or {}
    start = data.get("start") or "Munich Test Center"
    duration = int(data.get("duration_min", PlannerAgent.DEFAULT_TARGET_MIN))

    seed_value = data.get("seed")
    seed = None
    if isinstance(seed_value, int):
        seed = seed_value
    elif isinstance(seed_value, str) and seed_value.strip().isdigit():
        seed = int(seed_value.strip())

    result = agent.plan(start=start, duration_min=duration, seed=seed)
    return jsonify(result)
