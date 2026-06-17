# Scout Report: Fix Taxonomy and Filters

* **Date**: 260617
* **Time**: 1252
* **Task**: fix-taxonomy-and-filters
* **Author**: Antigravity

## Core Components to Modify & Create

### 1. Database Schema & Categories Seed
* **Target**: Seed standard categories:
  * `thuc-an-cho-meo` (name: Thức ăn cho mèo, sort_order: 10)
  * `thuc-an-cho-cho` (name: Thức ăn cho chó, sort_order: 20)
  * `pate-snack` (name: Pate & Snack, sort_order: 30)
  * `sua-dinh-duong` (name: Sữa & Dinh dưỡng, sort_order: 40)
  * `ve-sinh-thu-cung` (name: Vệ sinh cho thú cưng, sort_order: 50)
  * `phu-kien-do-choi` (name: Phụ kiện & Đồ chơi, sort_order: 60)
  * `khac` (name: Khác, sort_order: 999)
* **Check**: If the table `products` lacks columns `pet_type` or `product_type`, migrate them. (They already exist in `product_catalog_schema.sql`).

### 2. ProductClassificationService
* **New File**: `3f-api/app/Services/ProductClassificationService.php`
* **Purpose**: Parse product names and descriptions to classify `pet_type`, `product_type`, and target `category_id` (via slug) and `brand`.

### 3. Reclassification CLI Script
* **New File**: `scripts/reclassify-products.php`
* **Purpose**: A CLI script to fetch all database products, execute the classification service logic, update products, and print summary statistics.

### 4. Backend API Changes (`ProductController`, `Product.php`)
* **Modify**: Update `buildWhere` and filtering logic in `app/Models/Product.php` to handle:
  * `petType` (cat: `cat` + `both`, dog: `dog` + `both`, both: `both`).
  * `category` / `categorySlug` (filter by category slug).
  * `productType`.
  * `brand`.
* **New Endpoint**: `GET /api/products/filters` returning count summaries of categories, petTypes, productTypes, brands, and min/max prices.

### 5. Frontend UI Adjustments
* **Modify**: `components/ProductListing.tsx` to call `/api/products/filters` and reload products.
* **Modify**: `src/pages/Home.tsx` to fetch dynamic products from `/api/products?petType=cat...` and `petType=dog...`.
* **Modify**: Dropdowns in `components/Header.tsx` and buttons in homepage sections.
