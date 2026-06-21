# Phase 01: Database Schema & Migration

## Context Links
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql)
- [Order.php model](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)

## Overview
- Priority: High
- Status: Pending
- Description: Extend `orders` and `order_status_logs` schema, create configurable workflows, rules, and settings tables, and run safe migration of legacy statuses.

## Key Insights
- Standardizing schema modifications via `Order.php`'s constructor `migrate()` ensures self-healing database deployments.
- Seeded transitions must support a complete standard order lifecyle.

## Requirements
- Maintain existing order data.
- Seed tables: `workflow_statuses`, `workflow_transitions`, `notification_channels`, and `shipping_providers`.
- Alter `orders` and `order_status_logs` without data loss.

## Architecture
- Custom PHP DB queries for schema alterations and seeding.

## Related Code Files
- `3f-api/database/orders_schema.sql` (Modify)
- `3f-api/app/Models/Order.php` (Modify)

## Implementation Steps
1. Add table creation scripts for:
   - `workflow_statuses`
   - `workflow_transitions`
   - `automation_rules`
   - `customer_activity_logs`
   - `notification_channels`
   - `shipping_providers`
   to `3f-api/database/orders_schema.sql`.
2. Update the `orders` and `order_status_logs` table creation scripts in `orders_schema.sql` with new multi-status fields.
3. Update the `migrate()` method in `3f-api/app/Models/Order.php` to add new columns to `orders` and `order_status_logs` dynamically using `ALTER TABLE`.
4. Implement status data seeding and data migration in `migrate()` to map old status values safely.

## Todo List
- [ ] Edit `3f-api/database/orders_schema.sql`
- [ ] Edit `3f-api/app/Models/Order.php` `migrate()` method
- [ ] Implement old-status data migration in PHP
- [ ] Verify database schema changes are applied automatically

## Success Criteria
- Existing orders have correct status mappings.
- Configurable status and transition tables exist with seeded data.

## Risk Assessment
- Duplicate entries or unique constraint failures during migration. Mitigate by using `INSERT IGNORE` or checking row count first.

## Security Considerations
- Standard SQL injection avoidance via parameterized queries.

## Next Steps
- Implement status transition validation logic in Phase 2.
