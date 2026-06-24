# Phase 2: Frontend Layout, Routes & Action Guards

**Context Links**:
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1021-admin-roles-permissions/plan.md)
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)

## Overview
- **Priority**: High
- **Status**: Planning
- **Description**: Implement UI screens for staff account management and enforce page/action blocks based on active admin roles.

## Requirements
### Functional
- Create `AdminAccountsPage.tsx` under route `/admin/accounts`:
  - List of admins (name, email, role badge, active state).
  - Create staff dialog modal (requires name, email, password, role select dropdown).
  - Edit staff modal (update role, reset password, change status).
  - Admin logs check link (integrating Audit log records).
- Add navigation route guarding in `App.tsx` matching role permissions. Redirect to `/admin` or show an unauthorized block if accessing forbidden pages.
- Dynamically filter the list of sidebar menu links in `admin-sidebar.tsx`.
- Hide or disable operational buttons ("Thêm", "Sửa", "Xóa") on Product form, Voucher list, Banner list, and Category list for restricted roles.

## Related Code Files
- `src/pages/admin/AdminAccountsPage.tsx` [NEW]
- `src/App.tsx` [MODIFY]
- `components/admin/admin-sidebar.tsx` [MODIFY]
- `src/pages/admin/AdminProductsPage.tsx` [MODIFY]
- `src/pages/admin/AdminVouchersPage.tsx` [MODIFY]

## Implementation Steps
1. **Develop `AdminAccountsPage.tsx`**:
   - Build page shell with sidebar/header collapse state.
   - Embed pagination list, search, and dynamic role badges with matching colors (e.g. `dev` is violet, `super_admin` is red, `manager` is blue, `editor` is green, `cskh` is slate).
   - Hook CRUD fetch callbacks to `/api/admin/accounts`.
2. **Update `App.tsx`**:
   - Register `/admin/accounts` route.
   - Implement route checks on `AdminRouteGuard` or individual routes: redirect if unauthorized.
3. **Filter Sidebar links in `admin-sidebar.tsx`**:
   - Add `"Nhân sự"` item pointing to `/admin/accounts`.
   - Update sidebar mapping loop: verify the current admin's role permits visibility before rendering.
4. **Implement UI Element Guards**:
   - Inspect role state from localStorage.
   - Hide or disable sensitive fields and deletion buttons for lower-tier admin roles.

## Todo List
- `[ ]` Create `src/pages/admin/AdminAccountsPage.tsx` file and build list tables.
- `[ ]` Code Add / Edit Account modal forms and bind actions.
- `[ ]` Register `/admin/accounts` route path in `App.tsx`.
- `[ ]` Update `admin-sidebar.tsx` menuItems and permission checking logic.
- `[ ]` Integrate element-level role guards on list views.

## Success Criteria
- Typecheck passes cleanly.
- Restricted accounts cannot see or open admin lists, and their sidebar menu items are automatically filtered out.
