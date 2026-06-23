# Phase 01: Database & Backend APIs

## Context Links
- [Database.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Database.php)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Add MySQL table for customer wishlists, implement backend model and controller, and register APIs.

## Requirements
- CREATE TABLE `customer_wishlists` safely with foreign keys to customers & products.
- `GET /api/customer/wishlist`: Retrieve products detail for authenticated customer.
- `POST /api/customer/wishlist/toggle`: Toggle single product wishlist status.
- `POST /api/customer/wishlist/sync`: Sync guest wishlist array to logged-in user database.

## Architecture
- Controller: `CustomerWishlistController.php`
- Model: `CustomerWishlist.php`
- Migration: `migrate_wishlist.php`

## Related Code Files
- [NEW] [migrate_wishlist.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/migrate_wishlist.php)
- [NEW] [CustomerWishlist.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/CustomerWishlist.php)
- [NEW] [CustomerWishlistController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerWishlistController.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Todo List
- [ ] Create `migrate_wishlist.php` and run migration
- [ ] Implement `CustomerWishlist.php` database queries
- [ ] Implement `CustomerWishlistController.php` endpoints (get, toggle, sync)
- [ ] Add routes in `index.php`
- [ ] Deploy backend to remote server using `deploy_ftp.py`

## Success Criteria
- APIs return correct JSON responses.
- Wishlist database state matches UI toggles.
