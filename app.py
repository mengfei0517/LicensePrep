from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# 加载内容数据
with open('data/content.json', 'r', encoding='utf-8') as f:
    content = json.load(f)

@app.route('/')
def index():
    return render_template('index.html', categories=content['categories'])

@app.route('/subcategory/<category_id>/<subcategory_id>')
def subcategory(category_id, subcategory_id):
    # 查找对应的类别和子类别
    category = next((c for c in content['categories'] if c['id'] == category_id), None)
    if category:
        subcategory = next((s for s in category['subcategories'] if s['id'] == subcategory_id), None)
        if subcategory:
            return render_template('subcategory.html', category=category, subcategory=subcategory)
    return "Subcategory not found", 404

if __name__ == '__main__':
    app.run(debug=True)
