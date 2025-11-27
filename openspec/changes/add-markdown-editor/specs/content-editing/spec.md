# Content Editing Specification

## ADDED Requirements

### Requirement: Markdown Editor Component
The system SHALL provide a Milkdown-based WYSIWYG editor component that:
- Renders as a React component accepting initial content and onChange callback
- Supports CommonMark syntax (headings, paragraphs, emphasis, strong, links, images, code, lists)
- Provides visual formatting without requiring manual markdown syntax
- Exports markdown text for persistence
- Displays in a bordered, styled container matching the blog's design system

#### Scenario: Initialize editor with content
- **WHEN** the editor component receives initial markdown content "# Hello\n\nWorld"
- **THEN** it renders the content with visual formatting (large heading "Hello", paragraph "World")
- **AND** allows immediate editing

#### Scenario: Format text via toolbar
- **WHEN** user selects text "important" and clicks bold button in toolbar
- **THEN** the text becomes bold visually
- **AND** the underlying markdown becomes "**important**"

#### Scenario: Export markdown on change
- **WHEN** user types or formats content
- **THEN** the editor calls onChange callback with current markdown string
- **AND** parent component can persist or display the content

### Requirement: Keyboard Shortcuts
The system SHALL support standard keyboard shortcuts for common formatting operations:
- Ctrl+B / Cmd+B: Toggle bold
- Ctrl+I / Cmd+I: Toggle italic
- Ctrl+K / Cmd+K: Insert link
- Ctrl+` / Cmd+`: Toggle inline code
- Ctrl+Z / Cmd+Z: Undo
- Ctrl+Y / Cmd+Y: Redo

#### Scenario: Bold shortcut
- **WHEN** user selects text and presses Ctrl+B
- **THEN** the selected text becomes bold
- **AND** the markdown updates to "**text**"

#### Scenario: Link insertion shortcut
- **WHEN** user presses Ctrl+K
- **THEN** the editor prompts for URL input
- **AND** creates a markdown link `[text](url)` when confirmed

### Requirement: GFM Extensions
The system SHALL support GitHub Flavored Markdown extensions:
- Tables with column alignment
- Strikethrough text (~~text~~)
- Task lists (- [ ] item)
- Autolinks for URLs

#### Scenario: Create table
- **WHEN** user inserts a table via toolbar or syntax
- **THEN** the editor renders an editable table grid
- **AND** exports proper GFM table markdown

#### Scenario: Task list
- **WHEN** user types "- [ ] Task" and "- [x] Done"
- **THEN** the editor renders interactive checkboxes
- **AND** preserves checked state in markdown

### Requirement: Auto-Save
The system SHALL automatically save editor content to prevent data loss:
- Trigger save after 2 seconds of inactivity (debounced)
- Display save status indicator (Saving... / Saved / Error)
- Store draft in localStorage as fallback if server save fails
- Restore draft on page reload if available

#### Scenario: Auto-save after typing
- **WHEN** user types content and pauses for 2 seconds
- **THEN** the system triggers onChange with current markdown
- **AND** displays "Saving..." then "Saved" indicator

#### Scenario: Restore draft on reload
- **WHEN** user refreshes page with unsaved draft in localStorage
- **THEN** the editor prompts to restore the draft
- **AND** loads draft content if user confirms

### Requirement: Responsive Design
The system SHALL adapt the editor interface for different screen sizes:
- Full toolbar on desktop (>768px width)
- Compact toolbar with dropdown menus on tablet (768px-1024px)
- Minimal toolbar with essential actions only on mobile (<768px)
- Editor height adjusts to content with minimum 300px

#### Scenario: Mobile toolbar
- **WHEN** editor is displayed on mobile device (viewport <768px)
- **THEN** toolbar shows only bold, italic, link, and overflow menu
- **AND** overflow menu contains heading, list, and code options

#### Scenario: Content reflow
- **WHEN** viewport width changes
- **THEN** editor content reflows without horizontal scrolling
- **AND** tables remain readable with horizontal scroll if needed

### Requirement: Loading and Error States
The system SHALL handle asynchronous operations gracefully:
- Display skeleton loader while initializing editor
- Show error message if editor fails to load
- Provide retry mechanism for failed operations
- Disable editor during save operations to prevent conflicts

#### Scenario: Editor initialization
- **WHEN** editor component mounts
- **THEN** it displays a loading skeleton for up to 1 second
- **AND** transitions to editable state when ready

#### Scenario: Save error
- **WHEN** auto-save fails due to network error
- **THEN** the editor displays "Save failed" with retry button
- **AND** preserves content in memory for retry attempt
