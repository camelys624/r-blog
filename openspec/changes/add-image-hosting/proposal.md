# Change: Add Image Hosting Integration

## Why
AI-generated cover images from DALL-E 3 use temporary URLs that expire after a short period. Additionally, users need to paste images directly into the editor for a seamless writing experience. Both features require integration with a persistent image hosting service.

## What Changes
- Integrate with free image hosting service (SM.MS, imgbb, or similar)
- Auto-upload AI-generated cover images to get permanent URLs
- Support paste images in editor (Ctrl+V)
- Support drag-and-drop images in editor
- Insert Markdown image syntax after successful upload
- Show upload progress indicator

## Impact
- Affected specs: `media-management` (modified)
- Affected code:
  - `src/lib/image-host.ts` (new - image hosting client)
  - `src/lib/ai.ts` (modified - upload after generation)
  - `src/lib/post.api.ts` (modified - handle image upload)
  - `src/routes/editor.tsx` (modified - paste/drop handlers)
  - `src/components/upload-progress.tsx` (new - progress UI)
  - Environment variables: IMAGE_HOST_API_KEY
