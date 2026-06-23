# Debugger Report: Fix Order Workflow Transitions Mismatch

**Date**: 2026-06-21
**Time**: 22:15
**Task Slug**: fix-order-workflow-transitions-mismatch

## 1. Problem Statement
The Admin Orders UI allows transitions such as `delivered -> return_requested` and `delivered -> completed`, but when clicked, the backend returns errors:
- "Quy trình chuyển đổi trạng thái order từ 'delivered' sang 'return_requested' không được phép."
- "Không thể chuyển đổi từ trạng thái cuối cùng (terminal state)."

Additionally, on Plesk staging, calling the allowed transitions API throws an internal server error:
`Too few arguments to function App\Controllers\WorkflowController::orderAllowedTransitions(), 0 passed in Router.php on line 194 and exactly 1 expected`

## 2. Root Cause Analysis

### A. Incorrect Status Terminal Flags & Missing Transitions in DB
1. **Status Terminal Flags**: In the seeded database, the state `delivered` might have been marked as terminal (`is_terminal = 1`), preventing any further updates. It must be non-terminal (`is_terminal = 0`) to allow transitions to `completed` and `return_requested`.
2. **Missing Transitions**: The transition `delivered -> return_requested` was completely missing from the database seeding list. Instead, there was a transition `completed -> return_requested`, which is incorrect since `completed` is a terminal state.
3. **Idempotency Issue**: The migration code only seeds `workflow_statuses` and `workflow_transitions` if the tables are completely empty (`$count === 0` / `$countTrans === 0`). If the tables were already seeded with incorrect data, they are never updated on staging.

### B. Controller Method Signature Mismatch
The route `/api/admin/orders/:id/allowed-transitions` maps to `WorkflowController::orderAllowedTransitions`. 
The dispatcher in `Router.php` extracts `:id` and sets it in `$_GET['id']` / `$_REQUEST['id']`, then invokes `$controller->$action()` with **0 arguments**.
However, the controller method on the server was likely expecting `orderAllowedTransitions($orderId)`, causing an `ArgumentCountError` in PHP.

### C. Frontend Fallback and Error Handling
1. **Fallback Actions**: The frontend fallback map shows options even if they are invalid or if the backend rejects them.
2. **Toast and Modal Labels**: Error messages and confirmation modal text expose technical keys (e.g. `delivered`, `return_requested`) instead of friendly Vietnamese names.

## 3. Action Plan
1. **Database Schema & Seed Update**:
   - Write idempotent SQL updates in `Order.php` `migrate()` to ensure `delivered` is non-terminal, and `completed`, `cancelled`, and `return_completed` are terminal.
   - Insert/update the transitions: `shipping -> delivered`, `delivered -> completed`, `delivered -> return_requested` (requires reason), and `return_requested -> return_completed`.
2. **Controller Method Signature Check**:
   - Verify `WorkflowController::orderAllowedTransitions()` accepts no arguments, parsing `id` from query/request.
3. **Frontend Refactoring**:
   - Update `AdminOrdersPage.tsx` to handle backend transitions properly: only fall back if backend transitions are empty and state is non-terminal.
   - Translate technical keys in modal confirmations and toast errors into Vietnamese.
4. **Verification & Deployment**:
   - Run build and deploy using FTP deploy script.
