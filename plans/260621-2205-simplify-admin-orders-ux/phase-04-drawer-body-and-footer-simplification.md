# Phase 04: Drawer Body and Footer Simplification

## Overview
- **Priority**: High
- **Status**: pending
- **Description**: Redesign the multi-dimensional status widgets inside the drawer body with inline tags/buttons, refine the Slide-over footer split action bar, and simplify the confirm dialog interface.

## Related Code Files
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)

## Implementation Steps
1. Replace `<select>` items in status rows with inline `<button>` action lists retrieved from `getTransitionsForGroup()`. If no transitions exist, render `"Chưa có thao tác tiếp theo"`.
2. Refactor the Slide-over footer to display the main status on the left, and dynamic blue action buttons, red alert outline danger actions, or terminal status strings on the right, alongside a secondary grey `"Đóng"` button.
3. Clean up the confirmation dialog modal to use the title `"Xác nhận thao tác"`, and show simple descriptions, optional internal comments, and required reason inputs for dangerous updates.

## Success Criteria
- Technical jargon is replaced with simple shop-friendly controls.
- Confirmation modals do not show developer codes.
