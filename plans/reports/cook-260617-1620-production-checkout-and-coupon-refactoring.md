# Progress Report: Production Checkout & Coupon Refactoring

* **Date**: 260617
* **Time**: 1620
* **Task**: Checkout and coupon refactoring for production.
* **Status**: Planning phase.

## Current Findings
* Existing DB `orders` schema has columns for subtotal, shipping_fee, discount, and total. No `coupon_code` column exists.
* Database auto-migrates inside `Order::migrate()` by reading `/database/orders_schema.sql`.
* Frontend `CartCheckout.tsx` currently displays pre-set fixed buttons for coupons and shipping options.
* Vietnam provinces API needs v2 endpoint: `https://provinces.open-api.vn/api/v2/`.

## Action Items
* Add schema updates to `orders_schema.sql` and run `ALTER TABLE orders ADD COLUMN coupon_code` in `Order::migrate()`.
* Seed `GIAM50K` coupon.
* Implement `Coupon` model, validation controller `/api/coupons/validate`, and register in `index.php`.
* Modify `OrderController::create` to compute coupon details server-side inside a database transaction.
* Refactor frontend layout into 2 desktop columns / 1 mobile column.
* Retrieve provinces and wards dynamically, format address payload correctly.
* Display coupon and discount values on administrative detail views.
