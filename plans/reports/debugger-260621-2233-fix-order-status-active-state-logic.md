# Debugger Report: Fix Order Status Active State Logic

**Date**: 2026-06-21
**Time**: 22:33
**Task Slug**: fix-order-status-active-state-logic

## 1. Problem Root Cause
* **Active Flag Seed Issue**: The 7th element (`is_active`) for default order statuses in `Order.php::migrate()` seed data was incorrectly configured to `0` (inactive) for most states. This caused the UI to show "Đang dùng = Tắt" for crucial statuses like "Đã xác nhận", "Đang chuẩn bị hàng", etc.
* **Non-Idempotent Seeding**: Seeding checked `COUNT(*) === 0` to skip execution, meaning any subsequent migration fixes did not propagate to the remote database tables.
* **Terminal Status Flags**: The `is_terminal` flag for `delivered` was set to `1` in the database, causing it to block transitions to `completed` and `return_requested`.
* **Missing Guard**: Standard admins could toggle off statuses that were active parts of the workflow transitions, breaking the drawer button operations.

## 2. Resolved Changes

### A. Idempotent & Corrected Database Seeding
* Updated `workflow_statuses` seed list in [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php#L88) to set `is_active = 1` for all 12 default main order statuses.
* Set `is_terminal = 0` for `delivered` and `return_requested`, and `is_terminal = 1` for `completed`, `cancelled`, and `return_completed`.
* Replaced `COUNT(*) === 0` conditional wraps with `ON DUPLICATE KEY UPDATE` syntax on both `workflow_statuses` (updating `is_active` and `is_terminal`) and `workflow_transitions` (updating `is_active`). This ensures existing custom labels/colors are preserved while fixing safety flags.
* Integrated a public endpoint trigger inside [run_migration.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_migration.php) and registered `/api/run-workflow-migration` in [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php) to trigger Order model migration remotely.

### B. Deactivation Guards
* **Backend**: Added database check in [WorkflowController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/WorkflowController.php#L775) inside `updateOrderStatusConfig` to check if the status is used by any active (`is_active = 1`) transition. Blocks change with a 400 Bad Request error.
* **Frontend**: Added check in the status edit form submit handler in [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx#L1965) to block submission and trigger a friendly warning toast instantly.
* **Error Label**: “Trạng thái này đang được dùng trong luồng chuyển trạng thái. Vui lòng tắt các bước chuyển liên quan trước.”

### C. UI Polish
* Modified [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx#L1151) row markup to only render the Vietnamese label prominently by default.
* The system key `(Mã hệ thống: pending_confirmation)` is hidden and only shown as a muted string on row hover (`group-hover:opacity-100`).

---

## 3. Verification & Build Results
* Executed `/api/run-workflow-migration` on the remote staging site. Database tables `workflow_statuses` and `workflow_transitions` were updated correctly.
* Checked type compilation: `npx tsc --noEmit` passed with **zero errors**.
* Checked frontend build: `npm run build` ran successfully.
* All modified files deployed to staging via FTP script.

## 4. Unresolved Questions
* None.
