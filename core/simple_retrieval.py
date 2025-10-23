"""
简单的知识检索系统
使用关键词匹配，不需要向量 embeddings
"""
from __future__ import annotations
from typing import List, Dict, Tuple
import json
import os
import re


class SimpleRetriever:
    """基于关键词的简单检索器"""
    
    def __init__(self):
        self.knowledge_base: List[Dict] = []
    
    def load_from_json(self, json_path: str = "data/metadata/content.json") -> None:
        """从 JSON 文件加载知识库"""
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Knowledge base not found: {json_path}")
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # 解析并扁平化知识库
        for category in data.get("categories", []):
            cat_id = category.get("id", "")
            cat_name = category.get("name", "")
            
            for subcategory in category.get("subcategories", []):
                sub_id = subcategory.get("id", "")
                sub_name = subcategory.get("name", "")
                sub_desc = subcategory.get("description", "")
                
                # 提取文本内容
                content = subcategory.get("content", "")
                text_content = self._extract_text_content(content)
                
                # 构建完整的可搜索文本
                full_text = f"{cat_name} {sub_name} {sub_desc} {text_content}"
                
                self.knowledge_base.append({
                    "category_id": cat_id,
                    "category": cat_name,
                    "subcategory_id": sub_id,
                    "subcategory": sub_name,
                    "description": sub_desc,
                    "content": text_content,
                    "searchable_text": full_text.lower(),
                    "full_text": full_text
                })
        
        print(f"[SimpleRetriever] Loaded {len(self.knowledge_base)} knowledge chunks")
    
    def _extract_text_content(self, content) -> str:
        """从 content 字段提取文本"""
        if isinstance(content, str):
            return content
        elif isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    if item.get("type") == "text":
                        text_parts.append(item.get("content", ""))
                    elif item.get("type") == "list":
                        items = item.get("items", [])
                        text_parts.append(" ".join(items))
            return "\n".join(text_parts)
        return ""
    
    def retrieve(self, query: str, k: int = 5) -> List[Dict]:
        """
        检索相关的知识块
        
        Args:
            query: 查询文本
            k: 返回前 k 个结果
            
        Returns:
            相关知识块列表，按相关性排序
        """
        if not self.knowledge_base:
            return []
        
        # 提取查询关键词
        query_lower = query.lower()
        query_words = set(re.findall(r'\w+', query_lower))
        
        # 计算每个知识块的相关性得分
        scored_chunks = []
        for chunk in self.knowledge_base:
            score = self._calculate_relevance(query_lower, query_words, chunk)
            if score > 0:
                scored_chunks.append((score, chunk))
        
        # 按得分排序
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        # 返回前 k 个结果
        results = []
        for score, chunk in scored_chunks[:k]:
            results.append({
                "category": chunk["category"],
                "subcategory": chunk["subcategory"],
                "description": chunk["description"],
                "content": chunk["content"],
                "score": score,
                "category_id": chunk["category_id"],
                "subcategory_id": chunk["subcategory_id"]
            })
        
        return results
    
    def _calculate_relevance(self, query: str, query_words: set, chunk: Dict) -> float:
        """计算相关性得分"""
        searchable = chunk["searchable_text"]
        score = 0.0
        
        # 1. 完整查询匹配（最高权重）
        if query in searchable:
            score += 10.0
        
        # 2. 关键词匹配
        chunk_words = set(re.findall(r'\w+', searchable))
        matching_words = query_words & chunk_words
        score += len(matching_words) * 2.0
        
        # 3. 特殊关键词加权
        important_terms = {
            'autobahn': 5.0,
            'highway': 5.0,
            'parking': 4.0,
            'einparken': 4.0,
            '30': 3.0,
            'zone': 3.0,
            'speed': 3.0,
            'limit': 3.0,
            'geschwindigkeit': 3.0
        }
        
        for term, weight in important_terms.items():
            if term in query.lower() and term in searchable:
                score += weight
        
        return score


# 全局检索器实例
_retriever = None

def get_retriever() -> SimpleRetriever:
    """获取全局检索器实例"""
    global _retriever
    if _retriever is None:
        _retriever = SimpleRetriever()
        try:
            _retriever.load_from_json()
        except Exception as e:
            print(f"[SimpleRetriever] Warning: Failed to load knowledge base: {e}")
    return _retriever


# 测试代码
if __name__ == "__main__":
    print("🧪 Testing Simple Retriever\n")
    
    retriever = SimpleRetriever()
    retriever.load_from_json()
    
    test_queries = [
        "what is the rule in autobahn",
        "parallel parking",
        "30 zone speed limit",
        "reverse parking"
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        print("-" * 60)
        results = retriever.retrieve(query, k=3)
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"  {i}. {result['category']} / {result['subcategory']}")
                print(f"     Score: {result['score']:.1f}")
        else:
            print("  No results found")

