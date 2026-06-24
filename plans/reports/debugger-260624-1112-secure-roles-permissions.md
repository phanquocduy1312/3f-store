# Debugger Report: Admin Roles and Security Hardening

Date: 260624
Time: 1112
Slug: secure-roles-permissions

## 1. Investigation Findings & Root Cause Analysis

- **Self-Role Modification / Lockout**:
  - The frontend `AccountFormModal.tsx` allowed admins to edit their own user card, select other roles (like `cskh`), and toggle active status.
  - The backend `AdminUserController::update()` lacked strict self-editing check validations. If a logged-in admin updated themselves, they could change their own role or deactivate themselves, locking themselves out of the admin panel.

- **Privilege Escalation**:
  - Logged-in administrators with the `accounts` permission (such as standard `manager` roles) could modify, create, or delete top-tier administrative accounts (`dev`, `admin`, `super_admin`) or assign these roles to standard accounts, thereby elevating privileges.

- **Authorization Bypass**:
  - `AuthMiddleware::requireAdmin()` parsed `$path` from `REQUEST_URI`. When endpoints were requested via the `?route=` fallback query parameter (e.g. `?route=admin.loyalty.point_rules`), the path extracted was `/public/index.php`.
  - Since `/public/index.php` did not match any prefix conditions (like `/api/admin/loyalty`), the middleware skipped prefix-based permission enforcement and allowed any logged-in administrator to access the endpoint without verifying their specific permission.

## 2. Proposed Fixes

- **AuthMiddleware Path Resolution**:
  - Implement path normalization in `AuthMiddleware::requireAdmin()` to resolve correct virtual paths from both path info and the `route` query string param, aligning with `Router.php`'s mappings.
  - Map `/api/admin/shopee` prefix to `club_3f` permission.
  - Map `/api/admin/dashboard` prefix to `dashboard` permission.

- **AdminUserController Hardening**:
  - Implement strict verification blocks to reject any self-role changes or self-deactivation.
  - Isolate top-tier roles (`dev`, `admin`, `super_admin`) so only users with those roles can create, update, or delete accounts associated with them, or assign those roles to others.

- **Frontend Disabling**:
  - Disable "Role" select and "Kích hoạt" checkbox if the edited account matches the currently logged-in user.
  - Filter out top-tier roles from the list if the logged-in user is not a top-tier administrator.

- **Automated Verification**:
  - Write `scripts/test-roles-permissions.php` to simulate backend requests and assert correct behavior.

## 3. Unresolved Questions
- None.
