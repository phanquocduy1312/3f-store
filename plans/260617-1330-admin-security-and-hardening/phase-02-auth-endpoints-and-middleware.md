# Phase 2: Auth Endpoints & Router Middleware

Setup admin authentication controllers and integrate middleware protection in the Router.

## Context Links
- [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-01-database-and-backend-models.md)

## Requirements
- Create `AdminAuthController.php` implementing:
  - `login()`: accepts credentials, issues sessions, returns token.
  - `logout()`: revokes current active token.
  - `me()`: returns current logged-in admin data.
  - `bootstrap()`: allows seeding the initial admin account ONLY when `admin_users` is empty.
- Modify `Router.php` to intercept `/api/admin/...` routes:
  - Extract `Authorization: Bearer <token>` header.
  - Reject expired, invalid, or revoked tokens with JSON 401 and `{"success": false, "message": "Unauthorized"}`.
  - Exclude `/api/admin/auth/login` and `/api/admin/auth/bootstrap` from middleware protection.

## Related Code Files
- [NEW] [AdminAuthController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminAuthController.php)
- [MODIFY] [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Implementation Steps
1. Code `AdminAuthController.php` login/logout/me/bootstrap logic.
2. Register the routes in `index.php`.
3. Add a token checking helper in `Router.php` (or a dedicated middleware) and execute it inside the route dispatch method.
4. If authentication fails, immediately issue a JSON 401 response and terminate execution.

## Todo List
- [ ] Implement `AdminAuthController.php`
- [ ] Add auth endpoints to `index.php`
- [ ] Implement middleware validation inside `Router.php`
- [ ] Exclude login/bootstrap from auth checks

## Success Criteria
- Requesting `/api/admin/orders` without authorization header yields a JSON 401 error.
- Initial admin user can be created via `/api/admin/auth/bootstrap` once.
