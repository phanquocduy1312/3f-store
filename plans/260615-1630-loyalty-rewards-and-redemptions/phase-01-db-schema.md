# Phase 1: DB Schema and Seeding

## Context Links
- [schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/schema.sql)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Add rewards, redemptions, and point transactions table schema to `schema.sql` and run auto-migrations in Model constructors if tables do not exist.

## Key Insights
- Ensure DB columns match exactly the naming constraints.
- Seed default sample rewards if the `loyalty_rewards` table is empty.

## Requirements
- Bảng `loyalty_rewards`
- Bảng `loyalty_reward_redemptions`
- Bảng `customer_point_transactions`
- Seed data mẫu cho rewards.

## Related Code Files
- [MODIFY] `schema.sql`
- [MODIFY] `LoyaltyRewardModel.php` (constructor)

## Implementation Steps
1. Append the CREATE TABLE statements to `schema.sql`.
2. Add table creation execution code to `LoyaltyRewardModel`, `LoyaltyRewardRedemptionModel`, and `CustomerPointTransactionModel` constructors to run auto-migrations on class initialization.
3. Seed template items during initialization.

## Success Criteria
- DB tables are created automatically when the backend API starts.
- SQL syntax matches MySQL 8.
