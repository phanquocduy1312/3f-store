# Phase 01: Sidebar Navigation Restrictions

## Overview
- **Priority**: High
- **Status**: pending
- **Description**: Filter navigation links inside the admin sidebar to hide advanced configuration parameters for users who do not have system-level access roles.

## Requirements
- Read `admin_user` role from local storage session.
- Hide "Cấu hình Workflow" (`/admin/settings/workflows`) item from `menuItems` render loop if role is not `super_admin` or `dev`.

## Related Code Files
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)

## Implementation Steps
1. Retrieve and bind `adminRole` state in `AdminSidebar`.
2. Check `item.path === "/admin/settings/workflows"` and role in the rendering loop. If user does not meet the roles, return `null`.

## Success Criteria
- Normal admin accounts do not see the "Cấu hình Workflow" link in the sidebar.
