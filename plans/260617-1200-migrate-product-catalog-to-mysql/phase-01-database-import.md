# Phase 1: Database Setup and Local Import

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1200-migrate-product-catalog-to-mysql.md)
* [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1200-migrate-product-catalog-to-mysql/plan.md)

## Overview
* **Priority**: High
* **Status**: In Progress
* **Description**: Create database tables schema and import the 113 products and 910 variants from `data/products.json` into the local MySQL database.

## Key Insights
* The migration logic is fully defined in `scripts/import-products-json-to-mysql.mjs` and the database structure in `3f-api/database/product_catalog_schema.sql`.
* The import script parses prices, automatically groups option values from variant attributes, infers pet and product types, and updates records on duplicate keys.

## Requirements
* MySQL tables must match the schema specified in the request.
* Exactly 113 products and 910 variants should be imported without duplicates.
* Main and gallery images must be populated in `product_images` with correct associations.

## Architecture
* **Data Flow**: `products.json` -> `import-products-json-to-mysql.mjs` -> local MySQL DB (via mysql2 connection).
* The script creates the database `3f` if missing, then runs schema queries, then inserts data.

## Related Code Files
* **Schema SQL**: [product_catalog_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/product_catalog_schema.sql)
* **Import Script**: [import-products-json-to-mysql.mjs](file:///c:/Users/Admin/Downloads/ccc/scripts/import-products-json-to-mysql.mjs)
* **Backend Env**: [3f-api/.env](file:///c:/Users/Admin/Downloads/ccc/3f-api/.env)

## Implementation Steps
1. Verify local MySQL server is running and accessible using credentials in `3f-api/.env`.
2. Run `npm run import:products:mysql` in terminal.
3. Validate output logs for number of products, variants, and images created/updated.
4. Perform verification queries against local database.

## Todo List
- [ ] Verify local database connection.
- [ ] Run `npm run import:products:mysql`.
- [ ] Perform SQL verification queries on database count.

## Success Criteria
* Products count = 113.
* Product variants count = 910.
* No duplicate source product IDs or source SKU IDs.

## Risk Assessment
* **Risk**: Local MySQL not running. **Mitigation**: Ensure server is started or run a check command.

## Security Considerations
* Ensure database passwords are kept in local `.env` files and not committed.

## Next Steps
* Proceed to Phase 2: Frontend Integration & Deployment.
