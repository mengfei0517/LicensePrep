"""Lightweight NVIDIA NIM clients for embeddings and reasoning (with simulation mode)."""
from __future__ import annotations
from typing import List, Dict, Any
import os
import requests
import random

# ================================================================
# 🔧 Global Configuration
# ================================================================
# Set USE_SIMULATION = True to disable actual API calls (for local dev)
USE_SIMULATION = os.getenv("USE_SIMULATION", "true").lower() == "true"

NIM_LLM_ENDPOINT = os.getenv("NIM_LLM_ENDPOINT", "")
NIM_EMBEDDING_ENDPOINT = os.getenv("NIM_EMBEDDING_ENDPOINT", "")
NIM_API_KEY = os.getenv("NIM_API_KEY", "")

# ================================================================
# 🧩 Helper
# ================================================================
def _headers() -> Dict[str, str]:
    """Build standard API headers."""
    return {"Authorization": f"Bearer {NIM_API_KEY}", "Content-Type": "application/json"}

# ================================================================
# 🧠 Embedding API
# ================================================================
def embed_texts(texts: List[str]) -> List[List[float]]:
    """Get embeddings for input texts (real or simulated)."""
    if USE_SIMULATION or not NIM_EMBEDDING_ENDPOINT:
        # Fake embeddings for local dev
        print("[NIM::Sim] Using simulated embeddings (no endpoint configured).")
        return [[random.random() * 0.001 for _ in range(768)] for _ in texts]

    try:
        payload = {"texts": texts}
        resp = requests.post(NIM_EMBEDDING_ENDPOINT, json=payload, headers=_headers(), timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return data.get("embeddings", [])
    except Exception as e:
        print(f"[NIM::Error] Embedding request failed: {e}")
        return [[0.0] * 768 for _ in texts]

# ================================================================
# 💬 Chat Completion API
# ================================================================
def chat_completion(messages: List[Dict[str, str]], temperature: float = 0.2, max_tokens: int = 512) -> str:
    """
    Send a chat-style message list to the NIM LLM endpoint and return the model reply.
    When USE_SIMULATION=True, returns a fake AI answer for local debugging.
    """
    # Simulated local response
    if USE_SIMULATION or not NIM_LLM_ENDPOINT:
        user_question = ""
        for msg in messages:
            if msg.get("role") == "user":
                user_question = msg.get("content", "")
                break

        simulated_responses = [
            f"🤖 (Simulated) For your question: '{user_question[:50]}...', "
            f"the general rule is to always stay alert and follow standard driving procedures.",
            "💡 Remember: This is a development mode response. Configure NIM_LLM_ENDPOINT for real AI reasoning.",
            "✅ Simulation complete – backend communication verified successfully."
        ]
        return "\n".join(simulated_responses)

    # Real API call
    try:
        payload = {"messages": messages, "temperature": temperature, "max_tokens": max_tokens}
        resp = requests.post(NIM_LLM_ENDPOINT, json=payload, headers=_headers(), timeout=120)
        resp.raise_for_status()
        data = resp.json()
        return data.get("content") or data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        print(f"[NIM::Error] Chat completion failed: {e}")
        return f"⚠️ NIM API request failed: {e}"

# ================================================================
# 🔍 Debug Entry (for manual test)
# ================================================================
if __name__ == "__main__":
    print("=== NIM Client Debug Mode ===")
    print(f"USE_SIMULATION = {USE_SIMULATION}")
    test_messages = [
        {"role": "system", "content": "You are a driving rules assistant."},
        {"role": "user", "content": "What is the rule for overtaking on the Autobahn?"}
    ]
    reply = chat_completion(test_messages)
    print("Response:\n", reply)
