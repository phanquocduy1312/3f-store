# Phase 01: Cart & Checkout Page Design & Implementation

## Context Links
- **Related Plans**: [plan.md](file:///C:/Users/Admin/Downloads/ccc/plans/260608-1021-cart-checkout-page/plan.md)
- **Reference Docs**: None

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Build a unified page at `/cart` that handles both shopping cart review and checkout/payment options, including dynamic VietQR.

## Key Insights
- **UX Layout**: Left column (or top) handles cart item updates and voucher code entry. Right column handles shipping address, shipping method, payment method, and checkout summary.
- **LocalStorage Sync**: Must sync between `ProductDetail`, `Header`, and the checkout page. Use custom `cart-updated` event.
- **VietQR Modal**: Shows interactive checkout experience with dynamic QR generation based on final order total.

## Requirements
- **Functional**:
  - Show items in cart (image, name, flavor, price, quantity).
  - Modify quantity (min 1) or delete items.
  - Form fields for shipping info with basic validation.
  - Vouchers: `SENMOI` (50k off for orders >= 399k), `FREESHIP25K` (25k shipping discount for orders >= 300k).
  - Shipping methods: Standard (25k), Express 2H (50k).
  - Bank transfer shows dynamic VietQR with order reference.
  - COD / MoMo option.
- **Non-Functional**:
  - Premium design matching 3F Store colors (`forest`, `cream`, `ink`).
  - No external library dependencies needed (pure Tailwind + Lucide + Framer Motion).

## Architecture
- **State Flow**:
  - `localStorage['3f_cart']` stores array of `{ product: Product, quantity: number, variant: string, price: number }`.
  - Dispatches `cart-updated` custom event to window when cart changes.
  - `Header.tsx` listens to event and displays count.
  - `CartCheckout.tsx` reads state and displays item list.

## Related Code Files
- **Create**: [cart-helper.ts](file:///C:/Users/Admin/Downloads/ccc/src/lib/cart-helper.ts)
- **Create**: [CartCheckout.tsx](file:///C:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)
- **Modify**: [App.tsx](file:///C:/Users/Admin/Downloads/ccc/src/App.tsx)
- **Modify**: [Header.tsx](file:///C:/Users/Admin/Downloads/ccc/components/Header.tsx)
- **Modify**: [ProductDetail.tsx](file:///C:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)

## Implementation Steps
1. Create `src/lib/cart-helper.ts` with cart read/write logic and event dispatching.
2. Update `src/pages/ProductDetail.tsx` to call helper functions on "Thêm vào giỏ" and "Mua ngay".
3. Update `components/Header.tsx` to link to `/cart` and update cart item count dynamically.
4. Implement `src/pages/CartCheckout.tsx` with all sections (Cart, Checkout form, payment, coupon, QR modal).
5. Update `src/App.tsx` with the route `/cart`.
6. Run `npm run build` to verify compiling.

## Todo List
- [ ] Create `cart-helper.ts`
- [ ] Connect `ProductDetail.tsx`
- [ ] Connect `Header.tsx`
- [ ] Create `CartCheckout.tsx`
- [ ] Create route in `App.tsx`
- [ ] Test build compile

## Success Criteria
- Adding item from product detail redirects/adds correctly.
- Header updates cart item count.
- `/cart` loads items, updates subtotal, applies coupon.
- Checking out with VietQR shows QR modal with transfer code and amount.
- Code compiles without warnings/errors.

## Risk Assessment
- *Risk*: LocalStorage state mismatch across routes.
- *Mitigation*: Trigger a window-level custom event on updates, and make sure `Header` and `CartCheckout` handle state hooks cleanly.

## Security Considerations
- Standard client-side inputs validated before submission.
- Do not store sensitive info in localStorage.
