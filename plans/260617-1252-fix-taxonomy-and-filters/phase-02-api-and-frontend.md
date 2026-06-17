# Phase 2: API & Frontend Integration

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1252-fix-taxonomy-and-filters.md)
* [Phase 1 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1252-fix-taxonomy-and-filters/phase-01-classification-service.md)

## Overview
* **Priority**: High
* **Status**: Complete
* **Description**: Implement dynamic filters REST API, update list products query parameters to support pet type mapping and other filters, and update the React homepage and sidebar components.

## Related Code Files
* **API Endpoints**:
  * [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php)
  * [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)
  * [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
* **Frontend Components**:
  * [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
  * [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)
  * [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
  * [Home.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/Home.tsx)

## Implementation Steps
1. Add `GET /api/products/filters` route in `index.php`.
2. Implement filters logic in `Product.php` and `ProductController.php`.
3. Update products list query logic in `Product.php` to handle pet type mapping (`cat` -> `cat` + `both`, `dog` -> `dog` + `both`).
4. Modify React frontend pages:
   - Call `/api/products/filters` in `ProductListing.tsx` and load dynamic categories/brands/petTypes/productTypes sidebar filters.
   - Update homepage dog/cat sections to call `/api/products?petType=cat...` and `petType=dog...`.
   - Update Header navigation dropdowns and homepage buttons.
5. Deploy changes to Plesk and run E2E verification.

## Todo List
- [x] Implement `GET /api/products/filters` endpoint.
- [x] Update `/api/products` filter parameters logic.
- [x] Update frontend products listing API calls and sidebar filters component.
- [x] Update homepage sections.
- [x] Update Header navigation.
- [x] Deploy to Plesk and test.

## Success Criteria
* Sidebar counts match the actual database taxonomy.
* Clicking homepage buttons and PDP categories redirects to correctly filtered results page.
