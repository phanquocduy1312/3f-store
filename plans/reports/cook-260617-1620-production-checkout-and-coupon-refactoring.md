# Progress Report: Production Checkout & Coupon Refactoring

* **Date**: 260617
* **Time**: 1620
* **Task**: Checkout and coupon refactoring for production.
* **Status**: Completed

## Achievements & Implementation Summary
All objectives have been successfully met, fully tested, and deployed to production staging:

1. **Database Schema & Migrations**:
   - Declared `coupons` and `coupon_usages` tables in `orders_schema.sql`.
   - Updated `Order::migrate()` to automatically run `ALTER TABLE orders ADD COLUMN coupon_code` and seed the `GIAM50K` coupon.

2. **Backend Logic**:
   - Created `Coupon.php` and `CouponController.php` supporting detailed validity, date range, min subtotal, and per-user constraint checks.
   - Refactored `OrderController::create` to recalculate coupon validity and total sums server-side within a secure database transaction block.

3. **Frontend Redesign**:
   - Reorganized `CartCheckout.tsx` to display in 2 desktop columns (sticky summary and payment block on the right) and a single mobile column.
   - Removed the shipping options block, hardcoding ship fee to `0`.
   - Integrated administrative v2 API (`provinces.open-api.vn/api/v2`) loading provinces and wards dynamically, removing the district selection.
   - Connected backend-validated coupon text input field and cancellation badges.
   - Synchronized totals breakdown for Admin orders, tracking timeline, and success view.

4. **Verification & Deployment**:
   - `npx tsc --noEmit` and `npm run build` compiled without any errors.
   - Backend order tests executed successfully.
   - PHP changes uploaded to Plesk production server via `deploy_ftp.py`. Verified coupon validation live.
