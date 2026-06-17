# Phase 4: Admin Dashboard & Loyalty Integration

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1310-checkout-order-inventory-loyalty-flow.md)
* [Phase 3 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-03-inventory-reservation-and-fulfillment-rules.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Expose admin order tracking/update APIs, verify allowed order state transitions, and calculate/grant 3F Club loyalty points when orders are completed.

## Requirements
- Support admin order list, searching, and status updates.
- Compute loyalty points using `LoyaltyPointService` (web_store source, multiplier support).
- Guarantee point awarding is idempotent per order.

## Related Code Files
* **Modified Controllers**:
  - `3f-api/app/Controllers/OrderController.php` (add admin endpoints)
  - `3f-api/app/Controllers/LoyaltyController.php` (mapping)
* **Modified Routes**: `3f-api/public/index.php`

## Implementation Steps
1. Add admin routes in `public/index.php`:
   - `GET /api/admin/orders`
   - `POST /api/admin/orders/update-status`
   - `POST /api/admin/orders/mark-paid`
2. Implement endpoints in `OrderController.php`:
   - `adminList()` with pagination, search, and status filters.
   - `adminUpdateStatus()` validating order status transitions.
3. Integrate point awarding logic on order status change to `completed`:
   - Check if an `earn_web_order` transaction with same `reference_id = orderId` exists in `customer_point_transactions`.
   - Calculate points via `LoyaltyPointService::previewPoints($order['total'], $order['phone'], "web_store", false)`.
   - Insert transaction via `CustomerPointTransactionModel::addTransaction()`.
   - Update customer loyalty balance.
   - Save earned points to `orders.loyalty_points_earned`.
4. Create frontend components for admin orders page at `/admin/orders` or update existing dashboard sidebar items.

## Todo List
- [ ] Implement admin endpoints in `OrderController.php`.
- [ ] Implement dynamic loyalty point awarding upon completion.
- [ ] Connect backend status transitions to admin panel.

## Success Criteria
- Admin status updates transition orders correctly.
- Completing an order calculates points dynamically and inserts transaction with type `earn_web_order`.
- Re-running complete on the same order does not duplicate points.
