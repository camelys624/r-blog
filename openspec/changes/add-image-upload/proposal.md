# Change: Add Image Upload Functionality

## Why
Content creators need to embed images in blog posts. The editor should allow pasting images from clipboard or selecting files, automatically upload them to object storage, and insert markdown image links. Without this, users cannot include visual content in their posts.

## What Changes
- Create `/api/upload` API endpoint to handle image uploads
- Integrate with object storage service (S3-compatible: AWS S3, Cloudflare R2, etc.)
- Implement Milkdown plugin for paste/drop image handling
- Support multiple concurrent uploads with individual progress tracking
- Generate unique filenames to prevent conflicts
- Validate file types (JPEG, PNG, GIF, WebP) and size limits (max 5MB per image)
- Return public URLs for uploaded images
- Insert markdown image syntax into editor after successful upload

## Impact
- Affected specs: `media-management` (new capability)
- Affected code:
  - `app/api/upload/route.ts` (new)
  - `lib/storage.ts` (new - object storage client)
  - `components/Editor/plugins/upload-plugin.tsx` (new)
  - Environment variables: Add storage credentials (S3_BUCKET, S3_REGION, S3_ACCESS_KEY, etc.)
  - Dependencies: Add AWS SDK or storage client library
