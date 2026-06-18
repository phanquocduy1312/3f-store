# Scout Report: Real-time Product Search

* **Date**: 260617
* **Time**: 1642
* **Task**: Real-time product search feature implementation.
* **Status**: Completed Scouting

## Findings

### 1. Backend Catalog Architecture
- The catalog retrieval is centralized in `Product::listProducts` inside `3f-api/app/Models/Product.php`.
- Filter parameters are built by `buildWhere()` and sorting options are built by `buildSort()`.
- The `products` table has a `sold_count` column which is used for popular sorting, while `product_variants` has a `variant_name` column.
- The route `/api/products` is handled by `ProductController::list()` which reads query parameters and returns JSON.

### 2. Frontend Search Integration
- The current Header is `components/Header.tsx` which contains local states for `searchQuery` and `suggestions` (fetched with 300ms debounce), but it does not render the suggestions dropdown in the JSX.
- Path mapping in `tsconfig.json` resolves `@/*` to `./*`, meaning files under `src/components/` can be imported anywhere.
- The main product listing page is in `components/ProductListing.tsx`, which uses URL search params (`q`) to retrieve listing data, but it needs to be updated to show custom search result titles.
