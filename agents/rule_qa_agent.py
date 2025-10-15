"""RuleQA Agent using RAG + LLM."""
from __future__ import annotations
from typing import List, Dict
import os

from core.rag_pipeline import RAGPipeline
from core.nim_client import chat_completion


class RuleQAgent:
    def __init__(self, rag: RAGPipeline | None = None):
        self.rag = rag or RAGPipeline()
        self._is_initialized = False

    def _ensure_initialized(self):
        """Lazy-load the knowledge base on first use."""
        if not self._is_initialized:
            print("[RuleQAgent] Initializing knowledge base...")
            try:
                self.rag.ingest_rules_from_json()
                print("[RuleQAgent] Knowledge base loaded successfully!")
                self._is_initialized = True
            except Exception as e:
                print(f"[RuleQAgent] Warning: Failed to load knowledge base: {e}")
                self._is_initialized = False

    def answer(self, question: str) -> str:
        """Answer a driving rule question using RAG + LLM."""
        self._ensure_initialized()
        
        # Retrieve relevant contexts from knowledge base
        contexts = self.rag.retrieve(question, k=5)
        
        if not contexts:
            lower_q = question.lower()
            if "30" in lower_q or "zone" in lower_q:
                simulated = "In a 30 Zone (Tempo-30 area), you must give way to the right at uncontrolled intersections and keep below 30 km/h."
            elif "autobahn" in lower_q or "highway" in lower_q:
                simulated = "On the Autobahn, keep right except when overtaking; the recommended speed is 130 km/h."
            elif "landstraße" in lower_q or "country road" in lower_q:
                simulated = "On a Landstraße, the general speed limit for cars is 100 km/h; watch for curves and wildlife."
            else:
                simulated = "I couldn’t find an exact rule, but always follow the StVO: observe signs, speed limits, and right-before-left."

            return f"🤖 **Simulated answer:** {simulated}"

        # Format context for display
        context_text = "\n".join([
            f"- {c.get('category', 'Unknown')} / {c.get('subcategory', 'Unknown')} (relevance: {c.get('score', 0):.2f})"
            for c in contexts
        ])
        
        # Check if NIM endpoint is configured
        nim_endpoint = os.getenv("NIM_LLM_ENDPOINT", "")
        
        if nim_endpoint:
            # Use real LLM via NIM
            messages = [
                {"role": "system", "content": "You are a helpful driving exam rule assistant for Germany. Answer questions clearly and concisely based on the provided context."},
                {"role": "user", "content": f"Question: {question}\n\nRelevant knowledge:\n{context_text}\n\nPlease provide a clear answer."},
            ]
            try:
                return chat_completion(messages)
            except Exception as e:
                return f"⚠️ LLM error: {str(e)}\n\nRetrieved context:\n{context_text}"
        else:
            # Development mode: return simulated answer with retrieved context
            top_match = contexts[0]
            return (
                f"🤖 **Development Mode** (NIM not configured)\n\n"
                f"**Your question:** {question}\n\n"
                f"**Top match:** {top_match.get('category')} → {top_match.get('subcategory')}\n"
                f"**Relevance score:** {top_match.get('score', 0):.3f}\n\n"
                f"**Retrieved {len(contexts)} relevant sections:**\n{context_text}\n\n"
                f"💡 *To get AI-generated answers, configure NIM_LLM_ENDPOINT in your .env file.*"
            )
