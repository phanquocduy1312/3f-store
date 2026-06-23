# Scout Report: Product Card Consolidation

## Summary of Findings

1. **`components/ProductCard.tsx` (Global Component)**
   - Used in `WishlistPage.tsx` and `ProductSlider.tsx`.
   - Layout: Simple bordered layout, floating wishlist button, Sale/New badges, rating/sold, and two action buttons at the bottom ("Cart icon" and "Mua ngay").
   - Styling: Hardcoded green colors (`border-forest`, `text-forest`, `bg-forest`), which is out of sync with the new blue theme configured via CSS variables (`rgb(var(--color-primary))`).

2. **`components/ProductListing.tsx` (Inline Card)**
   - Coded inline in `/products` page (lines 268-369).
   - Layout: Brand name on top (`product.brand`), title, star rating/sold, and price/cart icon row (no "Mua ngay" button).
   - Styling: Premium hover effects (gradient glow, sweeping light shimmer, zoom), styled correctly with theme CSS variables (`rgb(var(--color-primary))`, `rgb(var(--color-border))`, etc.).

3. **`src/pages/client/WishlistPage.tsx` (Wishlist)**
   - Currently uses `components/ProductCard.tsx`.
   - Looks inconsistent with the main `/products` catalog due to different card styles.

## Proposed Strategy

- **Unify `ProductCard.tsx`**: Update `components/ProductCard.tsx` to match the premium styling and layout of `ProductListing.tsx`'s card (with brand name, glow, shimmer, etc.).
- **Flexible Actions**: Support showing either the single Cart icon button (default, as in `/products`) or both Cart + "Mua ngay" buttons via a prop `showBuyNow?: boolean`.
- **Integrate Everywhere**:
  - Replace the inline card code in `ProductListing.tsx` with `<ProductCard product={product} />`.
  - Ensure `WishlistPage.tsx` and `ProductSlider.tsx` render the updated component correctly.
