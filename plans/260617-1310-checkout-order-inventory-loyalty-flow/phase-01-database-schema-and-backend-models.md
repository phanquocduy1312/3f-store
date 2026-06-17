# Phase 1: Database Schema & Backend Models

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1310-checkout-order-inventory-loyalty-flow.md)
* [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/plan.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Create database tables for customers, addresses, orders, order items, and status change logs. Write backend PHP models to interface with these tables.

## Requirements
- Support schema creation in an automated way during model initialization.
- Support storing order code, customer metadata, shipping addresses, order totals, logs, and payment details.

## Related Code Files
* **New Schema File**: `3f-api/database/orders_schema.sql`
* **New Models**:
  - `3f-api/app/Models/Customer.php`
  - `3f-api/app/Models/Order.php`
  - `3f-api/app/Models/OrderItem.php`

## Implementation Steps
1. Create `3f-api/database/orders_schema.sql` containing the definitions of:
   - `customers`
   - `customer_addresses`
   - `orders`
   - `order_items`
   - `order_status_logs`
   - `order_payment_proofs`
2. Create `3f-api/app/Models/Customer.php` with:
   - `upsertCustomer($name, $phone, $email = null, $zalo = null)` returning customer ID.
   - `getCustomerByPhone($phone)`.
3. Create `3f-api/app/Models/Order.php` with:
   - `migrate()` to run `orders_schema.sql`.
   - `createOrder($orderData, $items)` using database transaction.
   - `getOrderDetails($orderCode)`.
   - `listOrders($filters)`.
   - `updateOrderStatus($orderId, $newStatus, $note = null, $changedBy = null)`.
4. Create `3f-api/app/Models/OrderItem.php` to insert and list items.
5. Add initialization of `Order` model to `3f-api/public/index.php`.

## Todo List
- [ ] Create `orders_schema.sql`.
- [ ] Create `Customer.php` model.
- [ ] Create `Order.php` model.
- [ ] Create `OrderItem.php` model.
- [ ] Register `Order` initialization in `index.php`.

## Success Criteria
- SQL tables are created successfully without error.
- Models initialize correctly and have database connections.
