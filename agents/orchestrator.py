"""Simple orchestrator placeholder (to replace with LangGraph)."""
from __future__ import annotations

from .rule_qa_agent import RuleQAgent
from .replay_agent import ReplayAgent
from .planner_agent import PlannerAgent


class Orchestrator:
    def __init__(self):
        self.rule = RuleQAgent()
        self.replay = ReplayAgent()
        self.planr = PlannerAgent()
