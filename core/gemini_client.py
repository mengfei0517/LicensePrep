"""
Google Gemini API Client
使用 Google Cloud 的 Gemini API 进行 AI 生成
"""
from __future__ import annotations
import requests
from typing import List, Dict, Any
from config.settings import settings


class GeminiClient:
    """Google Gemini API 客户端"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GOOGLE_GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        # 使用最新的稳定版本 (根据诊断结果)
        # gemini-2.5-flash: 最新版本，速度快，免费额度高
        # gemini-flash-latest: 始终指向最新的 flash 版本
        self.model = "gemini-2.5-flash"
    
    def generate_content(self, prompt: str, temperature: float = 0.3) -> str:
        """
        调用 Gemini API 生成内容
        
        Args:
            prompt: 输入的提示词
            temperature: 温度参数 (0.0-1.0)
            
        Returns:
            生成的文本内容
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
            
            # 详细的错误信息
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
            
            # 解析响应
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
        生成结构化的答案（用于 Q&A）
        
        Args:
            question: 用户问题
            context: 知识库上下文
            temperature: 温度参数
            
        Returns:
            结构化的答案字典
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
        
        # 尝试解析 JSON
        import json
        try:
            # 提取 JSON 部分
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # 如果没有 JSON，返回简单结构
                return {
                    "answer": response_text,
                    "explanation": "",
                    "examples": [],
                    "related_topics": []
                }
        except json.JSONDecodeError:
            # JSON 解析失败，返回原始文本
            return {
                "answer": response_text,
                "explanation": "",
                "examples": [],
                "related_topics": []
            }


# 全局客户端实例
_gemini_client = None

def get_gemini_client() -> GeminiClient:
    """获取全局 Gemini 客户端实例"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client


# 测试代码
if __name__ == "__main__":
    print("🧪 Testing Google Gemini API\n")
    
    client = GeminiClient()
    
    # 测试基本生成
    print("Test 1: Basic generation")
    response = client.generate_content("What is the speed limit on German Autobahn?")
    print(f"Response: {response[:200]}...\n")
    
    # 测试结构化答案
    print("Test 2: Structured answer")
    context = "On the Autobahn, there is generally no speed limit, but a recommended speed of 130 km/h."
    answer = client.generate_structured_answer(
        "What is the speed limit on Autobahn?",
        context
    )
    print(f"Structured answer: {answer}")

