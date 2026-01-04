# Implementation Tasks

## 1. Image Hosting Client
- [ ] 1.1 Research and select free image hosting service (SM.MS, imgbb, Cloudinary free tier)
- [ ] 1.2 Create image-host.ts utility module
- [ ] 1.3 Implement uploadImage function (accepts File or URL)
- [ ] 1.4 Handle upload errors and retries
- [ ] 1.5 Return permanent public URL

## 2. AI Image Persistence
- [ ] 2.1 Modify generateCoverImage to upload result to image host
- [ ] 2.2 Download DALL-E temporary image as blob
- [ ] 2.3 Upload blob to image hosting service
- [ ] 2.4 Return permanent URL instead of temporary URL
- [ ] 2.5 Add fallback if upload fails (keep temporary URL with warning)

## 3. Editor Paste Support
- [ ] 3.1 Add paste event listener to editor textarea
- [ ] 3.2 Detect image data in clipboard (image/png, image/jpeg, etc.)
- [ ] 3.3 Extract image file from clipboard event
- [ ] 3.4 Upload image to hosting service
- [ ] 3.5 Insert `![image](url)` at cursor position after upload
- [ ] 3.6 Show inline upload progress indicator

## 4. Editor Drag-Drop Support
- [ ] 4.1 Add dragover and drop event listeners
- [ ] 4.2 Accept only image file types
- [ ] 4.3 Upload dropped images to hosting service
- [ ] 4.4 Insert markdown image syntax at drop position
- [ ] 4.5 Support multiple images dropped simultaneously

## 5. Upload Progress UI
- [ ] 5.1 Create upload progress component (spinner or percentage)
- [ ] 5.2 Show uploading state in editor
- [ ] 5.3 Display success/error notifications
- [ ] 5.4 Handle concurrent uploads with separate progress tracking

## 6. API Route (Optional)
- [ ] 6.1 Create /api/upload server function if client-side upload not possible
- [ ] 6.2 Accept multipart form data
- [ ] 6.3 Validate file type and size
- [ ] 6.4 Proxy upload to image hosting service
- [ ] 6.5 Return uploaded image URL
