# Phase 5: Frontend E-commerce Flow Integration

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1310-checkout-order-inventory-loyalty-flow.md)
* [Phase 4 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-04-admin-dashboard-and-loyalty-integration.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Modify React pages and components to hook into live PHP backend APIs for ordering, cart operations, variant selection, checkout submit, success landing, and order tracking.

## Related Code Files
* **Frontend Pages**:
  - `src/pages/CartCheckout.tsx`
  - `src/pages/ProductDetail.tsx`
  - `src/pages/Home.tsx`
  - `components/ProductCard.tsx`
  - `components/CartCheckout/DeliveryForm.tsx`
  - `components/CartCheckout/OrderSummary.tsx`
  - `src/pages/client/ThreeFClubPage.tsx`
* **New Tracking Pages**:
  - `src/pages/OrderSuccess.tsx`
  - `src/pages/OrderTracking.tsx`
  - `src/pages/OrderCheck.tsx`

## Implementation Steps
1. **API Integration**: Create typescript axios/fetch helpers for `createOrder`, `getOrderDetails`, `checkOrdersByPhone`.
2. **Product Detail Options Selection**:
   - Ensure all variant selector options update local state.
   - Update main photo, sku, price text, and stock count according to variant details.
   - Disable add-to-cart/buy-now if selected variant is out of stock.
3. **Cart & LocalStorage Rules**:
   - Save `${productId}-${variantId}` key.
   - Ensure cart additions validate against variant stock.
4. **Checkout Submission**:
   - Connect submit click in `CartCheckout.tsx` to call `/api/orders/create`.
   - If payment method is `vietqr`, map to backend `bank_transfer`.
   - Clear localStorage cart on success and navigate to `/order-success/:orderCode`.
5. **Order Success page**:
   - Display order details, cod status, or bank transfer details (MB Bank, 3FSTORE2026, transfer description = orderCode).
6. **Order Tracking page**:
   - Display timeline of states (`pending`, `confirmed`, `packing`, `shipping`, `completed`, `cancelled`).
   - Display expected or earned loyalty points.
7. **Client Point Logs**:
   - Map `earn_web_order` to "Cộng điểm đơn web" on loyalty logs list.

## Todo List
- [ ] Implement cart validation and checkout submit API hooks.
- [ ] Implement Order Success and Order Tracking routes in App router.
- [ ] Connect tracking timeline and details.
- [ ] Update PDP option selection behavior.

## Success Criteria
- Adding items, checking out, and placing order updates backend state dynamically.
- Successful orders clear the frontend cart and lead to the payment instructions screen.
