# Change: Update Editor with AI Metadata Generation

## Why
Streamline the content creation workflow by removing manual metadata entry. The editor should focus on writing, with AI automatically generating title, category, tags, summary, and cover image from the article content.

## What Changes
- Remove title input field from editor (extract from Markdown H1)
- Move cover image URL input to bottom of editor
- Add synchronized scrolling between editor and preview
- Implement AI metadata generation:
  - Extract/generate title from content
  - Generate appropriate category based on content
  - Generate relevant tags (3-5 keywords)
- Auto-create Category and Tag records in database

## Impact
- Affected specs: `content-editing` (modified)
- Affected code:
  - `src/routes/editor.tsx` - UI changes, scroll sync
  - `src/lib/ai.ts` - New generateMetadata function
  - `src/lib/post.api.ts` - Updated to use AI metadata
