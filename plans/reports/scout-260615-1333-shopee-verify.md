# Scout Report: Shopee Order Verification

## Context

* **Project**: 3F Store / 3F Club
* **Date**: 260615 (15th June 2026)
* **Time**: 13:33
* **Slug**: shopee-verify

## Findings

We need to implement a Shopee order verification feature. The goal is to allow administrators to verify point requests against the Shopee sandbox API.

### Database Schema Updates
The `shopee_point_requests` table lacks columns to store Shopee API verification results.
Fields to add:
- `matched_shopee_order_id` VARCHAR(100) NULL
- `shopee_api_status` VARCHAR(50) NULL
- `shopee_api_order_amount` INT NULL
- `shopee_api_raw_json` LONGTEXT NULL
- `verified_at` DATETIME NULL
- `verification_note` TEXT NULL

### Code Components affected:
1. **`app/Services/ShopeeApiService.php`**:
   - Needs `getLatestValidToken()` to automatically fetch and refresh access tokens.
   - Needs `getOrderDetail($orderSn)` to call the `/api/v2/order/get_order_detail` endpoint.
   - Needs support for HTTP GET query parameters merging in the standard `request()` method.
2. **`app/Models/ShopeePointRequest.php`**:
   - Needs `checkAndMigrate()` to auto-add missing columns (avoids manual database tasks on Plesk).
   - Needs `updateVerification($id, $data)` to save verification status and details.
   - Needs `getPendingVerificationRequests($ids)` to fetch pending verification requests.
   - Needs `checkDuplicateOrderCode($orderCode, $excludeId)` to prevent multiple approved or valid claims on the same Shopee order.
3. **`app/Core/Router.php`**:
   - Needs endpoint mappings for query-string fallback parameter routing (`admin.shopee.request_verify`, `admin.shopee.request_verify_bulk`).
4. **`public/index.php`**:
   - Register the two POST routes.
5. **`app/Controllers/ShopeePointRequestController.php`**:
   - Implement `verify()` to verify a single point request.
   - Implement `verifyBulk()` to verify multiple point requests.

## Recommendations
- Implement database auto-migration inside `ShopeePointRequest`'s constructor to ensure zero-touch schema updates.
- Allow a tiny discrepancy threshold (+/- 100 VND) when comparing total amount input against Shopee API results.
- Implement strict duplicate checking to flag `verification_status = 'duplicate'` if another approved/valid request has the same order code.
- Fully log API communication errors to `storage/logs/shopee.log` with masked sensitive credentials.
