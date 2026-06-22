# Phase 01: Database Seeding & Migration Safety

## Context Links
- [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql)

## Overview
- Priority: High
- Status: Pending
- Objective: Fix incorrect `is_terminal` flags and add missing transition paths in database seeding idempotently.

## Requirements
- `delivered` must have `is_terminal = 0`.
- `completed`, `cancelled`, and `return_completed` must have `is_terminal = 1`.
- Transition `delivered -> completed` must be seeded.
- Transition `delivered -> return_requested` (requires reason) must be seeded.
- Transition `return_requested -> return_completed` must be seeded.
- Ensure the seed execution is fully idempotent.

## Related Code Files
- `3f-api/app/Models/Order.php`

## Implementation Steps
1. Modify `Order.php` method `migrate()`.
2. Add explicit update/insert SQL statements to run after initial counts are checked.
3. Example SQL updates:
   ```sql
   UPDATE workflow_statuses SET is_terminal = 0 WHERE group_key = 'order' AND status_key = 'delivered';
   UPDATE workflow_statuses SET is_terminal = 1 WHERE group_key = 'order' AND status_key = 'completed';
   UPDATE workflow_statuses SET is_terminal = 1 WHERE group_key = 'order' AND status_key = 'cancelled';
   UPDATE workflow_statuses SET is_terminal = 1 WHERE group_key = 'order' AND status_key = 'return_completed';
   ```
4. Insert missing transitions dynamically if they do not exist:
   - `order`, `shipping`, `delivered`, `Giao hàng thành công`, `0`
   - `order`, `delivered`, `completed`, `Hoàn tất đơn hàng`, `0`
   - `order`, `delivered`, `return_requested`, `Yêu cầu đổi / trả`, `1`
   - `order`, `return_requested`, `return_completed`, `Hoàn tất đổi trả`, `0`
   We can use `INSERT INTO workflow_transitions ... ON DUPLICATE KEY UPDATE label=VALUES(label), requires_reason=VALUES(requires_reason), is_active=1;`.

## Success Criteria
- Running the staging database migration results in the correct values for these records.
- Staging orders show `delivered` with `is_terminal = 0` in database.
