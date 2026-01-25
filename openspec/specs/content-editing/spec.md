# content-editing Specification

## Purpose
Provide a markdown editor for creating and editing blog posts with AI-powered metadata generation, restricted to admin users only.

## Requirements

### Requirement: Admin-Only Access
The system SHALL restrict editor access to admin users:
- Check user session and role on editor page load
- Display loading state while checking authentication
- Show "无权访问" message for non-admin users
- Redirect option to return to homepage

#### Scenario: Admin accesses editor
- **WHEN** an authenticated admin user navigates to /editor
- **THEN** the system displays the editor interface

#### Scenario: Non-admin accesses editor
- **WHEN** a non-admin or unauthenticated user navigates to /editor
- **THEN** the system displays access denied message
- **AND** provides a button to return to homepage

### Requirement: Split-Pane Markdown Editor
The system SHALL provide a split-pane editor interface that:
- Displays a textarea on the left for raw markdown input
- Displays a live preview on the right using react-markdown
- Supports CommonMark syntax (headings, paragraphs, emphasis, strong, links, images, code, lists)
- Supports GFM extensions (tables, strikethrough, task lists, autolinks)
- Supports embedded HTML via rehype-raw
- Extracts title automatically from first H1 heading in content
- Provides synchronized scrolling between editor and preview
- Exports markdown text for persistence

#### Scenario: Edit markdown with live preview
- **WHEN** user types markdown content `# Hello\n\nWorld` in the textarea
- **THEN** the preview pane renders the content with visual formatting (large heading "Hello", paragraph "World")
- **AND** updates in real-time as user types

#### Scenario: Extract title from content
- **WHEN** user types `# My Article Title` in the content
- **THEN** the editor displays "标题: My Article Title" in the header area
- **AND** enables the save button

#### Scenario: Synchronized scrolling
- **WHEN** user scrolls in the editor textarea
- **THEN** the preview pane scrolls to the corresponding position proportionally
- **AND** vice versa when scrolling in preview

### Requirement: Code Syntax Highlighting
The system SHALL provide syntax highlighting for code blocks:
- Use react-syntax-highlighter with Prism and oneDark theme
- Detect language from markdown fence (```language)
- Fallback to plain text for unspecified languages
- Distinguish between code blocks and inline code

#### Scenario: Fenced code block with language
- **WHEN** user writes ` ```typescript\nconst x = 1;\n``` `
- **THEN** the preview displays syntax-highlighted TypeScript code
- **AND** uses dark theme styling with proper colors

#### Scenario: Inline code
- **WHEN** user writes inline code with backticks
- **THEN** the preview displays it with muted background and monospace font
- **AND** does not apply block-level syntax highlighting

### Requirement: Tab Key Handling
The system SHALL handle tab key in the textarea:
- Insert two spaces instead of default tab behavior
- Maintain cursor position after insertion
- Prevent focus from moving to next form element

#### Scenario: Press tab while editing
- **WHEN** user presses Tab key in the textarea
- **THEN** two spaces are inserted at cursor position
- **AND** cursor moves to position after inserted spaces

### Requirement: Post Creation Form
The system SHALL provide form fields for creating blog posts:
- Title input (required)
- Cover image URL input (optional, AI generates if empty)
- Content textarea (required)
- Save button with loading state
- Cancel button to return to home page

#### Scenario: Save post with valid data
- **WHEN** user fills in title and content and clicks Save
- **THEN** the system calls createPost server function
- **AND** displays success toast notification
- **AND** clears form fields after successful save

#### Scenario: Save post without title
- **WHEN** user clicks Save with empty title
- **THEN** the system displays error toast "请输入文章标题"
- **AND** does not submit the form

### Requirement: Responsive Layout
The system SHALL adapt the editor interface for different screen sizes:
- Side-by-side layout on large screens (lg breakpoint)
- Stacked layout on smaller screens
- Minimum height for comfortable editing

#### Scenario: Desktop view
- **WHEN** viewport width is >= 1024px (lg breakpoint)
- **THEN** textarea and preview display side by side in two columns
- **AND** each column takes 50% width

#### Scenario: Mobile view
- **WHEN** viewport width is < 1024px
- **THEN** textarea and preview stack vertically
- **AND** both span full width

### Requirement: AI Metadata Generation
The system SHALL automatically generate metadata for blog posts using Azure OpenAI:
- Generate/extract title from content (prefer first H1 heading)
- Analyze content to determine appropriate category
- Extract 3-5 relevant keywords as tags
- Return structured JSON with title, category, and tags array

#### Scenario: Generate metadata from content
- **WHEN** user saves a post with content containing `# React Hooks Tutorial`
- **THEN** the system generates metadata with title "React Hooks Tutorial"
- **AND** assigns an appropriate category like "技术" or "教程"
- **AND** generates relevant tags like ["React", "Hooks", "前端"]

#### Scenario: AI generation fallback
- **WHEN** AI metadata generation fails
- **THEN** the system extracts title from first H1 in content
- **AND** uses "未分类" as default category
- **AND** uses empty tags array

### Requirement: Automatic Category and Tag Creation
The system SHALL automatically manage Category and Tag records:
- Find existing category by name or create new one
- Find existing tags by name or create new ones
- Generate URL-safe slugs for new categories and tags
- Connect tags to post via many-to-many relation

#### Scenario: Create new category
- **WHEN** AI generates category "教程" that doesn't exist
- **THEN** the system creates a new Category record with name "教程" and slug "教程"
- **AND** associates the post with this category

#### Scenario: Reuse existing tags
- **WHEN** AI generates tag "React" that already exists
- **THEN** the system finds the existing Tag record
- **AND** connects it to the new post without creating duplicate

