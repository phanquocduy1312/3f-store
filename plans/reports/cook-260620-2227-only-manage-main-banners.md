# Progress Report: Simplification of Banner Management System

## Overview
Based on user feedback, the Banner Management System has been simplified to **only manage the main hero slider** (`home_hero_slider`). The side promotion banners (`home_promo_top_right` and `home_promo_bottom_right`) have been restored to their original static design.

## Files Added/Modified

### Backend
1. **Model & Migration Modification**:
   - [Banner.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Banner.php): Restructured the whitelist of placements to only allow `home_hero_slider`. Added automatic seeding logic that populates the database with the 3 default main homepage hero banners when empty.
   - [run_migration.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_migration.php): Added corresponding seed statements to seed data if the table is empty.

### Frontend
1. **API Types & Helpers**:
   - [bannersApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/bannersApi.ts): Updated `BannerPlacement` typescript union type to only contain `'home_hero_slider'`.
2. **Client Homepage Integration**:
   - [HeroSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/HeroSection.tsx):
     - Removed dynamic states (`topRightPromo`, `bottomRightPromo`).
     - Rewrote fetch hook to request only `"home_hero_slider"` from the endpoint.
     - Restored the rendering of the side promo cards (AI Pet Advisor and registration vouchers) to their original static, clean layouts.
3. **Admin Management UI**:
   - [AdminBannersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminBannersPage.tsx):
     - Removed the placement filters dropdown from the toolbar.
     - Hid the placement select dropdown container in the campaign creation/editing modal (defaults automatically to `home_hero_slider`).
     - Removed the "Vị trí" (Placement) and "Thời gian hiển thị" (Scheduled dates) columns from the table layout and adjusted grid colSpans from 6/7 to 5.
     - Removed the start time, end time, and CTA button text input fields from the campaign form modal.
     - Updated KPI metrics section to show Total, Active, and Total Clicks (hiding the Scheduled KPI card since dates are removed).
     - Deleted the unused `getPlacementText` helper utility and dates checks inside `getStatusBadge` to fix TypeScript compilation.

## Verification & QA
1. **TypeScript Typecheck**:
   - Executed `npx tsc --noEmit` which completed successfully with **0 compiler errors**.
2. **Production Build**:
   - Run `npm run build` which succeeded with **0 warnings/errors**.
3. **Staging Deploy**:
   - Synchronized updated model code to remote via `python scripts/deploy_ftp.py`.
4. **Staging Endpoint Verification**:
   - Native curl requests to `/api/banners` and `/api/banners/:id/click` return valid JSON outputs matching standard success schemas.
