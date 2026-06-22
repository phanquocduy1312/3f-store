# Phase 03: Frontend Integration & Fallback Control

## Context Links
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)

## Overview
- Priority: High
- Status: Pending
- Objective: Restructure frontend behavior for status transitions to prefer backend controls, clean up UI labels, and toast notifications.

## Requirements
1. **Prefer Backend Allowed Transitions**:
   - Query transitions endpoint when order detail loads.
   - If backend list is non-empty, use only the backend list.
   - If empty, check if state is known terminal (e.g., `completed`, `cancelled`, `return_completed`). Do not show fallback controls if terminal.
   - If non-terminal and empty, show fallback controls, log a warning console log (no UI warnings).
2. **Translate Confirm Modal Text**:
   - In confirmation modals, replace technical keys like `delivered` or `return_requested` with clean Vietnamese text ("Giao thành công", "Yêu cầu đổi / trả").
3. **Friendly Toast Notifications**:
   - Translate backend transition rule error strings (such as "Quy trình chuyển đổi trạng thái... không được phép") to user-friendly Vietnamese notifications.
   - For terminal errors, show: "Đơn hàng đã ở trạng thái cuối, không thể chuyển tiếp."

## Related Code Files
- `src/pages/admin/AdminOrdersPage.tsx`

## Success Criteria
- Action buttons matches backend rules.
- Confirm dialog contains proper Vietnamese translations.
- Error alerts display friendly texts.
