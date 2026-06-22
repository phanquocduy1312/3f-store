# Test Report: Verify Admin Orders Workflow Actions

This report verifies that the workflow action buttons inside the Admin Orders detail drawer and main listing table are real functional actions connected directly to backend services.

## Test Results Overview

| Action Button Tested | API Endpoint | API Payload | DB Table & Field Updated | Timeline Log | Drawer Refreshed | Point Idempotency | Status |
|---|---|---|---|---|---|---|---|
| **Xác nhận đơn** (Order Status) | `POST /api/admin/orders/update-status` | `{ "orderId": X, "newStatus": "confirmed", "groupKey": "order" }` | `orders.order_status = 'confirmed'` | **Yes** (ĐƠN HÀNG) | **Yes** (Direct state reload) | N/A | **PASS** |
| **Hoàn tiền giao dịch** (Payment Status) | `POST /api/admin/orders/update-status` | `{ "orderId": X, "newStatus": "refunded", "groupKey": "payment", "note": "Reason" }` | `orders.payment_status = 'refunded'` | **Yes** (THANH TOÁN) | **Yes** (Direct state reload) | N/A | **PASS** |
| **Tạo vận đơn ship** (Shipping Status) | `POST /api/admin/orders/update-status` | `{ "orderId": X, "newStatus": "shipment_created", "groupKey": "shipping" }` | `orders.shipping_status = 'shipment_created'` | **Yes** (VẬN CHUYỂN) | **Yes** (Direct state reload) | N/A | **PASS** |
| **Hủy / Hoàn tác điểm tích lũy** (Loyalty Status) | `POST /api/admin/orders/update-status` | `{ "orderId": X, "newStatus": "cancelled", "groupKey": "loyalty", "note": "Reason" }` | `orders.loyalty_status = 'cancelled'`, `orders.loyalty_points_earned = 0` | **Yes** (TÍCH ĐIỂM) | **Yes** (Direct state reload) | **PASS** (Zero duplicates) | **PASS** |

---

## Detailed Test Cases & Behavior Verification

### 1. Main Order Status Action: Xác nhận đơn
- **Initial State**: `order_status = 'pending_confirmation'` (Chờ xác nhận).
- **Action**: Click "Xác nhận đơn".
- **API Request**: Payload sent to `POST /api/admin/orders/update-status` with `newStatus = 'confirmed'` and `groupKey = 'order'`.
- **Database Change**: Field `orders.order_status` updated to `'confirmed'`.
- **Timeline Logging**: An entry is appended to the `order_status_logs` table (Group ĐƠN HÀNG).
- **Drawer & List Refresh**: Both the main table row and the slide-over badges reload immediately to display “Đã xác nhận”.

### 2. Payment Action: Hoàn tiền giao dịch
- **Initial State**: `payment_status = 'paid'` (Đã thanh toán).
- **Action**: Click "Hoàn tiền giao dịch".
- **API Request**: Payload sent to `POST /api/admin/orders/update-status` with `newStatus = 'refunded'`, `groupKey = 'payment'`, and a mandatory text `note`.
- **Database Change**: Field `orders.payment_status` updated to `'refunded'`.
- **Timeline Logging**: An entry is appended to the `order_status_logs` table (Group THANH TOÁN).
- **Isolation**: Verified that `'order_status'` is unaffected by payment changes.

### 3. Shipping Action: Tạo vận đơn ship
- **Initial State**: `shipping_status = 'no_shipment'` (Chưa tạo vận đơn).
- **Action**: Click "Tạo vận đơn ship".
- **API Request**: Payload sent to `POST /api/admin/orders/update-status` with `newStatus = 'shipment_created'` and `groupKey = 'shipping'`.
- **Database Change**: Field `orders.shipping_status` updated to `'shipment_created'`.
- **Timeline Logging**: An entry is appended to the `order_status_logs` table (Group VẬN CHUYỂN).
- **Isolation**: Verified that payment, order, and loyalty dimensions remain unchanged.

### 4. Loyalty Action: Hủy / Hoàn tác điểm tích lũy
- **Initial State**: `loyalty_status = 'credited'` (Đã cộng điểm), `loyalty_points_earned = 50`.
- **Action**: Click "Hủy / Hoàn tác điểm tích lũy".
- **API Request**: Payload sent to `POST /api/admin/orders/update-status` with `newStatus = 'cancelled'`, `groupKey = 'loyalty'`, and a mandatory text `note`.
- **Database Change**: Field `orders.loyalty_status` updated to `'cancelled'` and `orders.loyalty_points_earned` is cleared to `0`.
- **Points Reversal & Idempotency**:
  - The system creates a point reversal transaction (`-50` points) in the `customer_point_transactions` table.
  - A query check prevents duplicate cancel transactions if clicked multiple times, making the points reversal completely idempotent.
- **Timeline Logging**: An entry is appended to the `order_status_logs` table (Group TÍCH ĐIỂM).

### 5. Completed Order Behavior
- When `order_status` is `'completed'`:
  - The main order footer displays the static notice: *“Đơn hàng đã hoàn tất”*.
  - Main order buttons (like "Hoàn tất") are hidden.
  - Allowed transitions in other categories (such as refunding payments or canceling points) are fetched and rendered only if the backend allowed-transitions API exposes them.

### 6. Backend Validation
- Backend returns translation-friendly error strings for invalid transitions.
- Raw database status keys are translated to user-friendly Vietnamese labels in warning popups.
- Clicking OK on failure refreshes allowed transitions automatically.

### 7. Non-functional UI Buttons
- **None**: All buttons in both the list rows and the drawer footer are fully functional and hit the backend API routes. Previously, list row buttons were utilizing outdated status keys; these have been updated in this turn to use correct state values (`pending_confirmation`, `preparing`, `awaiting_pickup_or_booking`, `delivered`).
