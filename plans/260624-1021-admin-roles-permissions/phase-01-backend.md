# Phase 1: Backend API & Authorization Middleware

**Context Links**:
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1021-admin-roles-permissions/plan.md)
- [AuthMiddleware.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/AuthMiddleware.php)
- [AdminUserController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminUserController.php)

## Overview
- **Priority**: High
- **Status**: Planning
- **Description**: Implement backend permission logic and expose administrator management endpoints.

## Requirements
### Functional
- Add helper method `AuthMiddleware::requireRole(array $allowedRoles)` to enforce allowed roles.
- Add helper method `AuthMiddleware::requirePermission(string $permission)` using a hardcoded permission matrix matching the roles `dev`, `super_admin`, `manager`, `editor`, `cskh`.
- Expose endpoints in `3f-api/public/index.php`:
  - `GET /api/admin/accounts` -> `AdminUserController::list`
  - `POST /api/admin/accounts` -> `AdminUserController::create`
  - `PUT /api/admin/accounts/:id` -> `AdminUserController::update`
  - `DELETE /api/admin/accounts/:id` -> `AdminUserController::delete`
- Fix authorization checks inside `AdminUserController.php` (allow `super_admin` and `dev` instead of just exactly `'admin'`).
- Add a soft/hard `delete` method in `AdminUserController.php` to remove staff accounts safely.

## Related Code Files
- `3f-api/app/Helpers/AuthMiddleware.php` [MODIFY]
- `3f-api/app/Controllers/AdminUserController.php` [MODIFY]
- `3f-api/public/index.php` [MODIFY]

## Implementation Steps
1. **Modify `AuthMiddleware.php`**:
   - Add `$rolePermissions` matrix matching the researcher specification.
   - Implement `requireRole` and `requirePermission` methods.
2. **Modify `AdminUserController.php`**:
   - Update `list`, `create`, and `update` check to allow `super_admin` and `dev`.
   - Add `delete($id)` action method that validates the user cannot delete themselves, then calls `AdminUser` model to remove or disable.
3. **Register routes in `index.php`**:
   - Bind `/api/admin/accounts` and individual route endpoints.

## Todo List
- `[ ]` Define permission matrix and role checker in `AuthMiddleware.php`.
- `[ ]` Refactor authorization checks in `AdminUserController.php`.
- `[ ]` Implement delete endpoint in `AdminUserController.php`.
- `[ ]` Map endpoints in `3f-api/public/index.php`.

## Success Criteria
- Backend builds and runs without exception.
- Querying `/api/admin/accounts` as a normal `cskh` or `editor` returns `403 Forbidden`.
- Querying as `super_admin` or `dev` returns lists of admin users successfully.
