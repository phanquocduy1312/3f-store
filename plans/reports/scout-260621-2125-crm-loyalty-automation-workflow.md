# Scout Report: Order Status Workflow Upgrade
Date: 260621
Time: 2125

## Scouted Files

### Backend (PHP MVC)
- [Order.php Model](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php): Handles order CRUD, status change logging, and schema migration logic.
- [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php): REST API handlers for creating, detail retrieval, listing, status updating, and marking paid.
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql): Initial schema definition for `orders`, `order_status_logs`, etc.

### Frontend (React/Vite)
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx): Admin UI for listing and viewing orders, displaying order details drawer, and initiating status transitions.
- [OrderTracking.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/OrderTracking.tsx): Client-facing page to track order statuses.
- [OrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/OrdersPage.tsx): Client-facing personal account orders list.
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts): REST API wrappers for orders and products.

## Insights & Current Status
- Orders table has basic columns: `order_status` and `payment_status` (both VARCHAR(50)).
- `order_status_logs` exists with basic columns: `id`, `order_id`, `from_status`, `to_status`, `note`, `changed_by`, `created_at`.
- There is a `migrate()` method inside the `Order.php` model constructor that auto-applies schema updates upon instantiation.
- Simple state transition validation is hardcoded in the model.
- Loyalty points are awarded immediately in a transaction when the status updates to `completed`.
