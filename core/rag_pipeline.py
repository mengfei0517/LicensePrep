"""RAG ingest and retrieval pipeline."""
from __future__ import annotations
from typing import List, Dict
import json
import os

from .vector_store import VectorStore
from .nim_client import embed_texts
from .utils import chunk_text


class RAGPipeline:
    def __init__(self, dim: int = 768):
        self.store = VectorStore(dim=dim)

    def ingest_rules_from_json(self, json_path: str = "data/metadata/content.json") -> None:
        if not os.path.exists(json_path):
            raise FileNotFoundError(json_path)
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        payloads: List[Dict] = []
        texts: List[str] = []
        for cat in data.get("categories", []):
            for sub in cat.get("subcategories", []):
                text = sub.get("content", "")
                for chunk in chunk_text(text):
                    texts.append(chunk)
                    payloads.append({
                        "category_id": cat.get("id"),
                        "category": cat.get("name"),
                        "subcategory_id": sub.get("id"),
                        "subcategory": sub.get("name"),
                    })
        if not texts:
            return
        embeddings = embed_texts(texts)
        self.store.add(embeddings, payloads)

    def retrieve(self, query: str, k: int = 5) -> List[Dict]:
        query_emb = embed_texts([query])[0]
        results = self.store.search(query_emb, k=k)
        return [
            {"score": score, **payload}
            for score, payload in results
        ]
