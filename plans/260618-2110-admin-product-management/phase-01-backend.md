# Phase 01: Backend Implementation

## Context Links
- [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
- [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)
- [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php)
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql)

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Implement secure database operations, transactions, audit logging, and route-level protection on the PHP mini-MVC backend for product management.

## Key Insights
- **Aggregations**: Min/Max price, variant count, and stock must be recalculated on the backend after variant syncing.
- **Ordered Variants**: Hard-deleting variants with order history is strictly forbidden; must soft-delete (`is_active = 0`) if variant ID exists in `order_items`.
- **SKU Uniqueness**: Global uniqueness on `product_variants.sku` must be validated. If modifying, current variant can retain its own SKU.

## Requirements
- Enforce admin auth on all `/api/admin/products/*` routes.
- Implement robust transactional saving (`saveProduct`) with automatic rollback.
- Validate inputs, automatically generate unique slugs, and check SKU conflicts.
- Implement soft-deletes for ordered variants.
- Recalculate aggregates on-the-fly.

## Architecture
```
[Client] -> [ProductController] (Auth Check) -> [ProductCatalogService] -> [Product Model] (Transaction)
                                                                                  |
                                                                       +----------+----------+
                                                                       |          |          |
                                                                   [Products] [Variants] [Images]
```

## Related Code Files
- [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php) (Modify)
- [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php) (Modify)
- [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php) (Modify)

## Implementation Steps
1. **Route Security**: Add `AuthMiddleware::requireAdmin()` to `ProductController.php` endpoints.
2. **Model Methods**:
   - Write Vietnamese-friendly slug generator inside `Product.php`.
   - Update `listProducts` or add `getAdminProducts($filters)` to support searching by SKU, brand, category, active status, stock status (low stock, in stock, out of stock).
   - Write `getAdminProductDetail($id)` to return the full product structure including inactive variants and all gallery images.
   - Implement `saveProduct($payload)` inside a PDO database transaction:
     - Check SKU uniqueness (exclude current variant if updating).
     - Generate slug if empty; guarantee uniqueness.
     - Insert or update the product record.
     - Sync variants: compare database variants with payload variants. Insert/update, and soft-delete/delete removed variants depending on `order_items` check.
     - Sync images: update `product_images`, setting exactly one image as main.
     - Recalculate price ranges, stock, and variant count for the product.
     - Write to `admin_audit_logs`.
   - Implement `toggleActive($id, $isActive)` with audit log recording.

## Todo List
- [x] Implement Route Security in `ProductController`
- [x] Implement `getAdminProducts` filter options in `Product.php`
- [x] Implement `getAdminProductDetail` in `Product.php`
- [x] Implement `saveProduct` with transaction, validation, slug, variant & image sync, and audit logging
- [x] Implement `toggleActive` with audit logging in `Product.php`

## Success Criteria
- All admin product endpoints return 401 if token is invalid or missing.
- Save operations successfully commit and write logs.
- SKU conflicts return 400 with "SKU đã tồn tại."
- Ordered variant deletion sets `is_active = 0`.
- Aggregates (price range, stock) recalculate correctly.

## Risk Assessment
- Transaction deadlock if queries are not sequential: mitigated by locking/simple PDO sequences.
- Accidental delete of order history: verified via pre-deletion checks on `order_items`.

## Security Considerations
- Enforce token checks.
- Sanitize slug and validate input types (prices, quantities).
