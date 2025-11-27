# Content Management Specification

## ADDED Requirements

### Requirement: Note Data Model
The system SHALL provide a Note model to represent blog posts and articles with the following attributes:
- Unique identifier (UUID or auto-increment)
- Title (string, required, max 200 characters)
- Content (text, required, markdown format)
- Slug (string, unique, URL-friendly)
- Published status (boolean, default false)
- Soft delete support (deletedAt timestamp, nullable)
- Audit timestamps (createdAt, updatedAt)

#### Scenario: Create new note
- **WHEN** a new note is created with title "Hello World" and content "My first post"
- **THEN** the system generates a unique slug "hello-world"
- **AND** sets published to false by default
- **AND** records createdAt and updatedAt timestamps

#### Scenario: Soft delete note
- **WHEN** a note is deleted
- **THEN** the system sets deletedAt to current timestamp
- **AND** the note remains in database but is excluded from queries by default

### Requirement: Topic Data Model
The system SHALL provide a Topic model to categorize and tag content with the following attributes:
- Unique identifier (UUID or auto-increment)
- Name (string, required, max 100 characters)
- Slug (string, unique, URL-friendly)
- Description (text, optional)
- Parent topic reference (self-referential foreign key, nullable for hierarchical support)
- Audit timestamps (createdAt, updatedAt)

#### Scenario: Create root topic
- **WHEN** a topic "Technology" is created without a parent
- **THEN** the system generates slug "technology"
- **AND** parentId is null

#### Scenario: Create nested topic
- **WHEN** a topic "JavaScript" is created with parent "Technology"
- **THEN** the system links it to parent via parentId foreign key
- **AND** enables hierarchical topic browsing

### Requirement: Project Data Model
The system SHALL provide a Project model to showcase portfolio items with the following attributes:
- Unique identifier (UUID or auto-increment)
- Title (string, required, max 200 characters)
- Description (string, optional, max 500 characters)
- Content (text, optional, markdown format for detailed description)
- URL (string, optional, external project link)
- Image URL (string, optional, cover image reference)
- Status (enum: draft, published, archived)
- Audit timestamps (createdAt, updatedAt)

#### Scenario: Create project entry
- **WHEN** a project "My Blog" is created with status "published"
- **THEN** the system stores all metadata
- **AND** the project becomes queryable

#### Scenario: Link external resource
- **WHEN** a project has a URL "https://github.com/user/repo"
- **THEN** the system stores the link for display

### Requirement: Note-Topic Association
The system SHALL support many-to-many relationships between Notes and Topics through a join table with the following behavior:
- A note can be associated with zero or more topics
- A topic can be linked to zero or more notes
- The association tracks creation timestamp

#### Scenario: Tag note with multiple topics
- **WHEN** a note is tagged with topics "JavaScript" and "Tutorial"
- **THEN** the system creates two join table entries
- **AND** the note is queryable by either topic

#### Scenario: Query notes by topic
- **WHEN** querying notes for topic "JavaScript"
- **THEN** the system returns all associated notes via join table
- **AND** respects published status and soft delete filters

### Requirement: Database Indexing
The system SHALL create indexes on frequently queried fields to ensure performance:
- Unique index on Note.slug
- Unique index on Topic.slug
- Index on Note.published for filtering
- Index on Note.deletedAt for soft delete queries
- Index on Topic.parentId for hierarchical queries
- Index on join table foreign keys (noteId, topicId)

#### Scenario: Fast slug lookup
- **WHEN** querying a note by slug "/posts/hello-world"
- **THEN** the database uses the slug index for O(log n) lookup

#### Scenario: Efficient topic hierarchy traversal
- **WHEN** loading all child topics of "Technology"
- **THEN** the database uses the parentId index for efficient queries
