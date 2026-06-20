# Phase 02: Integrate and Verify

## Context Links
- [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)
- [WishlistPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/WishlistPage.tsx)
- [ProductSlider.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductSlider.tsx)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Replace the inline product card code in `ProductListing.tsx` with the updated `<ProductCard>` component, verify visual rendering on `/wishlist`, and ensure standard build passes.

## Requirements
- Clean up duplicate card markup in `ProductListing.tsx` and use the `<ProductCard>` component.
- Ensure the wishlist page renders consistent cards.
- Ensure the featured products slider renders cards with the "Mua ngay" button intact if desired (by passing `showBuyNow={true}`).

## Related Code Files
- [MODIFY] [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)
- [MODIFY] [WishlistPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/WishlistPage.tsx)

## Implementation Steps
1. Open `components/ProductListing.tsx` and locate the inline article markup.
2. Replace it with `<ProductCard product={product} index={idx} />`.
3. In `WishlistPage.tsx`, ensure it uses the updated `ProductCard` (default layout).
4. Run standard React compilation/build check command `npm run build` or `vite build` (if available) to verify code compilation.

## Todo List
- [ ] Replace inline card in `ProductListing.tsx`
- [ ] Verify `WishlistPage.tsx`
- [ ] Run typescript compile checks
- [ ] Manually check pages for consistency

## Success Criteria
- The application builds cleanly with no compile errors.
- Catalog page, Wishlist page, and Home page slider look consistent and premium.
