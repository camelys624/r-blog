# Change: Add Core Data Models

## Why
The blog platform needs foundational data structures to store and manage content. Without a well-defined schema for Notes, Topics, and Projects, we cannot persist or query user content.

## What Changes
- Define Prisma schema for three core content types:
  - **Notes**: Individual blog posts/articles with title, content, timestamps, and topic associations
  - **Topics**: Categories/tags for organizing notes with hierarchical support
  - **Projects**: Portfolio items with metadata, descriptions, and optional links
- Establish relationships between models (Notes-Topics many-to-many)
- Include soft delete support and audit fields (createdAt, updatedAt)
- Set up database migrations for PostgreSQL

## Impact
- Affected specs: `content-management` (new capability)
- Affected code:
  - `prisma/schema.prisma` (new)
  - Database migrations (new)
  - No existing code affected (greenfield project)
