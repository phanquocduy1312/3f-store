# Cook Report: Fix News Editor Empty Content

## Overview
- Bug: When editing a news article, the editor body (TiptapEditor) remains completely empty even though other details (title, featured image) are populated.
- Root Cause: 
  - `AdminNewsEditorPage` was fetching the post from the paginated listing endpoint (`adminGetBlogPosts`).
  - The backend list endpoint uses `BlogPost::getPaginated`, which explicitly excludes the `content` column for performance reasons.
  - As a result, `content` was undefined, leaving the text editor blank.
- Date: 2026-06-22
- Time: 14:33

## Changes Implemented

### 1. Database Model (`3f-api/app/Models/BlogPost.php`)
- Added `getById($id)` to select all columns (including `content`) by post ID.

### 2. Backend Controller & Routing (`3f-api/app/Controllers/BlogPostController.php` & `3f-api/public/index.php`)
- Added `adminGetDetail()` to fetch the full blog post details by ID.
- Registered new secure route `GET /api/admin/blog-posts/:id` handled by `BlogPostController::adminGetDetail`.

### 3. Frontend API Client (`src/api/blogApi.ts`)
- Added `adminGetBlogPostDetail(id: number)` to perform a `GET` request on the new ID-based backend endpoint.

### 4. News Editor Page (`src/pages/admin/AdminNewsEditorPage.tsx`)
- Changed `useEffect` fetching logic to call `adminGetBlogPostDetail(Number(id))` to retrieve the complete post details (including `content`) rather than looking it up inside the list response.

## Verification & Compilation
- Ran `npm run build` locally: completed successfully with zero compilation or linting errors.
- Ran `python scripts/deploy_ftp.py` to deploy updated PHP controllers, model, and routing to the staging Plesk server.
