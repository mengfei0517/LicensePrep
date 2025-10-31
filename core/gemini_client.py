"""
Google Gemini API Client
using Google Cloud Gemini API for AI generation
"""
from __future__ import annotations
import requests
from typing import List, Dict, Any
from config.settings import settings


class GeminiClient:
    """Google Gemini API client"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GOOGLE_GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        # use the latest stable version (based on diagnosis results)
        # gemini-2.5-flash: latest version, fast, high free额度
        # gemini-flash-latest: always point to the latest flash version
        self.model = "gemini-2.5-flash"
    
    def generate_content(self, prompt: str, temperature: float = 0.3) -> str:
        """
        call Gemini API to generate content
        
        Args:
            prompt: input prompt
            temperature: temperature parameter (0.0-1.0)
            
        Returns:
            generated text content
        """
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": temperature,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        try:
            print(f"[Gemini API] Calling: {self.model}")
            print(f"[Gemini API] URL: {url[:80]}...")
            
            response = requests.post(url, json=payload, timeout=30)
            
            # detailed error information
            if response.status_code != 200:
                error_detail = f"Status: {response.status_code}"
                try:
                    error_data = response.json()
                    if "error" in error_data:
                        error_detail += f"\nError: {error_data['error'].get('message', 'Unknown error')}"
                        error_detail += f"\nStatus: {error_data['error'].get('status', 'Unknown')}"
                except:
                    error_detail += f"\nResponse: {response.text[:200]}"
                
                print(f"[Gemini API] Error details: {error_detail}")
                return f"API Error: {error_detail}"
            
            response.raise_for_status()
            data = response.json()
            
            # parse response
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        print(f"[Gemini API] ✅ Success")
                        return parts[0]["text"]
            
            print(f"[Gemini API] Warning: No content in response")
            return "Error: No content generated"
            
        except requests.exceptions.RequestException as e:
            print(f"[Gemini API] Request error: {e}")
            return f"API Error: {str(e)}"
        except Exception as e:
            print(f"[Gemini API] Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return f"Error: {str(e)}"
    
    def generate_structured_answer(
        self, 
        question: str, 
        context: str,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        generate structured answer (for Q&A)
        
        Args:
            question: user question
            context: knowledge base context
            temperature: temperature parameter
            
        Returns:
            structured answer dictionary
        """
        prompt = f"""You are an authoritative German driving instructor. Answer the user's question based on the knowledge context provided below.

=== Knowledge Context ===
{context}
========================

User Question: {question}

Please provide a structured answer in JSON format with the following fields:
- "answer": A concise and clear answer (2-3 sentences)
- "explanation": Detailed explanation (optional)
- "examples": Array of practical examples (optional)
- "related_topics": Array of related topics (optional)

Return ONLY valid JSON, no additional text."""

        response_text = self.generate_content(prompt, temperature)
        
        # try to parse JSON
        import json
        try:
            # extract JSON part
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # if no JSON, return simple structure
                return {
                    "answer": response_text,
                    "explanation": "",
                    "examples": [],
                    "related_topics": []
                }
        except json.JSONDecodeError:
            # JSON parse failed, return original text
            return {
                "answer": response_text,
                "explanation": "",
                "examples": [],
                "related_topics": []
            }


# global client instance
_gemini_client = None

def get_gemini_client() -> GeminiClient:
    """get global Gemini client instance"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client


# test code
if __name__ == "__main__":
    print("🧪 Testing Google Gemini API\n")
    
    client = GeminiClient()
    
    # test basic generation
    print("Test 1: Basic generation")
    response = client.generate_content("What is the speed limit on German Autobahn?")
    print(f"Response: {response[:200]}...\n")
    
    # test structured answer
    print("Test 2: Structured answer")
    context = "On the Autobahn, there is generally no speed limit, but a recommended speed of 130 km/h."
    answer = client.generate_structured_answer(
        "What is the speed limit on Autobahn?",
        context
    )
    print(f"Structured answer: {answer}")

