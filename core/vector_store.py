"""Unified vector store interface with a FAISS default implementation."""
from __future__ import annotations
from typing import List, Tuple

try:
    import faiss  # type: ignore
except Exception:  # pragma: no cover
    faiss = None  # type: ignore


class VectorStore:
    def __init__(self, dim: int):
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim) if faiss else None
        self.vectors = []
        self.payloads = []

    def add(self, embeddings: List[List[float]], payloads: List[dict]) -> None:
        if not embeddings:
            return
        if self.index is None:
            self.vectors.extend(embeddings)
            self.payloads.extend(payloads)
            return
        import numpy as np

        mat = np.array(embeddings).astype("float32")
        if not self.index.is_trained:
            pass
        self.index.add(mat)
        self.payloads.extend(payloads)

    def search(self, query: List[float], k: int = 5) -> List[Tuple[float, dict]]:
        if self.index is None:
            # naive fallback search
            from numpy.linalg import norm
            import numpy as np

            if not self.vectors:
                return []
            q = np.array(query)
            sims = []
            for v, p in zip(self.vectors, self.payloads):
                v = np.array(v)
                sim = float(q @ v / (norm(q) * norm(v) + 1e-8))
                sims.append((sim, p))
            sims.sort(key=lambda x: x[0], reverse=True)
            return sims[:k]
        import numpy as np

        q = np.array([query]).astype("float32")
        scores, idxs = self.index.search(q, k)
        results = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx == -1:
                continue
            results.append((float(score), self.payloads[idx]))
        return results
