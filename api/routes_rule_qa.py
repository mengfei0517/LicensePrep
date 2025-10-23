from __future__ import annotations
from flask import Blueprint, request, jsonify
from core.simple_retrieval import get_retriever
from core.gemini_client import get_gemini_client

bp = Blueprint("rule_qa", __name__, url_prefix="/api/qa")

# Initialize retriever and Gemini client
retriever = None
gemini_client = None

def get_retriever_instance():
    global retriever
    if retriever is None:
        retriever = get_retriever()
    return retriever

def get_gemini_instance():
    global gemini_client
    if gemini_client is None:
        gemini_client = get_gemini_client()
    return gemini_client

@bp.post("/retrieve_context")
def retrieve_context():
    """Retrieve relevant knowledge chunks using simple keyword matching."""
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")
    k = data.get("k", 5)
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    print(f"[RuleQA API] Retrieving context for: {query}")
    
    try:
        retriever_instance = get_retriever_instance()
        
        # Retrieve context chunks using keyword matching
        contexts = retriever_instance.retrieve(query, k=k)
        
        # Format for client
        chunks = [
            {
                "text": c.get('content', ''),
                "category": c.get('category', 'Unknown'),
                "subcategory": c.get('subcategory', 'Unknown'),
                "description": c.get('description', ''),
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
    Generate answer using Google Gemini API (cloud-based)
    
    This endpoint directly calls Google Cloud Gemini API.
    No longer dependent on Chrome local model.
    """
    data = request.get_json(silent=True) or {}
    query = data.get("query", "")
    context = data.get("context", "")
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    print(f"[RuleQA API] Generating answer using Google Gemini API for: {query}")
    
    try:
        gemini = get_gemini_instance()
        
        # Generate structured answer
        answer = gemini.generate_structured_answer(query, context, temperature=0.3)
        
        print(f"[RuleQA API] Answer generated successfully")
        return jsonify({
            "answer": answer,
            "source": "google_gemini_api",
            "api_used": "Google Gemini Pro"
        })
        
    except Exception as e:
        print(f"[RuleQA API] Gemini API error: {e}")
        return jsonify({
            "error": f"Gemini API error: {str(e)}",
            "fallback_answer": {
                "answer": f"Error calling Gemini API: {str(e)}",
                "explanation": "Please check your API key and internet connection.",
                "examples": [],
                "related_topics": []
            }
        }), 500


@bp.post("/ask")
def ask():
    """
    Handle Q&A requests from the frontend (Legacy endpoint).
    Now uses Google Gemini API.
    """
    data = request.get_json(silent=True) or {}
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "question is required"}), 400
    
    print(f"[RuleQA API] Received question: {question}")
    
    try:
        # Get relevant context
        retriever_instance = get_retriever_instance()
        contexts = retriever_instance.retrieve(question, k=5)
        
        # Format context
        context_text = "\n".join([
            f"{c.get('category')} / {c.get('subcategory')}: {c.get('content', '')[:200]}"
            for c in contexts
        ])
        
        # Generate answer using Gemini
        gemini = get_gemini_instance()
        answer = gemini.generate_content(
            f"Question: {question}\n\nContext: {context_text}\n\nProvide a clear answer based on the context above."
        )
        
        print(f"[RuleQA API] Returning answer (length: {len(answer)})")
        return jsonify({"answer": answer})
        
    except Exception as e:
        print(f"[RuleQA API] Error: {e}")
        return jsonify({"error": f"Internal error: {str(e)}"}), 500
