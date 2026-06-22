# Phase 02: Frontend Status Config Tab

## Context Links
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- [workflowApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/workflowApi.ts)

## Overview
- Priority: High
- Status: Pending
- Objective: Replace the advanced settings workflow link for normal admins and implement tabbed status settings.

## Requirements
1. **API Client Additions**:
   - Add frontend functions in `workflowApi.ts`:
     - `getOrderStatusConfig()`
     - `updateOrderStatusSetting(id, payload)`
     - `updateOrderTransitionSetting(id, payload)`
2. **Sidebar Updates**:
   - Verify `/admin/settings/workflows` is hidden for standard admin roles (which we already do, but double-check that it does not show for normal admins).
3. **Tabbed Layout**:
   - Add state: `activeTab = 'orders' | 'statuses'`.
   - Render tab buttons under the title: `"Danh sách đơn hàng"`, `"Cấu hình trạng thái"`.
4. **Status Configuration View**:
   - Render simple editable tables for:
     - **Main order statuses**: Display sort order, color preview, name/label, active status.
     - **Transitions**: Display from-to states mapped to friendly Vietnamese, action label, requires reason checkbox, active status.
   - Disable raw key editing. Allow inline modification of details (labels, color, sort order, requires reason, active) or through simplified modal edit forms.

## Related Code Files
- `src/pages/admin/AdminOrdersPage.tsx`
- `src/api/workflowApi.ts`

## Success Criteria
- Shop managers can edit order statuses and action names in Vietnamese without encountering raw keys.
- Modified status colors and labels immediately apply to order badges and slide-over actions.
