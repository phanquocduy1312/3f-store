# Phase 1: Backend Update & Database Recalculation

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260622-1540-fix-shopee-points-divisor.md)
- [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1540-fix-shopee-points-divisor/plan.md)

## Overview
- Priority: High
- Status: in_progress
- Description: Fix the hardcoded points calculation `/ 10000` in the backend approval endpoint, and write a script to correct existing point rewards and customer balances on staging.

## Requirements
- Use the active Shopee point rule (e.g. `200 VND = 1 point`) via `PointService::calculateShopeePoints($verifiedAmount)` inside backend approvals instead of `floor($verifiedAmount / 10000)`.
- Recalculate and update the following tables for any orders approved with incorrect points:
  - `shopee_point_requests` (approved_points)
  - `shopee_point_awards` (points_awarded)
  - `customer_point_transactions` (points, balance_after)
  - `orders` (loyalty_points_earned)
- Recalculate customer tier and total loyalty points profiles if necessary.

## Architecture
- Backend controller uses the `PointService` helper which queries the database for the active `loyalty_point_rules` matching the `shopee` source.
- Recalculation script loops through previously approved requests (where points were awarded using the old `10000` divisor) and updates them to the correct point values (using the `200` divisor), then rebuilds transaction history balances and updates tier assignments.

## Related Code Files
- [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php) (Modify)
- [recalculate_shopee_points.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/recalculate_shopee_points.php) (New script)

## Implementation Steps

### 1. Update approval logic
In `ShopeePointRequestController::approve()`:
- Change `$approvedPoints = (int)floor($verifiedAmount / 10000);` to `$approvedPoints = \App\Services\PointService::calculateShopeePoints($verifiedAmount);`
- Update `$pointPreview` note array to say `'Dynamic active Shopee point rule calculation'`.

### 2. Recalculation script
Create `3f-api/public/recalculate_shopee_points.php` to:
- Connect to the DB.
- Load the active shopee point rule (`money_per_point` is `200`).
- Select all approved shopee requests (or specifically target customer `quang` and similar ones if needed, or do a general recalculation of all shopee requests).
- For each request:
  1. Calculate the new points using `verified_amount / 200`.
  2. Update `shopee_point_requests` set `approved_points = ?`.
  3. Update `shopee_point_awards` set `points_awarded = ?`.
  4. Update the corresponding `customer_point_transactions` (type `earn_shopee_order`, reference_id = request_id) set `points = ?`.
- For each customer whose points were updated:
  1. Recalculate their point transactions order and update `balance_after` for all transactions sequentially.
  2. Sync the customer profile and update their tier based on their new points total.

## Todo List
- [ ] Modify `ShopeePointRequestController.php` approval logic
- [ ] Create and run `recalculate_shopee_points.php` script
- [ ] Verify database state via `inspect_db_web.php`

## Success Criteria
- Approving a Shopee request in the admin panel awards points based on the active `200đ` rule.
- Customer `quang` (and other customers) have their points corrected (e.g. from `39` to `1933` points for order `3F-638020` + manual point).
- No syntax or PDO connection errors in the backend logs.
