# LicensePrep

AI 驱动的德国驾考学习与路线模拟平台（Flask 后端 + Next.js 前端 + Chrome 扩展）。

---

## 快速开始

### 1) 环境要求
- Python 3.11+
- Node.js 18+
- Google Gemini API Key（从 Google AI Studio 获取）

### 2) 环境变量
在终端设置至少以下变量：

```bash
export GOOGLE_GEMINI_API_KEY="your-gemini-api-key"   # 或使用 GOOGLE_API_KEY 兼容变量
# 可选：用于 /route-review 模板（Google 地图，仅该页面需要）
export GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 3) 一键启动（推荐）

```bash
conda activate license-prep-env  # 或 source venv/bin/activate
./start-dev.sh
```

运行后：
- 后端 API: http://localhost:5000
- 前端应用: http://localhost:3000

说明：脚本会在缺失时自动安装 `web-app` 的前端依赖，并并行启动 Flask 与 Next.js 开发服务器。

---

## 目录结构

```
LicensePrep/
├── app.py                  # Flask 后端入口
├── start-dev.sh            # 一键本地开发启动脚本（主程序）
├── requirements.txt        # 后端依赖清单
├── api/                    # Flask API 路由
├── core/                   # 后端核心（Gemini 客户端、简单检索等）
├── agents/                 # 规划/回放等智能体
├── config/                 # 设置与环境变量
├── data/                   # 学习/规则/样例/移动端上传数据
├── web/                    # Flask 模板与静态资源（路线录制/回放页面）
├── web-app/                # Next.js 前端（独立 package.json）
└── chrome-extension/       # Chrome 扩展（独立 package.json）
```

---

## 开发说明

- 后端以 Flask 提供 REST API（见 `app.py` 与 `api/`）。
- 前端以 Next.js 提供 Web 界面（见 `web-app/`）。
- Chrome 扩展使用 Chrome 内置 AI（Gemini Nano）并可回退到云端 Gemini API（见 `chrome-extension/`）。
- CORS 允许来源通过 `config/settings.py` 读取环境变量配置。

---

## 文档

- docs/API_SPECIFICATION.md（API 规范）
- docs/ARCHITECTURE.md（架构）
- docs/DEPLOYMENT_GUIDE.md（部署指南）
- docs/CHROME_API_SETUP.md（Chrome Built-in AI 说明）

---

## 故障排查

- 后端无法启动：确认已激活虚拟环境并 `pip install -r requirements.txt`，检查 `GOOGLE_GEMINI_API_KEY` 是否已设置。
- 前端无法访问后端：确认 Flask 运行在 5000 端口，并检查 CORS 配置。
- 图片或静态资源无法显示：确保 Flask 运行且 Next.js 重启过。
- 扩展不可用：确认后端已启动，必要时在扩展设置中填入自定义 API Key，并在 Chrome 扩展管理页重新加载。

---

## 许可

MIT
