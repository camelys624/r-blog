# Change: Add Markdown Editor

## Why
Content creators need an editor to write and format blog posts. A split-pane editor with live preview provides immediate feedback while allowing direct markdown editing for power users.

## What Changes
- Create split-pane editor with textarea (left) and live preview (right)
- Use react-markdown for rendering with GFM support
- Use react-syntax-highlighter with oneDark theme for code blocks
- Support embedded HTML via rehype-raw
- Implement Tab key handling for indentation
- Create post creation form with title, cover image URL, and content fields
- Integrate with createPost server function for saving drafts
- Add toast notifications for success/error feedback

## Impact
- Affected specs: `content-editing` (new capability)
- Affected code:
  - `src/routes/editor.tsx` (new - editor page)
  - `src/components/markdown-preview.tsx` (new - preview component)
  - Dependencies: react-markdown, remark-gfm, rehype-raw, react-syntax-highlighter
