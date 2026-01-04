# My Blog

基于 TanStack Start 构建的个人博客系统，集成 AI 自动生成功能。

## 技术栈

- **框架**: TanStack Start (Vite + React 19)
- **路由**: TanStack Router (文件路由)
- **数据库**: PostgreSQL + Prisma ORM
- **AI**: Azure OpenAI (GPT-4o-mini, DALL-E 3)
- **样式**: Tailwind CSS v4 + shadcn/ui

## 功能特性

### 编辑器
- 分栏式 Markdown 编辑器（左编辑，右预览）
- 支持 GFM 语法（表格、任务列表、删除线）
- 支持嵌入 HTML
- 代码语法高亮（Prism + oneDark 主题）
- 编辑/预览区域同步滚动

### AI 自动生成
- **标题**: 从 Markdown 内容自动提取
- **分类**: AI 分析内容主题自动分类
- **标签**: AI 提取 3-5 个关键词
- **摘要**: AI 生成 100-150 字中文摘要
- **封面图**: DALL-E 3 自动生成博客封面

### 数据管理
- 文章 CRUD 操作
- 分类自动创建和关联
- 标签自动创建和关联
- 草稿/发布状态管理

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 代码检查
npm run lint
```

## 环境变量

```env
# 数据库
DATABASE_URL=postgresql://...

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_IMAGE_DEPLOYMENT=dall-e-3
```

## 项目结构

```
src/
├── routes/           # TanStack Router 文件路由
│   ├── __root.tsx    # 根布局
│   ├── index.tsx     # 首页（文章列表）
│   ├── editor.tsx    # 编辑器页面
│   └── posts.$slug.tsx # 文章详情页
├── components/       # React 组件
│   ├── ui/           # shadcn/ui 组件
│   └── markdown-preview.tsx
├── lib/              # 工具库
│   ├── ai.ts         # Azure OpenAI 集成
│   ├── post.api.ts   # Server Functions
│   └── prisma.ts     # Prisma 客户端
└── index.css         # 全局样式

openspec/
├── specs/            # 功能规范文档
│   ├── content-editing/
│   ├── content-management/
│   └── media-management/
└── changes/          # 变更提案
    └── archive/      # 已归档变更
```

## 规范文档

项目使用 OpenSpec 进行规范驱动开发，详见 `openspec/` 目录。
