# Change: Add Markdown Editor

## Why
Content creators need a user-friendly WYSIWYG editor to write and format blog posts without manually typing markdown syntax. A rich editing experience improves content creation efficiency and reduces errors.

## What Changes
- Integrate Milkdown editor as the primary content editing component
- Provide WYSIWYG interface with markdown source support
- Support common formatting: headings, bold, italic, lists, code blocks, links
- Enable real-time preview of formatted content
- Implement auto-save functionality to prevent content loss
- Support keyboard shortcuts for power users
- Provide toolbar for common operations

## Impact
- Affected specs: `content-editing` (new capability)
- Affected code:
  - `components/Editor/` (new)
  - `app/(admin)/notes/new/` or similar routes (new)
  - Dependencies: Add @milkdown packages
  - No existing code affected (greenfield project)
