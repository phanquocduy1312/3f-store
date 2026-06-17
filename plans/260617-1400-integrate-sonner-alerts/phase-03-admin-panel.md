# Phase 3: Admin Panel Alert Replacements

## Context Links
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- [ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx)

## Overview
- Priority: Medium
- Status: Todo
- Description: Clean up browser alerts in the admin interface.

## Related Code Files
- `src/pages/admin/AdminOrdersPage.tsx` (modify)
- `components/admin/shopee/ShopeeManualRequestModal.tsx` (modify)

## Implementation Steps
1. Import `toast` from `sonner`.
2. In `AdminOrdersPage.tsx`: Replace state updates and payments tracking status alert popups with `toast.success` and `toast.error`.
3. In `ShopeeManualRequestModal.tsx`: Replace size checks and success response window.alerts with `toast.warning`/`toast.success`.

## Todo List
- [ ] Replace alerts in AdminOrdersPage
- [ ] Replace alerts in ShopeeManualRequestModal

## Success Criteria
- Admin tasks trigger toasts instead of modal browser dialogs.
