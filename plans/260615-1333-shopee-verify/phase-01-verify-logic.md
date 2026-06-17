# Phase 1: Verify Logic

## Context Links
- [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1333-shopee-verify/plan.md)
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260615-1333-shopee-verify.md)

## Requirements
- Auto-migrate `shopee_point_requests` database table to add verification columns.
- Update `ShopeeApiService` with token loading, auto-refreshing, and get order details API integration.
- Implement duplicate prevention: if same order code is already approved/valid, mark as `duplicate`.
- Fetch Shopee order from sandbox, compare total amount (with tiny threshold tolerance +/- 100 VND), check order status (must be `COMPLETED` to be `valid`, else `invalid_order_status`).
- Map errors to `manual_review` or `not_found`.
- Implement single verify and bulk verify POST routes and endpoints.
- Log error communications safely.

## Related Code Files
- [MODIFY] [schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/schema.sql)
- [MODIFY] [ShopeeApiService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/ShopeeApiService.php)
- [MODIFY] [ShopeePointRequest.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/ShopeePointRequest.php)
- [MODIFY] [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- [MODIFY] [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)

## Implementation Steps
1. **Schema Update**: Edit `schema.sql` to include verification fields. Add auto-migration logic to `ShopeePointRequest.php`'s constructor.
2. **ShopeeApiService Enhancements**:
   - Merge custom GET parameters in `request()`.
   - Implement `getLatestValidToken()`.
   - Implement `getOrderDetail($orderSn)`.
3. **ShopeePointRequest Model Enhancements**:
   - Add database methods: `updateVerification()`, `getPendingVerificationRequests()`, `checkDuplicateOrderCode()`.
4. **Router & Entrypoint Updates**:
   - Add routes inside `Router.php` (mapping) and `index.php` (dispatches).
5. **Controller Actions**:
   - Implement `verify()` to lookup, validate, query Shopee API, handle response mapping, and save results.
   - Implement `verifyBulk()` for batched request matching.
