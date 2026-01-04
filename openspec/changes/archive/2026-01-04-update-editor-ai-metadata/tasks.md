# Implementation Tasks

## 1. Editor UI Updates
- [x] 1.1 Remove title input field
- [x] 1.2 Add title extraction from Markdown content (first H1)
- [x] 1.3 Display extracted title in header
- [x] 1.4 Move cover image input to bottom of page
- [x] 1.5 Disable save button when no title detected

## 2. Synchronized Scrolling
- [x] 2.1 Add refs for editor textarea and preview container
- [x] 2.2 Implement scroll percentage calculation
- [x] 2.3 Add bidirectional scroll sync (editor ↔ preview)
- [x] 2.4 Prevent scroll loop with source tracking

## 3. AI Metadata Generation
- [x] 3.1 Create generateMetadata function in ai.ts
- [x] 3.2 Generate title from content analysis
- [x] 3.3 Generate category based on content theme
- [x] 3.4 Generate 3-5 relevant tags

## 4. Database Integration
- [x] 4.1 Update createPost to use AI-generated metadata
- [x] 4.2 Auto-create Category if not exists
- [x] 4.3 Auto-create Tags if not exist
- [x] 4.4 Connect tags to post via relation
- [x] 4.5 Add fallback for AI generation failures
