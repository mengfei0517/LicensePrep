"""Build local FAISS index from data/metadata/content.json using RAGPipeline."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from core.rag_pipeline import RAGPipeline

if __name__ == "__main__":
    rag = RAGPipeline()
    rag.ingest_rules_from_json()
    print("Vector store built in-memory (FAISS). Persisting will be added later.")
