# Phase 05: Workflow Automation Configuration Dashboard

## Context Links
- [src/App.tsx router](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [components/admin/admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)

## Overview
- Priority: Medium
- Status: Pending
- Description: Create an administrative configuration center in the React frontend at `/admin/settings/workflows` to configure rules, carriers, notification channels, states, and transition options.

## Key Insights
- Tabs-based organization (Statuses, Transitions, Notifications, Shipping, Automation) provides clean dashboard separation.

## Requirements
- Render config panels for statuses and transitions.
- Render config panels for notifications and shipping.
- Disable deletion / key modification for critical keys: completed, cancelled, paid, refunded, credited.

## Architecture
- React Settings component integrated into Router.

## Related Code Files
- `src/App.tsx` (Modify to add Route)
- `components/admin/admin-sidebar.tsx` (Modify to add Link)
- `src/pages/admin/AdminWorkflowSettingsPage.tsx` (New)

## Implementation Steps
1. Register `/admin/settings/workflows` route in `App.tsx` as a protected admin route.
2. Add a new menu item in `admin-sidebar.tsx` named "Cấu hình Workflow".
3. Create `src/pages/admin/AdminWorkflowSettingsPage.tsx`:
   - State & transition lists CRUD tables.
   - Notifications status checklist, showing "Chưa cấu hình" if provider settings are missing.
   - Shipping provider toggle switch list.
   - Automation rules table and placeholder triggers setup.
4. Integrate validation warning dialogs.

## Todo List
- [ ] Implement `AdminWorkflowSettingsPage.tsx` UI
- [ ] Connect settings panels to backend APIs
- [ ] Enforce frontend system critical key restrictions
- [ ] Add Sidebar link & route

## Success Criteria
- Admin can save new statuses and transitions.
- Deletions are blocked for system-critical keys on the UI.

## Risk Assessment
- Interface clutter. Mitigate by using sub-tabs or clean layout sections.

## Security Considerations
- Require admin token for retrieving and saving configurations.

## Next Steps
- Final verification in Phase 6.
