# Phase 02: Controller Signature Resolution

## Context Links
- [WorkflowController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/WorkflowController.php)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)

## Overview
- Priority: High
- Status: Pending
- Objective: Resolve `ArgumentCountError` on remote server for dynamic order transition endpoints.

## Implementation Steps
1. Verify the signature of `orderAllowedTransitions()` in `WorkflowController.php`.
2. To prevent any future argument count mismatch between local and server routers, make it accept an optional `$orderId = null` parameter:
   ```php
   public function orderAllowedTransitions($orderId = null) {
       $orderId = (int)($orderId ?? \App\Core\Request::query('id') ?? $_GET['id'] ?? 0);
       ...
   }
   ```
3. Update `updateOrderStatus` / other action routes in `WorkflowController` to be safe as well.

## Success Criteria
- Requesting `/api/admin/orders/:id/allowed-transitions` returns status code 200 and dynamic options instead of 500.
