#!/usr/bin/env bash
set -euo pipefail
export PYTHONUNBUFFERED=1
# Load .env if present
if [ -f .env ]; then set -a; source .env; set +a; fi
# Install deps if needed (optional)
# pip install -r requirements.txt
python app.py
