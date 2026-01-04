# Media Management Specification

## ADDED Requirements

### Requirement: Image Hosting Integration
The system SHALL integrate with a free image hosting service for persistent image storage:
- Support uploading images via URL (for AI-generated images)
- Support uploading images via File/Blob (for user uploads)
- Return permanent public URLs that do not expire
- Handle upload failures gracefully with retries
- Configure via environment variable (IMAGE_HOST_API_KEY)

#### Scenario: Upload AI-generated image
- **WHEN** DALL-E 3 generates a cover image with temporary URL
- **THEN** the system downloads the image as blob
- **AND** uploads it to the image hosting service
- **AND** returns a permanent URL for storage in database

#### Scenario: Upload failure fallback
- **WHEN** image hosting upload fails after retries
- **THEN** the system logs the error
- **AND** returns the original temporary URL with a warning
- **AND** does not block post creation

### Requirement: Editor Image Paste
The system SHALL support pasting images directly into the editor:
- Intercept paste events containing image data
- Extract image from clipboard (image/png, image/jpeg, image/gif, image/webp)
- Upload image to hosting service automatically
- Display upload progress indicator
- Insert markdown image syntax `![image](url)` at cursor position
- Show error notification if upload fails

#### Scenario: Paste image from clipboard
- **WHEN** user copies an image and presses Ctrl+V in editor
- **THEN** the system detects image data in clipboard
- **AND** shows "上传中..." indicator
- **AND** uploads image to hosting service
- **AND** inserts `![image](https://...)` at cursor position

#### Scenario: Paste non-image content
- **WHEN** user pastes text content
- **THEN** the system allows default paste behavior
- **AND** does not trigger image upload

### Requirement: Editor Image Drag-Drop
The system SHALL support dragging and dropping image files into the editor:
- Accept dragover and drop events on editor area
- Filter for image file types only
- Upload each dropped image to hosting service
- Insert markdown for all successfully uploaded images
- Support multiple images dropped simultaneously

#### Scenario: Drop single image
- **WHEN** user drags image file from system and drops into editor
- **THEN** the system uploads the image
- **AND** inserts `![filename](url)` at drop position

#### Scenario: Drop multiple images
- **WHEN** user drops 3 images simultaneously
- **THEN** the system uploads all images concurrently
- **AND** inserts 3 markdown image links in sequence

#### Scenario: Drop non-image file
- **WHEN** user drops a PDF or other non-image file
- **THEN** the system ignores the drop
- **AND** shows no error (silent rejection)

## MODIFIED Requirements

### Requirement: AI-Generated Cover Images
The system SHALL automatically generate cover images for blog posts using Azure OpenAI DALL-E 3:
- Generate images when user does not provide a cover image URL
- Use GPT-4o-mini to create descriptive prompts based on article title and content
- Generate modern, minimalist, professional blog cover images
- **Upload generated image to image hosting service for permanent storage**
- Return permanent public URL for database storage
- Image size: 1792x1024 pixels

#### Scenario: Generate cover image for new post
- **WHEN** user saves a post without providing a cover image URL
- **THEN** the system calls GPT-4o-mini to generate an image prompt
- **AND** calls DALL-E 3 with the generated prompt
- **AND** uploads the generated image to image hosting service
- **AND** stores the permanent URL in the post record

#### Scenario: Skip generation when URL provided
- **WHEN** user provides a cover image URL in the form
- **THEN** the system uses the provided URL directly
- **AND** does not call the AI image generation service

#### Scenario: Image prompt creation
- **WHEN** the system creates an image prompt from article content
- **THEN** GPT-4o-mini generates a concise English prompt (max 100 words)
- **AND** focuses on abstract concepts and visual metaphors
- **AND** explicitly excludes text from the image
