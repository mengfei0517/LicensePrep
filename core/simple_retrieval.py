"""
simple retrieval system
using keyword matching, no vector embeddings
"""
from __future__ import annotations
from typing import List, Dict, Tuple
import json
import os
import re


class SimpleRetriever:
    """simple retriever based on keywords"""
    
    def __init__(self):
        self.knowledge_base: List[Dict] = []
    
    def load_from_json(self, json_path: str = "data/metadata/content.json") -> None:
        """load knowledge base from JSON file"""
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Knowledge base not found: {json_path}")
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # parse and flatten knowledge base
        for category in data.get("categories", []):
            cat_id = category.get("id", "")
            cat_name = category.get("name", "")
            
            for subcategory in category.get("subcategories", []):
                sub_id = subcategory.get("id", "")
                sub_name = subcategory.get("name", "")
                sub_desc = subcategory.get("description", "")
                
                # extract text content
                content = subcategory.get("content", "")
                text_content = self._extract_text_content(content)
                
                # build complete searchable text
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
        """extract text from content field"""
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
        retrieve related knowledge chunks
        
        Args:
            query: query text
            k: return top k results
            
        Returns:
            list of related knowledge chunks, sorted by relevance
        """
        if not self.knowledge_base:
            return []
        
        # extract query keywords
        query_lower = query.lower()
        query_words = set(re.findall(r'\w+', query_lower))
        
        # calculate relevance score for each knowledge chunk
        scored_chunks = []
        for chunk in self.knowledge_base:
            score = self._calculate_relevance(query_lower, query_words, chunk)
            if score > 0:
                scored_chunks.append((score, chunk))
        
        # sort by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        # return top k results
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
        """calculate relevance score"""
        searchable = chunk["searchable_text"]
        score = 0.0
        
        # 1. complete query match (highest weight)
        if query in searchable:
            score += 10.0
        
        # 2. keyword match
        chunk_words = set(re.findall(r'\w+', searchable))
        matching_words = query_words & chunk_words
        score += len(matching_words) * 2.0
        
        # 3. special keyword weighted
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


# global retriever instance
_retriever = None

def get_retriever() -> SimpleRetriever:
    """get global retriever instance"""
    global _retriever
    if _retriever is None:
        _retriever = SimpleRetriever()
        try:
            _retriever.load_from_json()
        except Exception as e:
            print(f"[SimpleRetriever] Warning: Failed to load knowledge base: {e}")
    return _retriever


# test code
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

