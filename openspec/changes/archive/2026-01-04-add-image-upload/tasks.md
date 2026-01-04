# Implementation Tasks

## 1. Azure OpenAI Setup
- [x] 1.1 Install openai package for Azure OpenAI SDK
- [x] 1.2 Configure environment variables (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY)
- [x] 1.3 Set up AzureOpenAI client with API version

## 2. Cover Image Generation
- [x] 2.1 Create generateCoverImage function in lib/ai.ts
- [x] 2.2 Use GPT-4o-mini to generate image prompts from article content
- [x] 2.3 Call DALL-E 3 with generated prompt
- [x] 2.4 Configure image size (1792x1024) and style parameters
- [x] 2.5 Return public Azure image URL

## 3. Summary Generation
- [x] 3.1 Create generateSummary function in lib/ai.ts
- [x] 3.2 Use GPT-4o-mini to generate Chinese summaries
- [x] 3.3 Truncate content to 3000 characters for API call
- [x] 3.4 Return 100-150 character summary

## 4. Integration
- [x] 4.1 Call AI functions from createPost server function
- [x] 4.2 Generate cover image when URL not provided
- [x] 4.3 Generate summary for all new posts
- [x] 4.4 Handle AI generation errors gracefully
