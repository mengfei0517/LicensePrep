from __future__ import annotations
from flask import Blueprint, request, jsonify
from agents.rule_qa_agent import RuleQAgent

bp = Blueprint("rule_qa", __name__, url_prefix="/api/qa")

# Initialize agent (will lazy-load RAG on first use)
agent = None

def get_agent():
    global agent
    if agent is None:
        agent = RuleQAgent()
    return agent

@bp.post("/ask")
def ask():
    """Handle Q&A requests from the frontend."""
    data = request.get_json(silent=True) or {}
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "question is required"}), 400
    
    print(f"[RuleQA API] Received question: {question}")
    
    try:
        agent_instance = get_agent()
        answer = agent_instance.answer(question)
        print(f"[RuleQA API] Returning answer (length: {len(answer)})")
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"[RuleQA API] Error: {e}")
        return jsonify({"error": f"Internal error: {str(e)}"}), 500
