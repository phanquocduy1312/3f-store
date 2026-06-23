# Scout Report: Duplicate Cart Items Investigation

## Findings
- Located `addToCart`, `updateQuantity`, and `removeFromCart` inside [cartHelper.ts](file:///c:/Users/Admin/Downloads/ccc/lib/cartHelper.ts).
- Found that `addToCart` uses strict equality `===` for ID checks which can fail if IDs have mismatching types (number vs string) or formats:
  - Product Detail and Quick Add Modal pass `id` as variant ID (e.g. `"14"`) or product ID.
  - Reorder Tab (in OrdersTab and OrderDetailTab) passes `id` as `"productId-variantId"` (e.g. `"23-14"`).
- We also identified that `components/pet-advisor/AiResult.tsx` does not supply `productId` to `addToCart`.

## Recommended Fixes
- Create a robust `isSameCartItem` helper function to handle type coercion, variant comparison, and ID format fallback.
- Integrate the helper across `addToCart`, `updateQuantity`, and `removeFromCart`.
- Update `AiResult.tsx` to supply the `productId` correctly.
