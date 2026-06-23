# Researcher Report: Voucher System Logic

- **Date**: 2026-06-23
- **Time**: 11:31
- **Slug**: voucher-system-logic
- **Skill**: Research / Technical Analysis

I have compiled the full technical documentation of the Voucher system behavior, database schema, active integrations, and constraints. The complete documentation has been written to the project's documentation folder at [voucher-system-logic.md](file:///c:/Users/Admin/Downloads/ccc/docs/voucher-system-logic.md).

## Summary of Core Voucher Logic

### 1. DB Schema & Placement Flags
The `coupons` table contains attributes representing placement visibility:
- `show_on_home`: Displays the voucher card inside the homepage Carousel.
- `show_in_cart`: Displays voucher suggestions inside the checkout drawer.
- `show_in_ai_advisor`: Links the voucher with the AI Advisor's result popup.

### 2. Validation Pipeline
During application, the coupon validation logic verifies:
1. Active status (`is_active = 1`).
2. Timing constraints (`starts_at` and `ends_at`).
3. Order threshold (`min_order_amount`).
4. Global usage limit (`usage_limit`).
5. Per-customer usage limit (`per_customer_limit`) matched against the customer's phone in completed orders.

### 3. AI Advisor Constraints
- Only a maximum of **1 voucher** is allowed to have `show_in_ai_advisor = 1` active at a time.
- The model `Coupon.php` resets other records when saving a coupon with the AI flag enabled.
- The admin dashboard displays warning texts under the toggle in the editing form.
- The AI results dialog renders the voucher card shape matching the website's `VoucherCard` style.
