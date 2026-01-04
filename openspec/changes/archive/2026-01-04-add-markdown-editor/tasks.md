# Implementation Tasks

## 1. Dependencies
- [x] 1.1 Install react-markdown package
- [x] 1.2 Install remark-gfm for GitHub Flavored Markdown
- [x] 1.3 Install rehype-raw for HTML support
- [x] 1.4 Install react-syntax-highlighter for code blocks

## 2. Markdown Preview Component
- [x] 2.1 Create MarkdownPreview component wrapper
- [x] 2.2 Configure react-markdown with remark-gfm and rehype-raw plugins
- [x] 2.3 Implement code syntax highlighting with Prism and oneDark theme
- [x] 2.4 Distinguish between code blocks and inline code
- [x] 2.5 Apply Tailwind prose styling for typography
- [x] 2.6 Handle empty content state with placeholder

## 3. Editor Page
- [x] 3.1 Create /editor route with TanStack Router
- [x] 3.2 Implement split-pane layout (textarea + preview)
- [x] 3.3 Add title input field
- [x] 3.4 Add optional cover image URL input
- [x] 3.5 Implement Tab key handling for indentation
- [x] 3.6 Add loading state for save button
- [x] 3.7 Add cancel button with navigation

## 4. Form Integration
- [x] 4.1 Connect form to createPost server function
- [x] 4.2 Validate required fields (title, content)
- [x] 4.3 Display success toast on save
- [x] 4.4 Display error toast on failure
- [x] 4.5 Clear form after successful save

## 5. Responsive Design
- [x] 5.1 Implement side-by-side layout on large screens
- [x] 5.2 Implement stacked layout on smaller screens
- [x] 5.3 Set minimum height for editor areas
