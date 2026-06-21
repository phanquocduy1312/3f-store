# Development Report: Simplify Admin Orders UX

- **Date**: 2026-06-21
- **Time**: 22:10
- **Task Slug**: simplify-admin-orders-ux
- **Status**: **COMPLETED & VERIFIED**

---

## 1. Description of Changes
To simplify order processing for normal shop administrators and align the UI with the requested scope, we implemented the following changes:

### A. Sidebar Navigation Filter
- Restricted the **"Cấu hình Workflow"** link (`/admin/settings/workflows`) in [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) to check the admin's role from local storage. The navigation option is now hidden for standard roles and is visible only to `super_admin` and `dev`.

### B. Configuration Page Warning
- In [AdminWorkflowSettingsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminWorkflowSettingsPage.tsx), added role-based route blocking that prevents database fetches and displays a centered warning dialog stating: `"Khu vực cấu hình nâng cao, chỉ dành cho quản trị hệ thống."` alongside a redirect shortcut button to return to orders management.

### C. Fallback Transitions Mapping
- Defined static mapping tables representing standard state transition rules inside [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx) for all four state dimensions (`order`, `payment`, `shipping`, `loyalty`).
- Implemented `getTransitionsForGroup` selector which fetches backend configuration rules if configured, and falls back to static maps if backend tables are empty.

### D. Inline Action Buttons inside Slide-over Drawer
- Replaced the select dropdown boxes in the Slide-over body cards with simple, inline Vietnamese buttons. If no actions are available, it displays a friendly note: `"Chưa có thao tác tiếp theo"`.
- Refactored the sticky split-action footer:
  - Left side shows the primary order status label and badge.
  - Right side renders a secondary close button (**"Đóng"**) and dynamic next-step actions. Dangerous actions use an outline-red warning alert style, while standard transitions use a solid blue primary action style. Finished states display friendly completed/cancelled texts.
- Simplified the confirmation modal title to `"Xác nhận thao tác"`, formatted descriptions to hide raw technical keys, and labeled comments as `"Ghi chú nội bộ"` (optional) and `"Lý do thay đổi"` (required for dangerous actions).

---

## 2. Verification & Build
- **Type Checking**: Run `npx tsc --noEmit` which completed successfully with **0 errors**.
- **Production Build**: Run `npm run build` which compiled and bundled successfully in 6.69 seconds.

---

## 3. Unresolved Questions
* None.
