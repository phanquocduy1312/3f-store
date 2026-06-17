# Phase 1: Database and Backend Optimization

### Context Links
- Plan Overview: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1420-improve-admin-order-operations/plan.md)
- Orders Controller: [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)
- Order Model: [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)

### Overview
- Priority: High
- Current Status: Pending
- Description: Enhance the backend Order queries to join with `customers` table to get full customer details. Enforce strict transition checks, and prevent duplicate processing (double inventory lock/release/fulfillment, double loyalty point allocation) if the new state is equal to the old state. Return clean 400 Bad Request JSON messages on business rule validation errors.

### Key Insights
- When `listOrders` is fetched, the frontend needs to render the customer name, phone, and email, which are stored in the `customers` table. A `LEFT JOIN` makes this efficient.
- `OrderController.php` did not check if the status was actually changing before calling `InventoryService` and `LoyaltyPointService`. If an order status update was called with the same status, it would duplicate the actions. An early return check is needed.
- Throwing exceptions in controller handlers results in 500 server errors. Business errors should return 400 status codes.

### Requirements
- **Customer details JOIN**: Join `orders` with `customers` on `customer_id = id` in `listOrders()`, `getOrderDetails()`, and `getOrderDetailsById()`.
- **Ambiguity avoidance**: Prefix all `orders` columns with `o.` in queries where joins are introduced.
- **Initial logging change**: Set `from_status` to `null` and `note` to `"Đơn hàng được tạo từ website"` on order initialization.
- **Safe transition returns**: If `$currentStatus === $newStatus` in `adminUpdateStatus()`, commit and return success early without modifying stock or awarding points.
- **Error mapping**: Map exceptions thrown from business logic to HTTP 400 JSON responses.
- **Payment status guards**: Block `mark-paid` operation if the order status is `cancelled`.

### Architecture
- The controllers interact with the `Order` model and the `InventoryService`/`LoyaltyPointService`.
- State transitions list:
  - `pending` -> `confirmed` | `cancelled`
  - `confirmed` -> `packing` | `cancelled`
  - `packing` -> `shipping` | `cancelled`
  - `shipping` -> `completed`
  - `completed` -> (None)
  - `cancelled` -> (None)

### Related Code Files
- [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)
- [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)

### Implementation Steps
1. **Modify `3f-api/app/Models/Order.php`**:
   - Update `listOrders()`, `getOrderDetails()`, and `getOrderDetailsById()` to LEFT JOIN `customers c` and fetch `c.name AS customer_name`, `c.phone AS customer_phone`, `c.email AS customer_email`. Ensure order columns are prefixed `o.`.
   - Update initial status log in `createOrder` to pass `null` as fromStatus and `"Đơn hàng được tạo từ website"`.
2. **Modify `3f-api/app/Controllers/OrderController.php`**:
   - In `adminUpdateStatus()`, compare `$currentStatus` and `$newStatus`. If equal, return success immediately.
   - Update catch block to return HTTP 400 for validation errors/business issues, and HTTP 500 only for PDOExceptions.
   - In `adminMarkPaid()`, fetch the order and throw 400 error if its status is `cancelled`.

### Todo List
- [ ] LEFT JOIN customers in `Order.php` queries.
- [ ] Enforce early return on matching status in `OrderController.php`.
- [ ] Add status check in `adminMarkPaid()`.
- [ ] Test order creation log insert values.
- [ ] Verify error code responses (400 vs 500).

### Success Criteria
- Admin orders list returns customer fields.
- Double-clicks or duplicate requests do not cause double fulfillment or double loyalty allocation.
- Marked paid operations are rejected on cancelled orders.

### Risk Assessment
- Database column conflicts (ambiguous column names). *Mitigated by explicitly prefixing fields with `o.` and `c.`.*

### Security Considerations
- Prevent unauthorized status changes by ensuring proper validation rules.
