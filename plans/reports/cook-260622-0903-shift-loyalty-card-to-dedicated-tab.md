# Progress Report: Shift Loyalty Card to Dedicated Left Tab & Profile Upload / News Editor Fixes

- **Date**: 2026-06-22
- **Task Description**: Shifting the 3F Club membership card out of the Profile page into its own navigation tab on the left sidebar, and fixing avatar upload, CORS, and news editor routing issues.
- **Actions Taken**:
  1. Verified that the `Award` icon and "Thành viên 3F Club" navigation link point to `/account/club` in the left sidebar ([AccountShell.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountShell.tsx)).
  2. Verified that `/account/club` route is active and dynamically renders [ClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ClubPage.tsx).
  3. Verified that the old inline 3F Club card states and elements have been completely cleaned out of [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx).
  4. **Fixed CORS Blockage**: Appended `PATCH` to the `Access-Control-Allow-Methods` header in the backend's CORS helper ([cors.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/cors.php)) to allow profile updates to succeed without preflight errors.
  5. **Fixed Customer Avatar Path Resolution**:
     - Imported and applied the `buildImageUrl` helper in [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx), [AccountShell.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountShell.tsx), and [AccountLayout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AccountLayout.tsx) to correctly map relative `/uploads/avatars/...` database records to their absolute backend URL.
     - Upgraded the backend `uploadAvatarImage` function in [UploadService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/UploadService.php) to automatically return the absolute URL utilizing configured `public_url`.
  6. **Fixed Admin News Editor Routing**: Registered the missing routes `/admin/news/new` and `/admin/news/:id/edit` pointing to [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx) inside [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) to prevent blank pages when adding or editing posts.
  7. Verified that client code builds successfully for production (`npm run build` completed with 0 errors).
  8. Deployed updated backend controllers, services, and helpers to the staging server using `python scripts/deploy_ftp.py`.
  9. Updated the project changelog ([project-changelog.md](file:///c:/Users/Admin/Downloads/ccc/docs/project-changelog.md)) and roadmap ([project-roadmap.md](file:///c:/Users/Admin/Downloads/ccc/docs/project-roadmap.md)).
