# Phase 1: Backend Search API Refactoring

**Context Links:**
* Product Model: [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
* Product Service: [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php)
* Product Controller: [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)

---

## Overview
* **Priority**: High
* **Current Status**: Pending
* **Description**: Extend `GET /api/products` query param `q` to search across fields in `products` and `product_variants` table, with basic relevance sort, safe prepared statements, query normalization, and a hard capped limit.

## Requirements
* Support `GET /api/products?q=keyword&limit=12`.
* Search fields:
  * `products.name`
  * `products.brand`
  * `products.description`
  * `products.slug`
  * `product_variants.sku`
  * `product_variants.variant_name` (since database field name is `variant_name`).
* Query normalization: `trim`, collapse multiple spaces to a single space.
* Minimum keyword length: if `q` length is less than 2, do not apply search filter.
* Limit constraints: if query parameter `limit` is greater than 20, force clamp to 20 for suggestions. Otherwise default limit is 12 (as per list page requirement) and max limit is 60 (for products catalog).
* Sorting: If `q` is active, sort by relevance first:
  1. Matches start of product name (`p.name LIKE :startsWith`) -> 1st priority.
  2. Matches anywhere in product name (`p.name LIKE :contains`) -> 2nd priority.
  3. Matches anywhere in brand (`p.brand LIKE :contains`) -> 3rd priority.
  4. Others -> 4th priority.
  Then sub-sort by `p.sold_count DESC`, and `p.id DESC`.

## Architecture
```
[Client] ---> GET /api/products?q=pate ---> Router ---> ProductController ---> ProductCatalogService ---> Product Model ---> DB
```

## Related Code Files
* [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
* [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)

## Implementation Steps
1. **Model (`Product.php`)**:
   - Update `buildWhere()` to normalize `q` by trimming and collapsing spaces.
   - If normalized `strlen($q) >= 2`, add the custom `WHERE` clause check (including sub-query search check on `product_variants` table).
   - Update `buildSort()` to check if `q` is active and construct the `CASE WHEN` relevance ordering, appending `startsWith` and `contains` placeholders.
   - Ensure these placeholders are bound in `listProducts()` only when executing the list query, preventing errors in the count query.
2. **Controller (`ProductController.php`)**:
   - Limit clamp: if `q` is present in the suggestion context, check if we need to limit to 20. (Actually we can clamp `limit` to max 20 if `q` is present, or just let catalog page request up to 60. Wait: "Nếu limit > 20 thì ép về 20" is a general rule for suggestions search, let's clamp `limit` to 20 if `q` is provided, or clamp it in the model/controller).

## Todo List
- [ ] Normalize query keyword in `Product::buildWhere`
- [ ] Refactor search query statement to search across categories, brands, variants, and descriptions
- [ ] Implement relevance sorting inside `Product::buildSort`
- [ ] Fix count query vs list query parameter binding mismatch
- [ ] Add limit clamp logic in controller or model

## Success Criteria
- [ ] `GET /api/products?q=nekko` returns active Nekko products.
- [ ] No SQL syntax errors occur with keywords containing single quotes `'`.
- [ ] Unused binding parameter warnings/exceptions are absent.
- [ ] Request limits exceeding 20 are clamped to 20 when `q` search parameter is passed.
