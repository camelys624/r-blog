# Implementation Tasks

## 1. Object Storage Setup
- [ ] 1.1 Choose storage provider (AWS S3, Cloudflare R2, or other S3-compatible)
- [ ] 1.2 Create storage bucket with public read access
- [ ] 1.3 Configure CORS policy for browser uploads (if using presigned URLs)
- [ ] 1.4 Set up environment variables for credentials

## 2. Storage Client
- [ ] 2.1 Install storage SDK (@aws-sdk/client-s3 or equivalent)
- [ ] 2.2 Create storage utility module (`lib/storage.ts`)
- [ ] 2.3 Implement uploadFile function with error handling
- [ ] 2.4 Generate unique filenames using UUID or timestamp + hash
- [ ] 2.5 Return public URL after successful upload

## 3. API Endpoint
- [ ] 3.1 Create `/app/api/upload/route.ts` with POST handler
- [ ] 3.2 Parse multipart/form-data file uploads
- [ ] 3.3 Validate file type (whitelist: image/jpeg, image/png, image/gif, image/webp)
- [ ] 3.4 Validate file size (max 5MB per file)
- [ ] 3.5 Handle multiple file uploads in single request
- [ ] 3.6 Call storage client to upload files
- [ ] 3.7 Return JSON response with uploaded URLs and metadata
- [ ] 3.8 Implement error responses for validation failures

## 4. Editor Integration
- [ ] 4.1 Create Milkdown upload plugin or use existing plugin
- [ ] 4.2 Intercept paste events for image data
- [ ] 4.3 Intercept drop events for image files
- [ ] 4.4 Show upload progress indicator (spinner or percentage)
- [ ] 4.5 Call `/api/upload` endpoint with FormData
- [ ] 4.6 Insert markdown image syntax `![alt](url)` after successful upload
- [ ] 4.7 Handle upload errors with user-friendly messages
- [ ] 4.8 Support concurrent multiple image uploads

## 5. UI Components
- [ ] 5.1 Add image upload button to editor toolbar
- [ ] 5.2 Create file picker dialog for manual selection
- [ ] 5.3 Display upload progress for each image (if multiple)
- [ ] 5.4 Show success/error notifications
- [ ] 5.5 Add image preview before insertion (optional)

## 6. Error Handling & Edge Cases
- [ ] 6.1 Handle network failures with retry mechanism
- [ ] 6.2 Clean up failed uploads (delete from storage if partially uploaded)
- [ ] 6.3 Handle oversized files gracefully
- [ ] 6.4 Validate image dimensions (optional: reject extremely large dimensions)
- [ ] 6.5 Test with various image formats and edge cases
