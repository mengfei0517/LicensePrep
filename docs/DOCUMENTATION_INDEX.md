# LicensePrep Documentation Index

Complete guide to all documentation files in the project.

---

## 📚 Core Documentation (Project Root)

### 1. `README.md` ⭐ **最重要**
**位置**: `/README.md` (项目根目录)

**作用**:
- 项目主页和入口文档
- 快速开始指南
- 架构概览
- 功能特性介绍
- 技术栈说明

**目标读者**: 所有人（开发者、评审、用户）

**内容**:
```
├─ Project Overview
├─ Architecture Diagram
├─ Features List
├─ Quick Start (Backend + Frontend + Extension)
├─ Tech Stack
├─ Troubleshooting
└─ Contributing Guidelines
```

---

### 2. `API_SPECIFICATION.md` 📡 **API规范**
**位置**: `/docs/API_SPECIFICATION.md`

**作用**:
- 完整的REST API接口文档
- 请求/响应格式定义
- TypeScript类型接口
- 错误处理规范
- CORS配置说明

**目标读者**: 前端开发者（Next.js, Mobile）

**内容**:
```
├─ Base URL & Authentication
├─ Content & Categories API
│  ├─ GET /api/content/categories
│  ├─ GET /api/content/categories/:id
│  └─ GET /api/content/subcategory/:categoryId/:subcategoryId
├─ Q&A API
│  ├─ POST /api/qa/ask
│  ├─ POST /api/qa/retrieve_context
│  └─ POST /api/qa/generate
├─ Route Planning API
├─ Route Recording & Replay API
├─ User Progress API (Firebase-ready)
├─ Error Handling
├─ Rate Limiting
└─ CORS Configuration
```

**何时使用**:
- ✅ 开发前端功能时参考API格式
- ✅ 实现新API端点时保持一致性
- ✅ 排查前后端对接问题
- ✅ 为Mobile App开发准备

---

### 3. `DEPLOYMENT_GUIDE.md` 🚀 **部署指南**
**位置**: `/docs/DEPLOYMENT_GUIDE.md`

**作用**:
- 完整的生产部署流程
- 多平台部署方案
- 环境配置说明
- Firebase设置步骤
- 安全检查清单

**目标读者**: DevOps, 项目部署者

**内容**:
```
├─ Prerequisites (API Keys, Accounts)
├─ Flask Backend Deployment
│  ├─ AWS EC2
│  ├─ Docker
│  └─ Railway/Render/Fly.io
├─ Next.js Web App Deployment
│  ├─ Vercel (推荐)
│  ├─ Netlify
│  └─ Docker
├─ Chrome Extension Publishing
│  ├─ Build & Package
│  ├─ Chrome Web Store Submission
│  └─ Distribution Options
├─ Mobile App Deployment (Future)
│  ├─ iOS App Store
│  └─ Android Google Play
├─ Firebase Setup
│  ├─ Authentication
│  ├─ Firestore
│  └─ Storage
├─ Security Checklist
├─ Monitoring & Analytics
├─ Scaling Considerations
└─ Deployment Checklist
```

**何时使用**:
- ✅ Hackathon提交前部署演示版本
- ✅ 生产环境上线
- ✅ CI/CD配置
- ✅ 性能优化和扩展

---

### 4. `ARCHITECTURE.md` 🏗️ **架构设计**
**位置**: `/docs/ARCHITECTURE.md`

**作用**:
- 系统架构图
- 技术栈选型理由
- 组件交互流程
- 数据流设计
- 未来扩展规划

**目标读者**: 技术评审、开发者

**内容**:
```
├─ Hybrid AI Architecture Overview
├─ Chrome Extension Design
├─ Web App (Next.js) Structure
├─ Mobile App (React Native) Plan
├─ Flask Backend Architecture
├─ Firebase Integration
├─ AI Integration (Gemini Nano + Cloud)
└─ Data Flow Diagrams
```

---

