# authentication Specification

## Purpose
Provide GitHub OAuth authentication with role-based access control to protect administrative functions like creating, editing, and deleting blog posts.

## Requirements

### Requirement: User Data Model
The system SHALL provide a User model to represent authenticated users with the following attributes:
- Unique identifier (CUID)
- Name (string, optional, from GitHub profile)
- Email (string, optional, unique)
- Image URL (string, optional, GitHub avatar)
- Role (enum: USER, ADMIN, default USER)
- Audit timestamps (createdAt, updatedAt)

#### Scenario: Create user from GitHub login
- **WHEN** a new user logs in via GitHub
- **THEN** the system creates a User record with GitHub profile data
- **AND** sets role to USER by default

### Requirement: OAuth Account Model
The system SHALL provide an Account model to store OAuth provider information:
- Unique identifier (CUID)
- User reference (foreign key)
- Provider type (string, e.g., "oauth")
- Provider name (string, e.g., "github")
- Provider account ID (string, GitHub user ID)
- Access token (string, optional)
- Refresh token (string, optional)
- Token expiration (integer, optional)
- Token type and scope (strings, optional)
- Unique constraint on (provider, providerAccountId)

#### Scenario: Link GitHub account
- **WHEN** user authenticates with GitHub
- **THEN** the system stores the provider account ID and tokens
- **AND** links the account to the User record

### Requirement: Session Model
The system SHALL provide a Session model to manage user sessions:
- Unique identifier (CUID)
- Session token (string, unique, 64-character hex)
- User reference (foreign key)
- Expiration timestamp (30 days from creation)

#### Scenario: Create session after login
- **WHEN** user successfully authenticates
- **THEN** the system creates a Session record with random token
- **AND** sets expiration to 30 days from now

#### Scenario: Validate session
- **WHEN** a request includes a session token
- **THEN** the system verifies the token exists and is not expired
- **AND** returns the associated user data

### Requirement: GitHub OAuth Flow
The system SHALL implement GitHub OAuth 2.0 authentication:
- Generate authorization URL with client ID, redirect URI, and state
- Store state in sessionStorage for CSRF protection
- Exchange authorization code for access token
- Fetch user profile and email from GitHub API
- Create or update User and Account records
- Create Session and set cookie

#### Scenario: Initiate GitHub login
- **WHEN** user clicks "使用 GitHub 登录"
- **THEN** the system generates a random state parameter
- **AND** stores state in sessionStorage
- **AND** redirects to GitHub authorization URL

#### Scenario: Handle OAuth callback
- **WHEN** GitHub redirects back with code and state
- **THEN** the system validates state matches stored value
- **AND** exchanges code for access token
- **AND** fetches user profile from GitHub API
- **AND** creates/updates user records and session

### Requirement: Role-Based Access Control
The system SHALL enforce role-based access control:
- ADMIN role: Can create, edit, delete, publish/unpublish posts
- USER role: Can view published posts only
- Unauthenticated: Can view published posts only

#### Scenario: Admin accesses editor
- **WHEN** an ADMIN user navigates to /editor
- **THEN** the system allows access to the editor

#### Scenario: Non-admin accesses editor
- **WHEN** a USER or unauthenticated visitor navigates to /editor
- **THEN** the system displays "无权访问" message
- **AND** provides button to return to homepage

#### Scenario: Admin accesses management page
- **WHEN** an ADMIN user navigates to /admin
- **THEN** the system displays the post management interface

### Requirement: Login UI
The system SHALL provide login interface components:
- Login button in header (shown when not logged in)
- Login modal with GitHub login option
- Loading state during OAuth redirect
- User avatar and dropdown menu (shown when logged in)
- Logout option in dropdown menu

#### Scenario: Show login button
- **WHEN** user is not authenticated
- **THEN** the header displays "登录" button

#### Scenario: Show user menu
- **WHEN** user is authenticated
- **THEN** the header displays user avatar
- **AND** clicking avatar shows dropdown with user info and logout option

### Requirement: Post Management Interface
The system SHALL provide an admin interface at /admin for managing posts:
- Table listing all posts (drafts and published)
- Columns: title, category, created date, status
- Actions: view, toggle publish status, delete
- Confirmation dialog for delete action
- Toast notifications for action results

