# Scout Report: Migrate Product Catalog to MySQL

* **Date**: 260617
* **Time**: 1200
* **Task**: migrate-product-catalog-to-mysql
* **Author**: Antigravity

## Codebase Scouting Findings

I have explored the codebase and found that the system is already very well prepared for this migration. Most of the files are already in place:

### 1. Database Schema
* **File**: `3f-api/database/product_catalog_schema.sql`
* **Status**: fully defined. It contains definitions for:
  * `product_categories`
  * `products`
  * `product_variants`
  * `product_images`
  * `product_import_batches`
  * `product_import_rows`
  * `inventory_transactions`

### 2. Import Script
* **File**: `scripts/import-products-json-to-mysql.mjs`
* **Status**: fully implemented. It:
  * Loads connection info from `.env` files in root and `3f-api/`.
  * Runs the schema definitions from `product_catalog_schema.sql` automatically.
  * Reads `data/products.json`.
  * Upserts categories, products, variants, and images.
  * Logs actions in `product_import_batches` and `product_import_rows`.

### 3. Backend Controllers & Models
* **Files**:
  * `3f-api/app/Models/Product.php` - handles database queries and runs the database migration programmatically in the constructor.
  * `3f-api/app/Services/ProductCatalogService.php` - maps database rows to clean API response objects.
  * `3f-api/app/Controllers/ProductController.php` - exposes HTTP endpoints for listing, details, and categories.
  * `3f-api/public/index.php` - routes registered under `/api/products`, `/api/products/detail`, `/api/product-categories`, and admin equivalents.

### 4. Frontend API Client
* **File**: `src/api/productsApi.ts`
* **Status**: fully implemented. Exposes `getProducts`, `getProductDetail`, and `getProductCategories` using standard fetch to `VITE_API_BASE_URL`.

### 5. Frontend Pages & Components
* **Files**:
  * `src/pages/ProductDetail.tsx` - uses `getProductDetail` and `getProducts` APIs. Correctly handles variant selection and validation before adding to cart.
  * `components/ProductListing.tsx` - uses `getProducts` API. Handles query filters, pricing, pagination, and loading/error states.

### 6. Deployment Script
* **File**: `scripts/deploy_ftp.py`
* **Status**: copies `3f-api` to Plesk. Excludes `.env`, `storage/uploads/`, and `storage/logs/`. Since `storage/imports/` is not excluded, it will be uploaded.

## Action Plan

The migration can be completed by:
1. Running the import script locally to populate the local MySQL database.
2. Verifying database counts.
3. Building and running the frontend locally to test functionality against the local API.
4. Deploying the backend and running the import script against the production DB.
5. Verifying the production API and frontend build.
