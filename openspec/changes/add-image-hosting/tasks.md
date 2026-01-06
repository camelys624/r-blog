# Implementation Tasks

## 1. Image Hosting Client
- [x] 1.1 Research and select free image hosting service (SM.MS, imgbb, Cloudinary free tier)
- [x] 1.2 Create image-host.ts utility module
- [x] 1.3 Implement uploadImage function (accepts File or URL)
- [x] 1.4 Handle upload errors and retries
- [x] 1.5 Return permanent public URL

## 2. AI Image Persistence
- [x] 2.1 Modify generateCoverImage to upload result to image host
- [x] 2.2 Download DALL-E temporary image as blob
- [x] 2.3 Upload blob to image hosting service
- [x] 2.4 Return permanent URL instead of temporary URL
- [x] 2.5 Add fallback if upload fails (keep temporary URL with warning)

## 3. Editor Paste Support
- [x] 3.1 Add paste event listener to editor textarea
- [x] 3.2 Detect image data in clipboard (image/png, image/jpeg, etc.)
- [x] 3.3 Extract image file from clipboard event
- [x] 3.4 Upload image to hosting service
- [x] 3.5 Insert `![image](url)` at cursor position after upload
- [x] 3.6 Show inline upload progress indicator

## 4. Editor Drag-Drop Support
- [x] 4.1 Add dragover and drop event listeners
- [x] 4.2 Accept only image file types
- [x] 4.3 Upload dropped images to hosting service
- [x] 4.4 Insert markdown image syntax at drop position
- [x] 4.5 Support multiple images dropped simultaneously

## 5. Upload Progress UI
- [x] 5.1 Create upload progress component (spinner or percentage)
- [x] 5.2 Show uploading state in editor
- [x] 5.3 Display success/error notifications
- [x] 5.4 Handle concurrent uploads with separate progress tracking

## 6. API Route (Optional)
- [x] 6.1 Create /api/upload server function if client-side upload not possible
- [x] 6.2 Accept multipart form data
- [x] 6.3 Validate file type and size
- [x] 6.4 Proxy upload to image hosting service
- [x] 6.5 Return uploaded image URL
