# Phase 2: Frontend Integration & Deployment

## Context Links
* [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1200-migrate-product-catalog-to-mysql.md)
* [Phase 1 Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1200-migrate-product-catalog-to-mysql/phase-01-database-import.md)

## Overview
* **Priority**: High
* **Status**: Pending
* **Description**: Verify the frontend works locally with the backend APIs, deploy the backend code to Plesk, run the import on production, and do a final E2E test.

## Key Insights
* Frontend components `ProductListing.tsx` and `ProductDetail.tsx` are already updated to use `productsApi.ts` client.
* Cart interactions properly store the correct ID parameters including `productId`, `variantId`, and `sku`.

## Requirements
* Frontend must fetch products and categories dynamically.
* Production Plesk DB must be updated with the product tables.
* FTP deployment should run cleanly without disrupting active production state.

## Related Code Files
* **Frontend Components**:
  * [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)
  * [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
* **FTP Deploy Script**: [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)

## Implementation Steps
1. Build the frontend locally to verify typescript compile step (`npm run build`).
2. Run local dev server (`npm run dev`) and visually check product listing and details.
3. Deploy the backend code using `python scripts/deploy_ftp.py`.
4. (Optional) Run the import script locally targeting production DB or execute it via server shell if SSH is available.
5. Verify REST API endpoints on the trial environment.

## Todo List
- [ ] Build project locally to verify no type or bundler errors.
- [ ] Run the FTP deploy script.
- [ ] Ensure database tables are created on the remote MySQL server.
- [ ] Populate remote MySQL server with data.
- [ ] Test the production URL.

## Success Criteria
* Production APIs return success responses.
* Production URL shows real products.

## Risk Assessment
* **Risk**: Production MySQL credentials in `.deploy.env` or local environmental mismatch. **Mitigation**: Double check files before running local migration targeting production DB.
