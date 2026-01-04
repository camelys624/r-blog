# media-management Specification

## Purpose
TBD - created by archiving change add-image-upload. Update Purpose after archive.
## Requirements
### Requirement: AI-Generated Cover Images
The system SHALL automatically generate cover images for blog posts using Azure OpenAI DALL-E 3:
- Generate images when user does not provide a cover image URL
- Use GPT-4o-mini to create descriptive prompts based on article title and content
- Generate modern, minimalist, professional blog cover images
- Return publicly accessible URL from Azure OpenAI
- Image size: 1792x1024 pixels

#### Scenario: Generate cover image for new post
- **WHEN** user saves a post without providing a cover image URL
- **THEN** the system calls GPT-4o-mini to generate an image prompt from title and first 500 characters of content
- **AND** calls DALL-E 3 with the generated prompt
- **AND** stores the returned Azure image URL in the post record

#### Scenario: Skip generation when URL provided
- **WHEN** user provides a cover image URL in the form
- **THEN** the system uses the provided URL directly
- **AND** does not call the AI image generation service

#### Scenario: Image prompt creation
- **WHEN** the system creates an image prompt from article content
- **THEN** GPT-4o-mini generates a concise English prompt (max 100 words)
- **AND** focuses on abstract concepts and visual metaphors
- **AND** explicitly excludes text from the image

### Requirement: AI-Generated Article Summaries
The system SHALL automatically generate summaries for blog posts using Azure OpenAI GPT-4o-mini:
- Generate Chinese summaries of 100-150 characters
- Use first 3000 characters of content for generation
- Summarize core viewpoints and main content
- Create engaging summaries that attract readers

#### Scenario: Generate summary for new post
- **WHEN** user saves a new post
- **THEN** the system calls GPT-4o-mini with title and truncated content
- **AND** generates a concise Chinese summary
- **AND** stores the summary in the post record

#### Scenario: Handle AI generation failure
- **WHEN** AI summary generation fails due to API error
- **THEN** the system throws an error with message "AI 生成摘要失败"
- **AND** post creation fails with appropriate error handling

### Requirement: Azure OpenAI Integration
The system SHALL integrate with Azure OpenAI service:
- Use AzureOpenAI client from openai package
- Configure via environment variables (endpoint, API key, API version)
- Support configurable deployment names for chat and image models
- Default to gpt-4o-mini for chat and dall-e-3 for images

#### Scenario: Azure OpenAI configuration
- **WHEN** the system initializes the AI client
- **THEN** it reads AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY from environment
- **AND** uses AZURE_OPENAI_API_VERSION with default '2024-08-01-preview'
- **AND** uses configurable deployment names for different models

#### Scenario: Image generation parameters
- **WHEN** DALL-E 3 generates a cover image
- **THEN** it uses size 1792x1024, quality standard, n=1
- **AND** appends style instructions for modern, vibrant, no-text images

