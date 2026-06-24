# Cook Report: Remove Workflow Settings Page

- **Date**: 2026-06-24
- **Time**: 11:02
- **Task Slug**: remove-workflow-settings
- **Status**: Completed

This report documents the removal of the "Cấu hình Workflow" (Advanced Workflow Settings) feature from the administration portal.

## 1. Accomplished Tasks

### Frontend Cleanup
- **Sidebar**: Deleted the "Cấu hình Workflow" item from `menuItems` in `components/admin/admin-sidebar.tsx`.
- **Permissions Grid**: Removed the "workflows" checkbox key from `AVAILABLE_PERMISSIONS` in `components/admin/accounts/RoleFormModal.tsx`.
- **Routing**: Removed the import and route path matching `/admin/settings/workflows` from `src/App.tsx`.

### Backend Alignment
- **Middleware**: Updated `AuthMiddleware.php` to map `/api/admin/workflows` and `/api/admin/order-shipping-methods` to the `orders` permission key instead of the removed `workflows` permission.
- **Default Permissions**: Removed `"workflows"` from the default system permissions array returned on login and session checks in `AdminAuthController.php`.
- **Schema Seeding**: Updated `database/admin_schema.sql` to exclude `"workflows"` from the default Developer role seed permissions.

### Deployment & Verification
- Compiled project locally using `npm run build` (**Success, 0 errors**).
- Uploaded backend changes to Plesk staging server (`trial1506895.mbws.vn`) via `deploy_ftp.py`.
- Pushed all local commits to remote GitHub `dev` branch.
