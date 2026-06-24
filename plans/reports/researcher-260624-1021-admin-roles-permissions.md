# Researcher Report: Admin Role-Based Access Control (RBAC)
**Date**: 2026-06-24
**Time**: 10:21
**Task Slug**: admin-roles-permissions

## 1. Roles & Permissions Matrix
We will establish 5 operational roles matching standard retail/store management hierarchies:
- **dev** (Developer): Full system control, database queries, SMTP, Groq/OCR keys, workflow management.
- **super_admin** (Owner): Store configuration, admin user CRUD, financial analytics, discount codes, customer profiles.
- **manager** (Store Manager): Product CRUD, inventory, order processing, viewing product reviews. Cannot edit SMTP, keys, workflows, or manage admins.
- **editor** (Marketing/Editor): Blog news management, banners, vouchers, viewing products. Cannot view financial reports or process orders.
- **cskh** (Customer Support): Reading customers profile, AI Pet Advisor diagnostics history, order tracking. Read-only permissions on products and reports.

| Permission | dev | super_admin | manager | editor | cskh |
|---|:---:|:---:|:---:|:---:|:---:|
| `manage_system` (Keys/SMTP) | Yes | No | No | No | No |
| `manage_workflows` | Yes | No | No | No | No |
| `manage_admins` | Yes | Yes | No | No | No |
| `view_analytics` | Yes | Yes | Yes (Sales) | No | No |
| `manage_products` | Yes | Yes | Yes | Yes (Read) | Yes (Read) |
| `manage_orders` | Yes | Yes | Yes | No | Yes (Read) |
| `manage_marketing` (Banners/Vouchers) | Yes | Yes | Yes | Yes | No |
| `manage_news` | Yes | Yes | Yes | Yes | No |
| `view_crm` | Yes | Yes | Yes | No | Yes |

## 2. Backend Route & Middleware Design
- **AuthMiddleware Enhancements**: Add `AuthMiddleware::requireRole(array $allowedRoles)` or `AuthMiddleware::requirePermission(string $permission)`.
- **Expose Admin Accounts API**:
  - `GET /api/admin/accounts` -> `AdminUserController::list` (Requires `manage_admins`)
  - `POST /api/admin/accounts` -> `AdminUserController::create` (Requires `manage_admins`)
  - `PUT /api/admin/accounts/:id` -> `AdminUserController::update` (Requires `manage_admins`)
  - `DELETE /api/admin/accounts/:id` -> `AdminUserController::delete` (Requires `manage_admins` - new controller method to implement).

## 3. UI/UX Specifications
- **Admin Management Screen** (`/admin/accounts`):
  - Accessible only to roles `dev` and `super_admin`.
  - Bento grid list view of all administrative accounts (Name, Email, Role badges, Status toggle).
  - Dialog modal for adding staff, updating role, and changing staff passwords.
- **Dynamic Sidebar**: Exclude menu items that require permissions the logged-in admin does not have.
- **Action-level Guards**: Hide edit/delete actions for users lacking write permissions (e.g. `cskh` viewing products will not see "Thêm sản phẩm" or edit buttons).
