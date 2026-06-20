# Cook Report: Unify Wishlist Display Pricing

## Context
- Goal: Fix pricing discrepancy on the Wishlist page compared to homepage/catalog sections.
- Tasks:
  1. Synchronized `CustomerWishlist.php` pricing format (min variant price as standard, max original price as old price) with `ProductCatalogService.php` to prevent layout overlaps and display clean price figures.
  2. Enhanced `ProductCard.tsx` to conditionally hide `oldPrice` when `oldPriceValue <= priceValue`.

## Changes Implemented
- [CustomerWishlist.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/CustomerWishlist.php):
  - Removed range price formatting.
  - Mapped `price` to formatted `minPrice` and `oldPrice` to formatted `maxOriginalPrice`.
- [ProductCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductCard.tsx):
  - Refined `hasDiscount` logic to require `oldPriceValue > priceValue`.
  - Conditioned `oldPrice` rendering blocks on `hasDiscount` instead of `product.oldPrice`.

## Verification
- Ran frontend compilation check: `npm run build` completed successfully.
- Ran backend deployment script: `python scripts/deploy_ftp.py` successfully deployed updated PHP model to staging.

## Unresolved Questions
- None
