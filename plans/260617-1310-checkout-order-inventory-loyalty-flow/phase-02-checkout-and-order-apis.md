# Phase 2: Checkout and Order APIs

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1310-checkout-order-inventory-loyalty-flow.md)
* [Phase 1 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-01-database-schema-and-backend-models.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Create backend controller endpoints for order submission, detailed query, and public tracking.

## Requirements
- Validates payload fields strictly.
- Recalculates prices dynamically from DB (no frontend price trust).
- Reserve stock atomically.

## Related Code Files
* **New Controller**: `3f-api/app/Controllers/OrderController.php`
* **Modified Route File**: `3f-api/public/index.php`

## Implementation Steps
1. Create `3f-api/app/Controllers/OrderController.php`.
2. Implement `create()` to handle checkout submission:
   - Perform field validations.
   - Loop items and verify against `product_variants` and `products` tables.
   - If variant exists, `variant_id` must be provided and active.
   - Verify available stock (`stock_quantity - reserved_stock >= quantity`).
   - Calculate subtotal using DB pricing.
   - Upsert customer record.
   - Generate order code (e.g., `3F-` + 6 random digits).
   - Start SQL transaction, insert order and items, increase `reserved_stock`, write inventory logs, log status change.
3. Implement `detail()` to handle `GET /api/orders/detail?orderCode=...`.
4. Implement `check()` to handle `GET /api/orders/check?phone=...&orderCode=...`.
5. Register routes in `public/index.php`:
   - `POST /api/orders/create`
   - `GET /api/orders/detail`
   - `GET /api/orders/check`

## Todo List
- [ ] Implement `create()` in `OrderController.php`.
- [ ] Implement `detail()` in `OrderController.php`.
- [ ] Implement `check()` in `OrderController.php`.
- [ ] Register routes in `index.php`.

## Success Criteria
- Valid checkout payloads create orders with `reserved_stock` incremented.
- Invalid items or out of stock items return descriptive errors.
