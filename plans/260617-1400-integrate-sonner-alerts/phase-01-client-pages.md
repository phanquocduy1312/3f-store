# Phase 1: Client Pages Alert Replacements

## Context Links
- [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- [CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)
- [OrderTracking.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/OrderTracking.tsx)

## Overview
- Priority: High
- Status: Todo
- Description: Replace custom toast state and default browser alerts in the client-facing detail and checkout pages.

## Key Insights
- We should use `toast.success` and `toast.error` from `sonner` which are cleaner and match the aesthetics.
- `ProductDetail.tsx` has custom toast rendering and timeout management. We can remove this entirely and rely on `sonner`.

## Requirements
- No more custom toast wrapper HTML in `ProductDetail.tsx`.
- All `alert(...)` validations in checkout and tracking replaced.

## Related Code Files
- `src/pages/ProductDetail.tsx` (modify)
- `src/pages/CartCheckout.tsx` (modify)
- `src/pages/OrderTracking.tsx` (modify)

## Implementation Steps
1. Import `toast` from `sonner` in all three files.
2. In `ProductDetail.tsx`:
   - Remove `showToast` state and the HTML layout for the custom toast.
   - Replace `setShowToast(true)` calls with `toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!")`.
3. In `CartCheckout.tsx`:
   - Replace form validations `alert` with `toast.warning` or `toast.error`.
   - Replace order creation errors with `toast.error(err.message)`.
4. In `OrderTracking.tsx`:
   - Replace invalid phone number check `alert` with `toast.error`.

## Todo List
- [ ] Remove `showToast` from `ProductDetail.tsx`
- [ ] Replace `setShowToast` with `toast.success` in `ProductDetail.tsx`
- [ ] Replace alerts with `toast.error`/`toast.warning` in `CartCheckout.tsx`
- [ ] Replace alerts with `toast.error` in `OrderTracking.tsx`

## Success Criteria
- Client actions like adding to cart, invalid fields, and network failures display as `sonner` toasts.
