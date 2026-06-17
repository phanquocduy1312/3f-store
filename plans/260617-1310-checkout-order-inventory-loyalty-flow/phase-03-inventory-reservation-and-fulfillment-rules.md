# Phase 3: Inventory Reservation and Fulfillment Rules

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1310-checkout-order-inventory-loyalty-flow.md)
* [Phase 2 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-02-checkout-and-order-apis.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Create service-level rules to handle stock allocation, reservation release, and catalog updates upon order transitions.

## Key Insights
- Order status changes must be idempotent to prevent double fulfillment or double release.
- Avoid negative stocks or negative reserved stocks by using guard checks and transactional updates.

## Related Code Files
* **New Service**: `3f-api/app/Services/InventoryService.php`
* **Modified Model**: `3f-api/app/Models/Order.php`

## Implementation Steps
1. Create `3f-api/app/Services/InventoryService.php` with methods:
   - `reserveStock($items, $orderCode)`
   - `releaseStock($items, $orderCode)`
   - `fulfillStock($items, $orderCode)`
2. Enforce transaction safety inside the service using PDO transaction blocks and `FOR UPDATE` queries on variants/products.
3. Update `Order.php` model status transition logic:
   - When order is cancelled: Call `InventoryService::releaseStock()`.
   - When order is completed: Call `InventoryService::fulfillStock()`.
4. Log all inventory updates into `inventory_transactions` with detailed transaction types (`reserve_order`, `release_order`, `fulfill_order`).

## Todo List
- [ ] Create `InventoryService.php`.
- [ ] Connect `InventoryService` to `OrderController` and `Order` model status updates.
- [ ] Implement guard checks against double transitions.

## Success Criteria
- Order cancellation successfully decrements `reserved_stock`.
- Order completion successfully decrements both `stock_quantity` and `reserved_stock`, and increments `sold_count`.
- No operations can push stock balances below 0.
