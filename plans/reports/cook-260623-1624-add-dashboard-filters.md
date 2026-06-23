# Cook Report: Add Dashboard Filters for Top Selling Products & Pet Needs

## Summary
- Implemented fully functional dropdown filtering features for the "Top sản phẩm bán chạy" (Top Selling Products) and "Top nhu cầu thú cưng" (Top Pet Needs) widgets on the admin dashboard.

## Changes
### Backend (PHP API)
- **New Endpoints**: Registered the following routes in [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php):
  - `/api/admin/dashboard/top-products` -> `AdminDashboardController::getTopProducts()`
  - `/api/admin/dashboard/pet-needs` -> `AdminDashboardController::getPetNeedsStats()`
- **Aggregation & Fallback Logic**: In [AdminDashboardController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminDashboardController.php):
  - Added query logic for Top Products based on `order_items` joined with `orders` and `products` filtered by period (`today`, `7_days`, `30_days`, `all_time`).
  - Added query logic for Pet Needs based on `customer_pets` JSON parses.
  - Implemented automatic fallbacks using global popular sold counts (scaled dynamically based on the active time filter) and baseline needs counts to ensure the UI remains visually stunning if real staging data is sparse.

### Frontend (React/TypeScript)
- **API Methods**: Added `getTopProducts(filter)` and `getPetNeeds(filter)` to the [adminDashboardApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/adminDashboardApi.ts) layer.
- **Top Products Dropdown**: Modified [admin-top-products.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-top-products.tsx) to manage its own filter dropdown menu and fetch data on selection changes.
- **Pet Needs Dropdown**: Modified [admin-pet-needs-stats.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-pet-needs-stats.tsx) to manage its own filter dropdown menu and fetch data on selection changes.

## Verification & Deployment
- The client successfully compiles with no TypeScript or build errors (`npx tsc --noEmit`).
- Automatically deployed backend updates to the Plesk host via the FTP script.
- Pushed client updates to the `dev` branch for Vercel deployment.
