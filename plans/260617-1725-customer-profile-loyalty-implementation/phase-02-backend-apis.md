# Phase 2: Router Extension & Backend Controllers

## Context Links
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [Request.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Request.php)
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Overview
- Priority: High
- Status: Pending
- Description: Extend the Mini PHP MVC Router to support dynamic placeholder routes and REST verbs (PATCH, DELETE, PUT), and build backend controllers for Customer Profile, Addresses, Orders, Vouchers, Pets, Security, and Club.

## Related Code Files
- [MODIFY] [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [MODIFY] [Request.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Request.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- [NEW] [CustomerProfileController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerProfileController.php)

## Implementation Steps
1. Modify `Router.php` to match pattern routes (e.g. `/api/customer/addresses/:id`), extract placeholder values, and populate them in `$_GET` and `$_REQUEST`.
2. Add routing registration for PATCH, DELETE, and PUT methods.
3. Update `Request.php` to handle `PATCH` and `DELETE` requests in the input parsing logic.
4. Implement `CustomerProfileController.php` with handlers for Profile (GET, PATCH, request OTP, verify OTP), Address CRUD, Pets CRUD, Security (password change, sessions listing and revocation), Vouchers list, Order listings/cancellation/reordering, and Loyalty summary.
5. Register routes in `index.php`.

## Todo List
- [ ] Implement dynamic routing and REST verbs in `Router.php` and `Request.php`.
- [ ] Write `CustomerProfileController.php` with all necessary endpoints.
- [ ] Register all new endpoints in `index.php`.

## Success Criteria
- Router matches routes like `/api/customer/orders/:orderCode` and extracts the parameter successfully.
- Profile, Address, Pets, Orders, Club, Vouchers, Security endpoints are functional and secure (enforce `AuthMiddleware::requireCustomer()`).
