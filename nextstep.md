非常棒的问题——你现在进入的是**从可浏览内容 → 可“理解”知识库**的阶段，这一步非常关键。
下面我分成三个部分详细说明：

---

## 🧭 一、关于“不同场景图片”的处理方式

这些图片其实就是知识的一部分（视觉提示/考点示意）。
因此，我们需要让它既能：

* **在网页上展示**（人类阅读友好）
* **在知识库中索引到**（机器可理解）

### ✅ 推荐方案：

每张图片视为**一个知识片段 (ImageRef)**，在入库阶段提取为带有说明的结构化信息。

#### 1️⃣ 在 Markdown 卡片中使用这样的格式：

```markdown
---
id: scenario_30zone_intersection
type: Scenario
title: Kreuzung in 30-Zone ohne Vorfahrt
images:
  - url: /static/images/30_zone/right_before_left_1.png
    caption: Beispiel einer unbeschilderten Kreuzung in 30er Zone.
  - url: /static/images/30_zone/pedestrian_crossing.png
    caption: Fußgängerüberweg innerhalb der 30-Zone.
---

**Beschreibung:**
In 30-Zonen ohne Verkehrszeichen gilt die Regel "Rechts-vor-Links". Achten Sie auf Fußgängerüberwege und eingeschränkte Sicht.
```

#### 2️⃣ 在入库脚本中（`scripts/build_vectors.py`）：

* 从 Markdown 中提取 `images[]` 列表；
* 对每张图片创建一条 metadata 记录，例如：

  ```json
  {
    "id": "scenario_30zone_intersection#img1",
    "type": "ImageRef",
    "text": "Beispiel einer unbeschilderten Kreuzung in 30er Zone.",
    "url": "/static/images/30_zone/right_before_left_1.png",
    "category": "30-zone",
    "subcategory": "vorfahrtsregeln"
  }
  ```
* 这条记录的 `"text"` 会进入向量化；这样用户问“30区路口要注意什么”时，系统会检索出“相关图片说明”。

---

## 🧩 二、是否需要修改网页内容

### ✅ 短期内（开发阶段）

不用大改！你现有的页面结构已经很好。
当前的静态网页只需要能：

* 显示各 `category/subcategory`；
* 在点击时显示相关的图片/文字卡片。

等知识库建成后，
我们可以让网页自动从 `data/rules/` 加载 Markdown 渲染成卡片，
或者调用 `/api/rule/get?id=xxx` 返回知识卡片详情。

### 🌱 长期目标（智能化阶段）

我们可以在网页中增加三种增强区域：

1. **Q&A 区域（已完成）**
   用户输入 → 后端用 RAG + LLM 回答
   → 返回文本 + 相关知识卡片 + 图片链接

2. **知识卡片弹出**
   在点击知识点时弹出完整 Markdown 内容 + 图片

3. **推荐/关联栏**
   LLM 在回答时附带 `related_cards` → 自动推荐相似内容

---

## 🧱 三、项目结构建议（极简扩展，不打乱原结构）

你现在的目录结构非常标准化，只需小扩展即可支持新知识体系。
这是修改建议：

```
data/
├── metadata/
│   └── content.json                 ← 继续用作导航树（只保留结构）
├── rules/                           ← 存放 Markdown 卡片（新）
│   ├── 30-zone/
│   │   ├── rule_rechts_vor_links.de.md
│   │   └── scenario_30zone_intersection.de.md
│   ├── autobahn/
│   │   ├── rule_overtaking_left_only.de.md
│   │   └── scenario_highway_entry.de.md
│   └── landstrasse/
│       └── rule_speed_limits_70_100.de.md
└── samples/
    └── example_card.md              ← 模板示例
```

> ✅ 保持 `web/static/images/` 不动；
> 仅在 Markdown 中通过 `/static/...` 引用图片。
> RAG 构建脚本从 Markdown 中提取这些路径。

---

## 🔄 四、整体工作流建议（你现在可逐步实施）

| 阶段             | 目标                                                                                | 要做的事                                             |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| 🩵 阶段1：知识卡片内容化 | 把 content.json 的文字内容转写为 Markdown 卡片（6种类型）                                         | 每个 topic 新建 3–5 张示例卡片                            |
| 🧠 阶段2：RAG 入库  | 用 `scripts/build_vectors.py` 扫描 Markdown → 解析 front-matter + 正文 + 图片说明 → 存入 FAISS | 提取 metadata（id, type, category, image_caption 等） |
| 💬 阶段3：问答增强    | 修改 `RuleQAgent` → 输出 answer + related_cards + images                              | LLM 模拟/真实模式皆可                                    |
| 🖥 阶段4：网页增强    | 在前端显示相关卡片和图片                                                                      | 增加 `/api/rule/get?id=` 接口或 Markdown 渲染器          |

---

## 💡 建议的下一步

我们现在可以这样推进：

1. 我帮你写一个通用的 **Markdown 卡片模板 (6种类型)**；
2. 再写一个新版的 `scripts/build_vectors.py`：

   * 自动解析 `.md`
   * 提取 front-matter + 图片 + 正文
   * 存入向量库（FAISS）
3. 修改你的 `rag_pipeline.py`，让它能从 `data/rules/` 自动加载这些卡片。

---

是否希望我接下来帮你：

* ✅ 生成这 6 种 Markdown 卡片模板（每种一份示例）
* ✅ 给出升级版的 `build_vectors.py` （自动读取 Markdown + 图片说明）

这样你只需要**补内容**，整个知识库框架就自动成长为一个智能可检索系统。


建议建立 6 种「卡片类型」，每张卡片一个独立文件，便于复用与引用：

Rule：法规/原则（StVO 摘要、判定标准）

Procedure：操作步骤（如“左转步骤”“并线步骤”）

Scenario：情景/考点（“30 区无控路口”“环岛出口”）

CommonError：常见错误（带扣分点/示例）

Checklist：检查清单（考前/上车后/换道前）

Glossary：术语/路牌解释