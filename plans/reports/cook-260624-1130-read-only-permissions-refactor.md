# Cook Report: Read-Only Access Refactoring

Date: 260624
Time: 1130
Slug: read-only-permissions-refactor

## 1. Context & Goals
The user requested to change the authorization policy:
- Instead of hiding sidebar links and restricting entire page access for users who lack specific permissions (Access Denied), we now allow **any logged-in administrator** to view all pages in the admin dashboard (read-only access).
- Users without specific permissions will **not have editing/creating/deleting rights** on those pages (all edit controls, buttons, forms, and operations will be hidden, disabled, or blocked).

## 2. Proposed Changes

### Backend changes
Modify [AuthMiddleware.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/AuthMiddleware.php):
- Skip permission checking inside `requireAdmin()` and `requirePermission()` if the request HTTP method is `GET`. This enables read-only API calls (fetching lists, details, stats) for any authenticated administrator.
- Keep permission checks fully active for write methods (`POST`, `PUT`, `DELETE`, `PATCH`).

### Frontend changes
1. Modify [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx):
   - Set `isPathVisible` to always return `true`. This makes all sidebar links visible to all administrators.
2. Modify [AccountsTable.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/accounts/AccountsTable.tsx):
   - Add `admin` and `super_admin` role cases to `getRoleBadge` so that administrator roles are properly rendered instead of falling back to the `cskh` badge style.
   - Accept a `hasEditAccess` prop.
   - Disable/hide editing and deleting buttons if `hasEditAccess` is `false`.
3. Modify [RolesTab.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/accounts/RolesTab.tsx):
   - Accept a `hasEditAccess` prop.
   - Hide the "Thêm vai trò mới" button if `hasEditAccess` is `false`.
   - Disable edit/delete buttons for roles in the table if `hasEditAccess` is `false`.
4. Modify [AdminAccountsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminAccountsPage.tsx):
   - Allow any logged-in administrator to view the page (`isAuthorized` set to `true`).
   - Define a `hasEditAccess` boolean based on permissions (`role === 'dev' || role === 'admin' || perms.includes('accounts')`).
   - Hide the "Thêm nhân sự mới" button and pass `hasEditAccess` to `<AccountsTable />` and `<RolesTab />` if they don't have write access.
5. Modify [AdminAnalyticsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminAnalyticsPage.tsx):
   - Allow any logged-in administrator to view the page (`isAuthorized` set to `true`).

## 3. Verification & Deployment Plan
- Deploy the updated PHP files via FTP using the python deployment script.
- Verify using manual tests that a CSKH user can view the Accounts Page and Analytics Page but cannot perform edit actions.
