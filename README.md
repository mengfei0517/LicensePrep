# 🚗 LicensePrep Agent - Knowledge Hub

The **LicensePrep Agent** is an Agentic AI application focused on German driving test preparation. This phase ships the foundational Knowledge Hub with a clean structure to scale into multi-agent (Rule QA, Replay, Planner) and NVIDIA NIM + AWS deployments.

## 📁 Repository Structure

```
LicensePrep/
├── app.py                        # Web entry (Flask)
│
├── data/                         # Rules and practice raw data
│   ├── rules/                    # txt/pdf/web pages
│   ├── samples/                  # GPS tracks, screenshots, examples
│   └── metadata/                 # rule tags, exam mapping, content.json
│
├── core/                         # Core logic (RAG + service facades)
│   ├── rag_pipeline.py           # Ingestion & retrieval (Embedding + VectorStore)
│   ├── vector_store.py           # Unified FAISS/pgvector abstraction
│   ├── nim_client.py             # NVIDIA NIM clients (embedding + reasoning)
│   └── utils.py                  # Shared utilities
│
├── agents/                       # Agents (decoupled from core)
│   ├── rule_qa_agent.py          # Rule QA
│   ├── replay_agent.py           # Practice replay
│   ├── planner_agent.py          # Route planner
│   ├── orchestrator.py           # Orchestration (LangGraph placeholder)
│   └── prompts/                  # Prompt templates
│
├── web/                          # Web frontend assets
│   ├── templates/                # Jinja2 templates
│   └── static/                   # CSS/JS/images
│
├── api/                          # REST API layer
│   ├── routes_rule_qa.py
│   ├── routes_replay.py
│   └── routes_planner.py
│
├── config/                       # Settings
│   └── settings.py
│
├── scripts/                      # Build, run, deploy scripts
│   ├── build_vectors.py
│   ├── run_local.sh
│   └── deploy_sagemaker.py
│
├── requirements.txt
└── README.md
```

## 🛠️ Setup

```bash
# (Recommended) Create environment
conda create -n license-prep-env python=3.11 -y
conda activate license-prep-env

# Install dependencies
pip install -r requirements.txt

# Optional: configure .env
cat > .env <<EOF
NIM_LLM_ENDPOINT=
NIM_EMBEDDING_ENDPOINT=
NIM_API_KEY=
AWS_REGION=eu-central-1
S3_BUCKET=
VECTOR_STORE_BACKEND=faiss
EOF
```

## ▶️ Run

```bash
# Build vectors (in-memory placeholder)
python scripts/build_vectors.py

# Start web app
python app.py
# or
./scripts/run_local.sh
```

Open http://127.0.0.1:5000/ to browse categories and subcategories.

## 🔌 API

### Rule Q&A
- **POST** `/api/qa/ask`
  ```json
  {"question": "在30区无信号灯路口需要让谁？"}
  ```
  Response:
  ```json
  {"answer": "🤖 Development Mode (NIM not configured)..."}
  ```

### Practice Replay (placeholder)
- **POST** `/api/replay/analyze`
  ```json
  {"gpx_path": "/path/to/track.gpx"}
  ```

### Route Planner (placeholder)
- **POST** `/api/plan`
  ```json
  {"start": "Test Center", "duration_min": 45}
  ```

## 🧪 Testing

```bash
# Test API manually
./test_qa_api.sh

# Or use curl directly
curl -X POST http://127.0.0.1:5000/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the speed limit in 30 zone?"}'
```

## 🌩️ Next Steps
- Replace in-memory FAISS with persisted store
- Integrate real NVIDIA NIM endpoints for embeddings and LLM
- Add Streamlit dashboard for hackathon demo
- Add tests and CI


建议建立 6 种「卡片类型」，每张卡片一个独立文件，便于复用与引用：

Rule：法规/原则（StVO 摘要、判定标准）

Procedure：操作步骤（如“左转步骤”“并线步骤”）

Scenario：情景/考点（“30 区无控路口”“环岛出口”）

CommonError：常见错误（带扣分点/示例）

Checklist：检查清单（考前/上车后/换道前）

Glossary：术语/路牌解释