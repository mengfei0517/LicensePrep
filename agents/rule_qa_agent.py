"""
RuleQA Agent - Knowledge Retrieval Only
Designed for Chrome Built-in AI Challenge 2025

This agent ONLY handles knowledge retrieval (RAG's "R" - Retrieval).
AI generation is handled client-side using Chrome Prompt API.
"""
from __future__ import annotations
from typing import List, Dict

from core.rag_pipeline import RAGPipeline


class RuleQAgent:
    """
    Knowledge retrieval agent for German driving rules.
    
    Philosophy: Keep the backend simple - just retrieve knowledge.
    Let Chrome Prompt API handle the AI generation on the client.
    """
    
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

    def retrieve_context(self, question: str, k: int = 5) -> List[Dict]:
        """
        Retrieve relevant knowledge chunks for a question.
        
        Args:
            question: User's driving rule question
            k: Number of relevant chunks to retrieve
            
        Returns:
            List of knowledge chunks with metadata
        """
        self._ensure_initialized()
        contexts = self.rag.retrieve(question, k=k)
        
        print(f"[RuleQAgent] Retrieved {len(contexts)} context chunks for: {question}")
        return contexts
    
    def answer(self, question: str) -> str:
        """
        Legacy endpoint for backward compatibility.
        Returns plain text with retrieved context.
        
        NOTE: This is deprecated. Use retrieve_context() instead
        and let Chrome Prompt API do the generation.
        """
        self._ensure_initialized()
        contexts = self.rag.retrieve(question, k=5)
        
        if not contexts:
            return (
                "⚠️ No relevant knowledge found in the database.\n\n"
                f"Question: {question}\n\n"
                "Suggestion: Try rephrasing your question or check if the knowledge base is loaded."
            )

        # Format context for display
        context_text = "\n".join([
            f"- {c.get('category', 'Unknown')} / {c.get('subcategory', 'Unknown')} (relevance: {c.get('score', 0):.2f})"
            for c in contexts
        ])
        
        top_match = contexts[0]
        return (
            f"📚 **Knowledge Retrieved** (Use Chrome Prompt API for AI answers)\n\n"
            f"**Your question:** {question}\n\n"
            f"**Top match:** {top_match.get('category')} → {top_match.get('subcategory')}\n"
            f"**Relevance score:** {top_match.get('score', 0):.3f}\n\n"
            f"**Retrieved {len(contexts)} relevant sections:**\n{context_text}\n\n"
            f"💡 *This is raw knowledge data. For AI-generated answers, use Chrome Prompt API on the client side.*"
        )
