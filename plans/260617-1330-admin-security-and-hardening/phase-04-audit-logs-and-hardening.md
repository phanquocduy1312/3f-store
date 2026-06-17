# Phase 4: Audit Logging & CORS/Headers Hardening

Integrate audit logger into key admin actions, lock down CORS origins, suppress error stack traces on production, and clean public folders.

## Context Links
- [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-02-auth-endpoints-and-middleware.md)

## Requirements
- Audit Logs:
  - Record ID, User ID, action string, target type, target ID, client IP, user agent, and custom JSON metadata.
  - Hook into `OrderController.php`, `LoyaltyController.php`, `ShopeePointRequestController.php`, `ProductController.php`.
- CORS Hardening:
  - Reject non-matching CORS origins.
  - Dynamically match `localhost:5173` on development and config public URL on production.
- Production Error Masking:
  - Do not echo PHP warnings or stack traces inside JSON responses.
- Public Directory Cleanup:
  - Ensure no sensitive import or debug scripts remain in `/public`.

## Related Code Files
- [MODIFY] [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)
- [MODIFY] [LoyaltyController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php)
- [MODIFY] [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)
- [MODIFY] [ProductController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ProductController.php)
- [MODIFY] [cors.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Helpers/cors.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Implementation Steps
1. Implement CORS origin matching in `cors.php`.
2. Clean index.php catch block to output standard `Internal server error` on prod mode (detect via DB host or environment flag) and log exact exception messages to PHP error log.
3. Integrate `AuditLog::write()` calls inside all critical controller state updates.
4. Scan the `/public` directory to remove temporary test/import files.

## Todo List
- [ ] Implement production-grade dynamic CORS in `cors.php`
- [ ] Mask backend error stack traces in production environment
- [ ] Connect audit logger to admin controller handlers
- [ ] Scan and delete unsecure helper files in public directory

## Success Criteria
- Request origin is strictly validated under CORS.
- Database records are populated in `admin_audit_logs` for every update.
- Public folder is completely free of transient setup/seed scripts.
