# Project Context

## Purpose
A personal blog application for publishing and managing blog posts and notes.

## Tech Stack
- **Language**: TypeScript (~5.9)
- **Frontend Framework**: React 19
- **Full-stack Framework**: TanStack Start (based on Vite + Vinxi)
- **Build Tool**: Vite (using rolldown-vite v7)
- **Routing**: TanStack Router
- **UI Components**: shadcn/ui with tweakcn retro-arcade theme
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest
- **Linting**: ESLint 9 with TypeScript and React plugins
- **Database**: PostgreSQL (Supabase)
- **Database ORM**: Prisma 7.x with @prisma/adapter-pg
- **Deployment**: Vercel
- **Package Manager**: npm

## Project Conventions

### Code Style
- Use TypeScript for all source files (`.ts`, `.tsx`)
- ESLint configuration extends recommended rules from:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `eslint-plugin-react-hooks` recommended
  - `eslint-plugin-react-refresh` for Vite HMR
- Function components with hooks (no class components)
- ES modules (`"type": "module"` in package.json)

### Architecture Patterns
- Component-based architecture with React
- TanStack Start for full-stack capabilities (SSR + Server Functions)
- TanStack Router 管理路由和导航菜单
- Server Functions (`createServerFn`) for backend logic
- Source code organized under `src/`
- Routes in `src/routes/`
- UI components in `src/components/ui/` (shadcn)
- Library code in `src/lib/`
- Static public files in `public/`

### Testing Strategy
- 使用 Vitest 进行单元测试和组件测试
- 测试文件与源文件放在同一目录，命名为 `*.test.ts` 或 `*.test.tsx`

### Git Workflow
- Main branch: `main`
- Commit messages: Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- AI-assisted commits include co-author attribution

## Domain Context
- 个人博客系统，单用户（作者：Janssen）
- 数据模型定义在 `prisma/schema.prisma`

### 数据模型
- **Post**: 文章（标题、slug、摘要、封面图、内容、状态、分类、标签）
- **Category**: 分类（名称、slug、描述）
- **Tag**: 标签（名称、slug），与文章多对多关系
- **PostStatus**: 枚举（DRAFT 草稿 / PUBLISHED 已发布）

## Important Constraints
- 部署平台：Vercel
- 需要兼容 Vercel 的 Serverless 环境
- Supabase 需要配置 `DATABASE_URL` 和 `DIRECT_URL` 环境变量
- Prisma 7.x 需要使用 adapter（`@prisma/adapter-pg`）
- Vite SSR 需要将 Prisma 相关包设为 external

## External Dependencies
- Supabase PostgreSQL 数据库
- Vercel 托管和部署

## 项目进度

### 已完成
- [x] 项目初始化（Vite + React 19 + TypeScript）
- [x] Prisma 配置（`prisma.config.ts`）
- [x] 数据模型设计（Post、Category、Tag）
- [x] 数据库 Migration 已应用到 Supabase
- [x] Prisma 客户端封装（`src/lib/prisma.ts`）
- [x] 迁移到 TanStack Start 全栈框架
- [x] 配置 TanStack Router
- [x] 安装 shadcn/ui 和 tweakcn retro-arcade 主题
- [x] 创建后台编辑器页面（`/editor`）
- [x] 实现文章保存功能（Server Function + Prisma）
- [x] Toast 通知组件（sonner）
- [x] Markdown 实时预览（左右分栏布局）
- [x] 支持 HTML 内嵌语法（rehype-raw）
- [x] 代码块语法高亮（react-syntax-highlighter + oneDark 主题）
- [x] 编辑器 Tab 键插入空格
- [x] 编辑器封面图片路径输入框（可手动指定或 AI 生成）
- [x] AI 生成封面图片功能（DALL-E 3）
- [x] AI 生成文章摘要功能（GPT）
- [x] Azure OpenAI 集成（替换标准 OpenAI API）
- [x] 博客前台首页（Hero 大图 + 文章列表）
- [x] 博客文章详情页（返回按钮、分类标签、摘要引用、分享功能）
- [x] 页面布局优化（毛玻璃 Header、Footer 固定底部）
- [x] lucide-react 图标库集成

### 待完成
- [ ] 完善后台管理页面（文章列表、编辑、删除）
- [ ] 分类管理功能
- [ ] 标签管理功能
- [ ] 搜索功能
- [ ] 配置 Vitest 测试环境
- [ ] 部署到 Vercel

## 开发日志

### 2024-12-30
- **Azure OpenAI 集成**: 将 AI 模块从标准 OpenAI API 迁移到 Azure OpenAI
  - 修改 `src/lib/ai.ts`，使用 `AzureOpenAI` 客户端
  - 新增环境变量：`AZURE_OPENAI_ENDPOINT`、`AZURE_OPENAI_API_KEY`、`AZURE_OPENAI_API_VERSION`、`AZURE_OPENAI_CHAT_DEPLOYMENT`、`AZURE_OPENAI_IMAGE_DEPLOYMENT`
- **修复 react-syntax-highlighter ESM 问题**: 将导入路径从 `dist/esm` 改为 `dist/cjs`
- **前台页面重构**: 参考 `template.tsx` 设计，融合现代博客风格
  - 首页：毛玻璃 Header、Hero 大图展示、文章卡片列表、悬浮缩放效果
  - 详情页：返回按钮动画、分类标签、作者信息栏、摘要引用样式、分享功能
  - Footer：简洁版权信息、社交链接
- **布局优化**: main 区域最小高度设置，确保 Footer 在页面底部
