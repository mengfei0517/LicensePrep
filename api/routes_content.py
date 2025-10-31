"""
Content API Routes
Provides structured access to learning content for web and mobile clients
"""

from flask import Blueprint, jsonify
import json
import os

bp = Blueprint("content", __name__, url_prefix="/api/content")

# Load content data
CONTENT_PATH = os.path.join("data", "metadata", "content.json")
with open(CONTENT_PATH, "r", encoding="utf-8") as f:
    content_data = json.load(f)

@bp.get("/categories")
def get_categories():
    """Get all learning categories with basic info"""
    categories = [
        {
            "id": cat["id"],
            "name": cat["name"],
            "description": cat["description"],
            "image": cat["image"],
            "subcategories_count": len(cat.get("subcategories", []))
        }
        for cat in content_data.get("categories", [])
    ]
    
    return jsonify({"categories": categories})

@bp.get("/categories/<category_id>")
def get_category(category_id):
    """Get detailed category information with subcategories"""
    category = next(
        (c for c in content_data.get("categories", []) if c["id"] == category_id),
        None
    )
    
    if not category:
        return jsonify({"error": "Category not found"}), 404
    
    # Return category with subcategories (excluding full content)
    return jsonify({
        "id": category["id"],
        "name": category["name"],
        "description": category["description"],
        "image": category["image"],
        "subcategories": [
            {
                "id": sub["id"],
                "name": sub["name"],
                "description": sub.get("description", ""),
            }
            for sub in category.get("subcategories", [])
        ]
    })

@bp.get("/subcategory/<category_id>/<subcategory_id>")
def get_subcategory(category_id, subcategory_id):
    """Get specific subcategory with full content"""
    category = next(
        (c for c in content_data.get("categories", []) if c["id"] == category_id),
        None
    )
    
    if not category:
        return jsonify({"error": "Category not found"}), 404
    
    subcategory = next(
        (s for s in category.get("subcategories", []) if s["id"] == subcategory_id),
        None
    )
    
    if not subcategory:
        return jsonify({"error": "Subcategory not found"}), 404
    
    return jsonify({
        "id": subcategory["id"],
        "name": subcategory["name"],
        "description": subcategory.get("description", ""),
        "content": subcategory.get("content", []),
        "category": {
            "id": category["id"],
            "name": category["name"]
        }
    })

