# Cook Report: Shopee Order Verification

## Context

* **Project**: 3F Store / 3F Club
* **Date**: 260615 (15th June 2026)
* **Time**: 13:33
* **Slug**: shopee-verify

## Accomplishments

All requirements for the Shopee order verification have been implemented successfully:

1. **Database Schema Auto-Migration**:
   - Integrated `checkAndMigrate()` in `ShopeePointRequest`'s constructor. This dynamically checks for and adds necessary columns (`matched_shopee_order_id`, `shopee_api_status`, `shopee_api_order_amount`, `shopee_api_raw_json`, `verified_at`, `verification_note`) on first application startup.
2. **Shopee API Service Enhancements**:
   - Added support in `request()` to merge custom parameters for GET requests (specifically for lookup APIs).
   - Added `getLatestValidToken()` to automatically handle access token refreshing using refresh tokens prior to execution.
   - Added `getOrderDetail($orderSn)` calling Shopee Order API `/api/v2/order/get_order_detail`.
3. **Shopee Point Request Model**:
   - Added methods `updateVerification()`, `getPendingVerificationRequests()`, and `checkDuplicateOrderCode()`.
4. **Router & Entrypoint**:
   - Registered query string aliases in `Router.php` and POST routes in `public/index.php`.
5. **Shopee Verify Controller**:
   - Created `ShopeeVerifyController.php` (under 200 lines limit) which handles the validation logic for single and bulk requests.
   - Implemented amount matching with +/- 100 VND threshold tolerance.
   - Checked duplicate claims and order status completeness (`COMPLETED` requirement).
6. **Documentation & Changelog**:
   - Updated `docs/deploy-ftp-python.md` with instructions on how to test the endpoints and verification status definitions.
   - Registered additions in `docs/project-changelog.md` and `docs/project-roadmap.md`.
