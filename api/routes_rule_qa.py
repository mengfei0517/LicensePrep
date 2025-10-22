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

@bp.post("/retrieve_context")
def retrieve_context():
    """Retrieve relevant knowledge chunks for RAG (F1.1 - Step 1)."""
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")
    k = data.get("k", 5)
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    print(f"[RuleQA API] Retrieving context for: {query}")
    
    try:
        agent_instance = get_agent()
        agent_instance._ensure_initialized()
        
        # Retrieve context chunks
        contexts = agent_instance.rag.retrieve(query, k=k)
        
        # Format for client
        chunks = [
            {
                "text": f"{c.get('category', 'Unknown')} / {c.get('subcategory', 'Unknown')}",
                "category": c.get('category', 'Unknown'),
                "subcategory": c.get('subcategory', 'Unknown'),
                "score": c.get('score', 0.0)
            }
            for c in contexts
        ]
        
        print(f"[RuleQA API] Returning {len(chunks)} context chunks")
        return jsonify({"chunks": chunks, "count": len(chunks)})
        
    except Exception as e:
        print(f"[RuleQA API] Context retrieval error: {e}")
        return jsonify({"error": f"Internal error: {str(e)}"}), 500


@bp.post("/generate")
def generate():
    """
    Fallback endpoint for when Chrome Prompt API is unavailable.
    
    NOTE: This is a development fallback only. Production apps should
    use Chrome Prompt API for AI generation.
    
    Returns simulated structured answer based on retrieved knowledge.
    """
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")
    context = data.get("context", "")
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    print(f"[RuleQA API] Fallback generation requested for: {query}")
    print(f"[RuleQA API] ⚠️ Chrome Prompt API should be used instead!")
    
    # Return simulated structured answer for development/testing
    return jsonify({
        "answer": {
            "answer": f"⚠️ Fallback Mode: Chrome Prompt API is not available. This is a simulated response.",
            "explanation": (
                "To get AI-generated answers, please:\n"
                "1. Use Chrome Dev/Canary browser\n"
                "2. Enable chrome://flags/#prompt-api-for-gemini-nano\n"
                "3. Enable chrome://flags/#optimization-guide-on-device-model\n"
                "4. Restart Chrome and wait for Gemini Nano model to download\n"
                "5. Access via http://localhost:5000/"
            ),
            "examples": [
                "Example: Check the status indicator at top-right of the page",
                "Example: Run checkPromptAPI() in browser console for diagnostics"
            ],
            "related_topics": [
                "Chrome Built-in AI Challenge 2025",
                "Gemini Nano Model",
                "Client-side AI"
            ]
        },
        "source": "fallback",
        "chrome_api_available": False,
        "retrieved_context": context[:200] + "..." if len(context) > 200 else context
    })


@bp.post("/ask")
def ask():
    """Handle Q&A requests from the frontend (Legacy endpoint)."""
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
