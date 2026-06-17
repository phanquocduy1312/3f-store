# Phase 1: Database Migrations

## Context Links
- [customer-auth-schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/customer-auth-schema.sql)
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql)

## Overview
- Priority: High
- Status: Pending
- Description: Extend the `customers` and `customer_addresses` tables to support profile and administrative division data, and create the `customer_pets` table.

## Key Insights
- Standard `ADD COLUMN` queries must be used to ensure compatibility with MySQL 5.7+ running on local Laragon, instead of `ADD COLUMN IF NOT EXISTS` which is MySQL 8-only.
- If a column already exists, we will catch and ignore the error.

## Related Code Files
- [NEW] [customer_profile_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/customer_profile_schema.sql)
- [MODIFY] [Customer.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Customer.php)

## Implementation Steps
1. Create `3f-api/database/customer_profile_schema.sql` containing the SQL statements for tables and columns extension.
2. Update `Customer.php` to execute the migration SQL script on constructor initialization.

## Todo List
- [ ] Create `customer_profile_schema.sql` file.
- [ ] Add migration runner call inside `Customer.php`.
- [ ] Execute database migration via PHP and inspect tables to verify columns.

## Success Criteria
- Columns `birthday`, `gender`, `avatar_url` are present in `customers`.
- Columns `receiver_phone`, `province_code`, `ward_code`, `ward_name`, etc. are present in `customer_addresses`.
- Table `customer_pets` is created.
- Membership tiers are updated: Diamond is removed, and Platinum requires 15,000 points.

## Risk Assessment
- Risk: Migration script failing and crashing PHP.
- Mitigation: Catch all PDOExceptions and log them instead of throwing them, ignoring duplicate column/table warnings.
