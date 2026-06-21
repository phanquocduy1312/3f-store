# Phase 02: Advanced Configurations Route Warning

## Overview
- **Priority**: High
- **Status**: pending
- **Description**: Add role restrictions and warning overlays inside the advanced workflow settings page in case normal users access it directly via URL typing.

## Related Code Files
- [AdminWorkflowSettingsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminWorkflowSettingsPage.tsx)

## Implementation Steps
1. Retrieve `admin_user` role on component mount and store it in `adminRole` state.
2. Render a full-height centered warning dialog if `adminRole !== "super_admin" && adminRole !== "dev"`, explaining that this is a system admin page and provide a redirect button back to `/admin/orders`.

## Success Criteria
- Typing the settings URL manually on a non-super-admin account shows the access restricted message and blocks data fetching.
