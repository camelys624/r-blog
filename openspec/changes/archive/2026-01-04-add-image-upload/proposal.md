# Change: Add AI-Generated Cover Images

## Why
Content creators benefit from automatic cover image generation for their blog posts. Using AI (Azure OpenAI DALL-E 3) eliminates the need to manually source or create images, while GPT-4o-mini generates engaging article summaries automatically.

## What Changes
- Integrate Azure OpenAI (DALL-E 3) for automatic cover image generation
- Integrate Azure OpenAI (GPT-4o-mini) for article summary generation
- Generate image prompts based on article title and content
- Create modern, minimalist cover images without text
- Generate Chinese summaries (100-150 characters) for posts
- Allow manual cover image URL input as alternative

## Impact
- Affected specs: `media-management` (new capability)
- Affected code:
  - `src/lib/ai.ts` (new - Azure OpenAI client)
  - `src/lib/post.api.ts` (modified - calls AI functions)
  - Environment variables: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION
  - Dependencies: openai (Azure OpenAI SDK)
