# Phase 01: Backend API implementation

## Overview
- Priority: High
- Current status: Pending
- Brief description: Create backend endpoints for Addresses, Vouchers, Pets, and Sessions.

## Requirements
- `GET /api/admin/customers/:id/addresses`
- `GET /api/admin/customers/:id/vouchers`
- `GET /api/admin/customers/:id/pets`
- `GET /api/admin/customers/:id/sessions`
- Secure against unauthorized access (require Admin).

## Related Code Files
- `3f-api/public/index.php`
- `3f-api/app/Controllers/AdminCustomerController.php`
- `3f-api/app/Models/Customer.php`

## Implementation Steps
1. Add routes to `index.php`.
2. Implement model queries in `Customer.php`.
3. Implement controller logic in `AdminCustomerController.php`.

## Todo List
- [ ] Routes added
- [ ] Model queries added
- [ ] Controller methods added
