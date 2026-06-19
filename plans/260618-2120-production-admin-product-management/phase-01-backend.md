# Phase 01: Backend Alignment

## Context Links
- [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
- [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)
- [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php)

## Proposed Changes

### [3f-api]

#### [MODIFY] [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
- Add stats retrieval logic in `getAdminProducts()` to return counts for: `totalProducts`, `activeProducts`, `inactiveProducts`, `outOfStockProducts`, `lowStockProducts`.
- In `getAdminProductDetail()`, query each variant against the `order_items` table and append `hasOrderHistory` boolean field to each variant.
- In `saveProduct()`:
  - Add server-side validation rejecting variants with price <= 0, or stock < 0, or if original price is not null and original price < price.
  - Refine slug generator normalization: remove emojis, lower case, strip accents, replace spaces/invalid chars with `-`, compress multiple dashes, truncate to max 120-160 characters. Maximum slug length limit of 180.
  - Sync images logic: ensure primary image deletion automatically designates another remaining image as primary.
  - Synced aggregates (`min_price`, `max_price`, `total_stock`, `variant_count`) calculated from active variants, discarding frontend calculations.

#### [MODIFY] [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php)
- Map `variants[].hasOrderHistory` property in `mapVariant()`.
- Return `stats` property in `listProducts()`.

#### [MODIFY] [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)
- Format validation error responses properly (HTTP 400) when price or original price checks fail.

## Success Criteria
- API response for admin products list contains `stats` object.
- API response for product details variants lists accurate `hasOrderHistory` per variant.
- Server validation rejects invalid prices/original prices.
- Safe image handling fallback (auto-primary assignment).
