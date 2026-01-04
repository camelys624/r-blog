# Content Editing Specification

## ADDED Requirements

### Requirement: Split-Pane Markdown Editor
The system SHALL provide a split-pane editor interface that:
- Displays a textarea on the left for raw markdown input
- Displays a live preview on the right using react-markdown
- Supports CommonMark syntax (headings, paragraphs, emphasis, strong, links, images, code, lists)
- Supports GFM extensions (tables, strikethrough, task lists, autolinks)
- Supports embedded HTML via rehype-raw
- Exports markdown text for persistence

#### Scenario: Edit markdown with live preview
- **WHEN** user types markdown content `# Hello\n\nWorld` in the textarea
- **THEN** the preview pane renders the content with visual formatting (large heading "Hello", paragraph "World")
- **AND** updates in real-time as user types

#### Scenario: Use GFM tables
- **WHEN** user types GFM table syntax in the textarea
- **THEN** the preview renders a formatted HTML table with borders
- **AND** columns align according to GFM alignment markers

#### Scenario: Embed HTML
- **WHEN** user embeds HTML like `<details><summary>Click</summary>Content</details>`
- **THEN** the preview renders the interactive HTML element
- **AND** markdown within HTML is also processed

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
