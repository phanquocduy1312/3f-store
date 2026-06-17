# Phase 1: Database Seeding & Classification Service

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1252-fix-taxonomy-and-filters.md)
* [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1252-fix-taxonomy-and-filters/plan.md)

## Overview
* **Priority**: High
* **Status**: Complete
* **Description**: Create category seeds, implement ProductClassificationService in PHP, and write the reclassification script to update the products in the database.

## Key Insights
* The classification logic must match the user requirements exactly for pet_type, product_type, and categories mapping.
* Vietnam accented characters should be normalized or checked.

## Related Code Files
* **New Classification Service**: `3f-api/app/Services/ProductClassificationService.php`
* **New Reclassification CLI**: `scripts/reclassify-products.php`

## Implementation Steps
1. Create `ProductClassificationService.php` with taxonomy rules.
2. Create `scripts/reclassify-products.php` which:
   - Connects to MySQL.
   - Inserts/updates default categories by slug without duplicates.
   - Loops through all products, runs classification, updates `pet_type`, `product_type`, `brand` (if null), and `category_id`.
   - Runs validation SQL queries to verify count.
3. Run the reclassification script locally: `php scripts/reclassify-products.php`.
4. Validate counts.

## Todo List
- [x] Create `ProductClassificationService.php`.
- [x] Create `scripts/reclassify-products.php`.
- [x] Run the reclassification script locally.
- [x] Verify categories count and reclassified counts via SQL.

## Success Criteria
* Reclassifying 113 products results in correct pet types and category associations.
* Counts match the expected taxonomy distribution.