#### Scenario: Toggle post status
- **WHEN** admin clicks the publish/unpublish button
- **THEN** the system updates post status in database
- **AND** updates publishedAt timestamp accordingly
- **AND** shows success toast notification

#### Scenario: Delete post
- **WHEN** admin clicks delete and confirms
- **THEN** the system removes the post from database
- **AND** disconnects tag associations first
- **AND** shows success toast notification

### Requirement: Homepage Filtering
The system SHALL filter posts on the homepage:
- Only show posts with status "PUBLISHED"
- Management page shows all posts regardless of status

#### Scenario: View homepage
- **WHEN** any user visits the homepage
- **THEN** only published posts are displayed
- **AND** draft posts are hidden

## Environment Variables
The following environment variables are required:
- `GITHUB_CLIENT_ID`: GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App client secret
- `GITHUB_REDIRECT_URI`: OAuth callback URL (default: http://localhost:3000/auth/callback)

## API Key Authentication

### Requirement: API Key Data Model
The system SHALL provide an ApiKey model to support programmatic API access:
- Unique identifier (CUID)
- Name (string, for identifying the key's purpose)
- Key (string, unique, format: `sk_` + 48 random hex characters)
- User reference (foreign key)
- Last used timestamp (optional)
- Expiration timestamp (optional, null means never expires)
- Creation timestamp

#### Scenario: Generate API Key format
- **WHEN** a new API Key is created
- **THEN** the system generates a 48-character random hex string
- **AND** prefixes it with `sk_` for identification

### Requirement: API Key Management
The system SHALL provide CRUD operations for API Keys:
- Create: Generate new key with name and optional expiration
- List: Show user's keys with masked display (sk_xxx...xxxx)
- Delete: Remove key permanently
- Validate: Check key exists, not expired, and return associated user

#### Scenario: Create API Key
- **WHEN** admin creates a new API Key
- **THEN** the system generates a unique key
- **AND** displays the full key once (never shown again)
- **AND** stores the key in database

#### Scenario: List API Keys
- **WHEN** admin views API Key list
- **THEN** the system shows key name, masked key, created date, last used date
- **AND** keys are masked as `sk_xxxx...xxxx` (first 7 + last 4 characters)

#### Scenario: Delete API Key
- **WHEN** admin deletes an API Key
- **THEN** the system removes the key from database
- **AND** any requests using that key will fail

### Requirement: Dual Authentication Support
The system SHALL support both API Key and Session Token authentication for post creation:
- API Key: For programmatic access (scripts, CI/CD, external tools)
- Session Token: For web interface access
- API Key takes precedence if both are provided

#### Scenario: Authenticate with API Key
- **WHEN** a request includes `apiKey` parameter
- **THEN** the system validates the key exists and is not expired
- **AND** verifies the associated user has ADMIN role
- **AND** allows the operation if valid

#### Scenario: Authenticate with Session
- **WHEN** a request includes `sessionToken` parameter (no API Key)
- **THEN** the system validates the session exists and is not expired
- **AND** verifies the associated user has ADMIN role
- **AND** allows the operation if valid

### Requirement: HTTP API Endpoint
The system SHALL provide an HTTP API endpoint for external access:
- Endpoint: `POST /api/posts`
- Content-Type: `application/json`
- Request body: `{ apiKey, content, status?, coverImage? }`
- Response: Created post object or error message

#### Scenario: Create post via API
- **GIVEN** a valid API Key
- **WHEN** client sends POST request to `/api/posts`
- **THEN** the system authenticates using the API Key
- **AND** creates the post with AI-generated metadata
- **AND** returns the created post object

#### Scenario: API authentication failure
- **GIVEN** an invalid or expired API Key
- **WHEN** client sends POST request to `/api/posts`
- **THEN** the system returns 400 error with message

### Requirement: API Key Management UI
The system SHALL provide a management interface in the admin panel:
- Tab navigation between "文章管理" and "API Key"
- Form to create new key with name input
- Display newly created key with copy button
- Warning that key is only shown once
- Table listing existing keys with delete action
- Usage instructions with curl example
