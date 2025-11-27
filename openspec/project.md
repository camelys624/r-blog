# Project Context

## Purpose
A personal blog platform for managing and publishing Notes, Topics, and Projects. The blog features a rich markdown editor with image upload capabilities and provides a clean, modern interface for content creation and management.

## Tech Stack
- **Framework**: Next.js (React-based full-stack framework)
- **UI Library**: Shadcn UI (accessible, customizable component library)
- **Database ORM**: Prisma (type-safe database client)
- **Editor**: Milkdown (WYSIWYG markdown editor)
- **Styling**: Tailwind CSS (via Shadcn UI)
- **Language**: TypeScript
- **Deployment**: Vercel
- **Storage**: Object storage for images (to be configured)

## Project Conventions

### Code Style
- **Language**: TypeScript for type safety
- **Components**: React functional components with hooks
- **File naming**:
  - Components: PascalCase (e.g., `BlogPost.tsx`)
  - Utils/helpers: camelCase (e.g., `formatDate.ts`)
  - API routes: kebab-case (e.g., `api/upload/route.ts`)
- **Import order**: External packages → Internal modules → Types → Styles

### Architecture Patterns
- **App Router**: Using Next.js 13+ App Router
- **Server Components**: Prefer Server Components by default, use Client Components when needed (interactivity, hooks)
- **API Routes**: RESTful API endpoints in `/app/api`
- **Database**: Prisma schema with migrations
- **Data Models**:
  - Notes: Individual blog posts/articles
  - Topics: Categories or tags for organizing content
  - Projects: Showcase portfolio projects

### Testing Strategy
- [To be defined as project grows]
- Focus on critical paths (authentication, data persistence, image upload)

### Git Workflow
- **Main branch**: `main` for production-ready code
- **Feature branches**: `feature/description` for new features
- **Commits**: Descriptive commit messages in English
- **Deployment**: Automatic deployment via Vercel on push to `main`

## Domain Context
- **Content Types**:
  - **Notes**: Blog posts, articles, technical writings
  - **Topics**: Organizing principle for notes (tags/categories)
  - **Projects**: Portfolio items, side projects, work showcase
- **Editor Features**:
  - Markdown-based with WYSIWYG interface
  - Image paste and upload support
  - Upload progress indicators
  - Multiple image upload capability

## Important Constraints
- **Image Upload**: Must handle multiple images, show upload progress
- **Storage**: Images stored in external object storage (not in database)
- **Deployment**: Must work seamlessly on Vercel serverless environment
- **Environment Variables**: All sensitive config (DB URL, storage credentials) via env vars

## External Dependencies
- **Database**: PostgreSQL or similar (via Prisma)
- **Object Storage**: For image uploads (provider TBD - could be S3, Cloudflare R2, etc.)
- **Vercel**: Hosting and deployment platform