### 5. `start-dev.sh` 🎬 **开发环境启动脚本**
**位置**: `/start-dev.sh`

**作用**:
- 一键启动开发环境
- 同时启动Flask + Next.js
- 环境检查（Python env, API key）
- 自动清理进程

**使用方法**:
```bash
# 激活Python环境
conda activate license-prep-env

# 设置API密钥
export GOOGLE_API_KEY="your-key"

# 运行脚本
./start-dev.sh
```

**脚本功能**:
1. ✅ 检查Python虚拟环境
2. ✅ 检查GOOGLE_API_KEY
3. ✅ 启动Flask (端口5000)
4. ✅ 启动Next.js (端口3000)
5. ✅ Ctrl+C 自动清理所有进程

---

## 📂 Subdirectory Documentation

### Chrome Extension
**文件**: `/chrome-extension/README.md`
**内容**: Extension安装、配置、API使用

### Next.js Web App
**文件**: `/web-app/README.md`
**内容**: Web app结构、API集成、开发指南

---

## 🗺️ Documentation Hierarchy

```
📁 LicensePrep/
│
├─ README.md ⭐              # START HERE - 项目主页
├─ start-dev.sh              # 日常开发启动
│
├─ docs/                     # 📚 所有项目文档
│  ├─ API_SPECIFICATION.md   # 开发时参考
│  ├─ ARCHITECTURE.md        # 理解系统设计
│  ├─ DEPLOYMENT_GUIDE.md    # 部署时使用
│  ├─ DOCUMENTATION_INDEX.md # 文档索引
│  └─ CHROME_API_SETUP.md    # Chrome AI配置
│
├─ chrome-extension/
│  └─ README.md              # Extension文档
│
└─ web-app/
   └─ README.md              # Web app文档
```

---

## 🎯 Quick Reference

### 我想...
- **了解项目** → `/README.md`
- **开发新功能** → `/docs/API_SPECIFICATION.md`
- **理解架构** → `/docs/ARCHITECTURE.md`
- **部署上线** → `/docs/DEPLOYMENT_GUIDE.md`
- **启动开发** → `./start-dev.sh`
- **配置Extension** → `/chrome-extension/README.md`
- **修改Web前端** → `/web-app/README.md`

### 按角色查找

**Hackathon评审**:
1. `/README.md` - 项目概览
2. `/docs/ARCHITECTURE.md` - 技术架构
3. 运行 `./start-dev.sh` - 查看演示

**新加入的开发者**:
1. `/README.md` - Quick Start
2. `/docs/API_SPECIFICATION.md` - API接口
3. `/docs/ARCHITECTURE.md` - 系统设计
4. 运行 `./start-dev.sh` - 启动开发环境

**DevOps/部署人员**:
1. `/docs/DEPLOYMENT_GUIDE.md` - 部署流程
2. `/README.md` - 环境要求
3. `/docs/API_SPECIFICATION.md` - API端点配置

---

## 📝 Documentation Best Practices

### 何时更新文档

- ✅ 添加新API端点 → 更新 `/docs/API_SPECIFICATION.md`
- ✅ 修改架构 → 更新 `/docs/ARCHITECTURE.md`
- ✅ 改变部署方式 → 更新 `/docs/DEPLOYMENT_GUIDE.md`
- ✅ 新增功能 → 更新 `/README.md` Features部分

### 文档优先级

**必须保持更新**:
1. `/README.md` - 项目入口
2. `/docs/API_SPECIFICATION.md` - API变更频繁

**定期审查**:
3. `/docs/DEPLOYMENT_GUIDE.md` - 部署流程变化时
4. `/docs/ARCHITECTURE.md` - 重大架构调整时

---

## 🆘 Need Help?

- **文档问题**: 查看对应的README
- **API问题**: `/docs/API_SPECIFICATION.md`
- **部署问题**: `/docs/DEPLOYMENT_GUIDE.md`
- **环境问题**: `/README.md` Troubleshooting部分

