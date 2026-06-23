# Phase 01: Backend Status Config API

## Context Links
- [WorkflowController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/WorkflowController.php)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)

## Overview
- Priority: High
- Status: Pending
- Objective: Provide simple API endpoints for fetching and saving order-specific statuses/transitions.

## Requirements
1. **GET `/api/admin/orders/status-config`**
   - Returns order status group metadata:
     - `statuses`: list of `workflow_statuses` with `group_key = 'order'`.
     - `transitions`: list of `workflow_transitions` with `group_key = 'order'`.

2. **PUT `/api/admin/orders/status-config/statuses/:id`**
   - Payload: `label`, `color`, `sort_order`, `is_active`.
   - Update `workflow_statuses` row.
   - Guard against deactivating critical system status keys (`completed`, `cancelled`, `return_completed`, `delivered`).

3. **PUT `/api/admin/orders/status-config/transitions/:id`**
   - Payload: `label`, `requires_reason`, `is_active`, `sort_order`.
   - Update `workflow_transitions` row.

## Related Code Files
- `3f-api/app/Controllers/WorkflowController.php`
- `3f-api/public/index.php`

## Success Criteria
- Requesting `GET /api/admin/orders/status-config` returns a successful JSON response with order-only configurations.
- Requesting `PUT /api/admin/orders/status-config/statuses/:id` updates values, and blocks critical status deactivations with a descriptive error message.
