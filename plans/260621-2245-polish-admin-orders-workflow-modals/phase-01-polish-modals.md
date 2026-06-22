# Phase 1: Polish and Harden Modals

## Context Links
- Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2245-polish-admin-orders-workflow-modals/plan.md)
- Frontend Page: [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- Backend API Controller: [WorkflowController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/WorkflowController.php)

## Overview
- Priority: High
- Status: Completed
- Description: Polish UI wording, add warning confirms, and restrict deactivation of system-critical elements.

## Requirements
### Functional
1. Edit Status Modal:
   - "Mã hệ thống (không thể sửa)" is read-only.
   - Helper text explaining purpose.
   - Disable checkbox if status key is critical or has active transitions.
2. Edit Transition Modal:
   - "Đang sử dụng bước chuyển này" checkbox label.
   - Helper description for required reasons.
   - Warning confirm dialog on disabling critical default transitions.
   - Force `requires_reason` on dangerous transitions.
3. Validate and disable "Lưu thay đổi" if inputs are invalid.
4. Backend API blocks deactivating critical statuses and enforces reasons on danger transitions.

## Related Code Files
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- [WorkflowController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/WorkflowController.php)

## Todo List
- [x] Update frontend Edit Status modal fields and warnings.
- [x] Update frontend Edit Transition modal fields, default checks, and confirmation interceptors.
- [x] Enforce backend validation guards in `WorkflowController.php`.
- [x] Verify build with `npx tsc --noEmit` and `npm run build`.

## Success Criteria
- No typescript errors.
- Visual elements meet specifications.
- Dangerous transitions/critical statuses are protected.
