# Scout Report: Checkout, Order, Inventory, and Loyalty Flow

This report outlines the codebase scouting findings for the implementation of the complete e-commerce flow for the 3F Store.

## Scouting Findings

### 1. Frontend Checkout & Cart Structure
- **Cart & Checkout Page**: [CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx) handles localStorage cart items list and includes a simulated delivery/checkout form.
- **Helper Functions**: [cartHelper.ts](file:///c:/Users/Admin/Downloads/ccc/lib/cartHelper.ts) handles cart additions, quantity updates, and storage.
- **Components**:
  - `CartItemsList`: Displays items in cart.
  - `DeliveryForm`: Collects client checkout fields.
  - `OrderSummary`: Displays price summaries and place order trigger.

### 2. Backend Product & Variant DB State
- Products and variants are migrated to MySQL.
- Tiers, campaigns, rules, rewards, transactions, and pools tables are handled by `LoyaltyProductionModel.php`.
- Schema fields like `reserved_stock` and `stock_quantity` exist in `product_variants` and `products` tables.

### 3. Missing Infrastructure (To be created)
- **Database Schema**: Orders, Order Items, Customers, Order Status Logs, and Payment Proofs tables.
- **Backend Models**: `Customer.php`, `Order.php`, `OrderItem.php`.
- **Backend Controllers**: `OrderController.php` exposing endpoints for creating orders, detail query, status updates.
- **Backend Services**: `InventoryService.php` to handle reserved stock modifications, and E-commerce point allocation integration.
- **Frontend Integration**: Hook up `CartCheckout.tsx` submit handler to `POST /api/orders/create` and show detailed status screens.
