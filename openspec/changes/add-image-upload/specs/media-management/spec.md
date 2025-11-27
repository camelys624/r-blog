# Media Management Specification

## ADDED Requirements

### Requirement: Image Upload API
The system SHALL provide a `/api/upload` endpoint that:
- Accepts POST requests with multipart/form-data containing one or more image files
- Validates file types against whitelist (image/jpeg, image/png, image/gif, image/webp)
- Validates file size not exceeding 5MB per file
- Uploads validated files to object storage with unique filenames
- Returns JSON response with array of uploaded file URLs and metadata
- Returns 400 Bad Request for validation failures with descriptive error messages
- Returns 500 Internal Server Error for storage failures

#### Scenario: Single image upload success
- **WHEN** client POSTs a valid 2MB JPEG file to `/api/upload`
- **THEN** the system uploads file to object storage with unique name like `abc123-image.jpg`
- **AND** returns 200 OK with JSON `{"files": [{"url": "https://storage.../abc123-image.jpg", "name": "image.jpg", "size": 2048000}]}`

#### Scenario: Multiple image upload
- **WHEN** client POSTs 3 valid PNG files in a single request
- **THEN** the system uploads all files concurrently to object storage
- **AND** returns array of 3 URLs in response

#### Scenario: Invalid file type rejection
- **WHEN** client POSTs a PDF file
- **THEN** the system returns 400 Bad Request with error message "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
- **AND** no files are uploaded to storage

#### Scenario: Oversized file rejection
- **WHEN** client POSTs a 10MB image file
- **THEN** the system returns 400 Bad Request with error "File size exceeds 5MB limit"
- **AND** no upload occurs

### Requirement: Unique Filename Generation
The system SHALL generate unique filenames for uploaded files to prevent conflicts and overwrites:
- Prepend UUID or timestamp-based unique identifier to original filename
- Preserve original file extension
- Sanitize filenames to remove special characters
- Ensure uniqueness even for concurrent uploads

#### Scenario: Filename conflict prevention
- **WHEN** two users upload files named "avatar.jpg" simultaneously
- **THEN** the system generates distinct filenames like `uuid1-avatar.jpg` and `uuid2-avatar.jpg`
- **AND** both files coexist in storage without conflict

#### Scenario: Special character sanitization
- **WHEN** file named "my photo (1).jpg" is uploaded
- **THEN** the system generates filename like `uuid-my-photo-1.jpg`
- **AND** removes parentheses and spaces for URL safety

### Requirement: Object Storage Integration
The system SHALL integrate with an S3-compatible object storage service:
- Support AWS S3, Cloudflare R2, or other S3-compatible providers
- Use environment variables for configuration (bucket name, region, credentials)
- Upload files with public-read ACL or equivalent public access
- Return publicly accessible URLs without authentication requirements
- Handle storage service errors gracefully (retry transient failures, report persistent errors)

#### Scenario: Upload to S3
- **WHEN** file is uploaded and storage provider is AWS S3
- **THEN** the system uses AWS SDK to PUT object to configured bucket
- **AND** returns S3 public URL like `https://bucket.s3.region.amazonaws.com/uuid-file.jpg`

#### Scenario: Storage service unavailable
- **WHEN** object storage service returns 503 Service Unavailable
- **THEN** the system retries upload up to 3 times with exponential backoff
- **AND** returns 500 error to client if all retries fail

### Requirement: Editor Image Paste
The system SHALL enable pasting images directly into the Milkdown editor:
- Intercept paste events containing image data
- Extract image file from clipboard
- Automatically trigger upload to `/api/upload`
- Display inline upload progress indicator (spinner or percentage)
- Insert markdown image syntax `![filename](url)` at cursor position after successful upload
- Show error notification if upload fails

#### Scenario: Paste image from clipboard
- **WHEN** user copies an image and pastes into editor (Ctrl+V)
- **THEN** the system extracts image data from clipboard
- **AND** displays "Uploading..." indicator
- **AND** calls `/api/upload` with image data
- **AND** inserts `![image](https://storage.../uuid-image.png)` after upload completes

#### Scenario: Paste with upload failure
- **WHEN** user pastes image but upload fails due to network error
- **THEN** the system displays error notification "Upload failed. Please try again."
- **AND** does not insert broken image link into editor

### Requirement: Editor Image Drag and Drop
The system SHALL support dragging and dropping image files into the editor:
- Intercept dragover and drop events on editor area
- Accept only image file types (reject others silently)
- Support multiple files dropped simultaneously
- Upload each file and track individual progress
- Insert markdown for all successfully uploaded images

#### Scenario: Drop single image
- **WHEN** user drags "photo.jpg" from file system and drops into editor
- **THEN** the system uploads the file
- **AND** inserts `![photo](https://storage.../uuid-photo.jpg)` at drop position

#### Scenario: Drop multiple images
- **WHEN** user drops 3 images simultaneously
- **THEN** the system uploads all 3 files concurrently
- **AND** displays 3 separate progress indicators
- **AND** inserts 3 markdown image links in order after uploads complete

#### Scenario: Drop non-image file
- **WHEN** user drops a PDF file into editor
- **THEN** the system ignores the drop event
- **AND** no upload or insertion occurs

### Requirement: Upload Progress Feedback
The system SHALL provide real-time feedback during upload operations:
- Display visual progress indicator (spinner or percentage bar)
- Show file name being uploaded
- Indicate success with checkmark or "Uploaded" message
- Display error messages for failed uploads with retry option
- Support concurrent uploads with separate progress tracking for each file

#### Scenario: Progress indicator during upload
- **WHEN** user initiates image upload
- **THEN** the system displays spinner with text "Uploading photo.jpg..."
- **AND** replaces with "Uploaded successfully" when complete

#### Scenario: Multiple uploads progress
- **WHEN** 3 images are uploaded concurrently
- **THEN** the system displays 3 separate progress indicators
- **AND** updates each independently as uploads complete

#### Scenario: Upload retry
- **WHEN** upload fails and system displays error with "Retry" button
- **THEN** clicking Retry attempts upload again
- **AND** resets progress indicator to show new attempt

### Requirement: Security and Validation
The system SHALL enforce security measures for image uploads:
- Validate file signatures (magic numbers) to ensure files match declared MIME type
- Reject executable file extensions even if disguised as images
- Sanitize filenames to prevent path traversal attacks
- Implement rate limiting to prevent upload abuse (max 20 uploads per minute per IP)
- Strip EXIF metadata from uploaded images to protect user privacy (optional but recommended)

#### Scenario: MIME type spoofing detection
- **WHEN** client uploads executable file with `.jpg` extension and fake MIME type
- **THEN** the system validates file signature (magic numbers)
- **AND** rejects upload with 400 error "Invalid file format"

#### Scenario: Path traversal prevention
- **WHEN** client attempts upload with filename `../../etc/passwd.jpg`
- **THEN** the system sanitizes to safe filename like `uuid-etc-passwd.jpg`
- **AND** uploads to intended storage location only

#### Scenario: Rate limiting
- **WHEN** client uploads 25 images within 1 minute
- **THEN** the system accepts first 20 uploads
- **AND** returns 429 Too Many Requests for uploads 21-25
- **AND** includes Retry-After header indicating when to retry
