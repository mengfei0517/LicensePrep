"""Utility helpers used across the project."""
from __future__ import annotations
from typing import Any, Dict, List


def chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> List[str]:
    """Simple text chunker placeholder.
    This should be replaced by a tokenizer-aware splitter later.
    """
    words = text.split()
    chunks = []
    step = max(1, max_tokens - overlap)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + max_tokens])
        chunks.append(chunk)
    return chunks
