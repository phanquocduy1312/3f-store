# Scout Report: Admin Product Management

**Target Description**: Admin Product Management implementation
**Scout Type**: Codebase scouting and file discovery

## Files Discovered

### Backend (PHP MVC)
- [Product.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Product.php) - The product database model. Needs custom transactional `saveProduct`, `toggleActive`, `getAdminProducts`, `getAdminProductDetail` methods.
- [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php) - Controllers for product routes. Needs token authorization integration and creation of new product compatibility.
- [ProductCatalogService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ProductCatalogService.php) - Interface between controller and model.
- [AuthMiddleware.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/AuthMiddleware.php) - Admin session and validation middleware.
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php) - Custom routing and dispatcher.
- [product_catalog_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/product_catalog_schema.sql) - Database schemas for products, variants, images.
- [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql) - Database schema for orders and order items (necessary for soft-delete verification).

### Frontend (React/TypeScript)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts) - API requests client. Needs admin endpoints.
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) - Frontend router. Needs admin product paths.
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) - Main admin sidebar. Needs "Sản phẩm" navigation link.

## Initial Analysis
1. **Model incomplete**: Rudimentary methods exist in `Product.php` but they do not process variants/images or perform database transactions.
2. **Authorization missing**: `ProductController.php` contains administrative routes but does not actively require tokens or throw 401/403 errors.
3. **Frontend files missing**: `AdminProductsPage` and `AdminProductForm` need to be implemented from scratch.
