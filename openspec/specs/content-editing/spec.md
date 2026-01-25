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

### Requirement: AI Cover Image Generation
The system SHALL generate cover images using Azure OpenAI DALL-E:
- Generate image prompt from article title and content using GPT
- Create 1024x1024 image with DALL-E 3 (standard quality)
- Upload generated image to imgbb for permanent hosting
- Fall back to temporary URL if upload fails

#### Scenario: Generate cover image
- **WHEN** user saves a post without providing cover image URL
- **THEN** the system generates an image prompt using GPT
- **AND** creates image using DALL-E 3 at 1024x1024 resolution
- **AND** uploads to imgbb for permanent storage
- **AND** stores the permanent URL in the post

#### Scenario: Use provided cover image
- **WHEN** user provides a cover image URL
- **THEN** the system uses the provided URL directly
- **AND** skips AI image generation

### Requirement: AI Summary Generation
The system SHALL generate summaries using Azure OpenAI GPT:
- Analyze first 3000 characters of content
- Generate 100-150 character Chinese summary
- Summarize core points to attract readers

#### Scenario: Generate summary
- **WHEN** user saves a post
- **THEN** the system generates a concise summary using AI
- **AND** stores the summary in the post record

### Requirement: Image Upload in Editor
The system SHALL support image upload within the editor:
- Paste images directly from clipboard
- Drag and drop image files
- Convert to base64 and upload to imgbb
- Insert markdown image syntax at cursor position

#### Scenario: Paste image
- **WHEN** user pastes an image from clipboard
- **THEN** the system extracts the image data
- **AND** uploads to imgbb image host
- **AND** inserts `![image](url)` at cursor position

#### Scenario: Drag and drop image
- **WHEN** user drags an image file into the editor
- **THEN** the system uploads the file to imgbb
- **AND** inserts markdown image syntax at cursor position

### Requirement: Programmatic Post Creation
The system SHALL support creating posts via API for external tools:
- HTTP endpoint: `POST /api/posts`
- Authentication via API Key
- Same AI processing as web interface (metadata, summary, cover image)
- Returns created post object

#### Scenario: Create post via API
- **WHEN** external tool sends POST request with API Key and content
- **THEN** the system authenticates the API Key
- **AND** processes content with AI (metadata, summary, cover)
- **AND** creates the post in database
- **AND** returns the created post object

### Requirement: Core Function Export
The system SHALL export a `createPostCore` function for direct use:
- Bypasses server function wrapper
- Can be called from scripts or API routes
- Same authentication and processing logic

#### Scenario: Use createPostCore in script
- **WHEN** a script imports and calls createPostCore
- **THEN** the function authenticates and creates post
- **AND** returns the created post object directly

