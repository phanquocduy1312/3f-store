# Debugger Report: Fix Wishlist API 503/CORS Error

## Root Cause Analysis
- **Symptom**: Calling `GET /api/customer/wishlist` returned a `503 Service Unavailable` error and failed CORS preflight checks.
- **Investigation**: 
  - Checked `CustomerWishlistController.php` and `CustomerWishlist.php` models.
  - The controller queries the `customer_wishlists` table which did not exist on the live database.
  - When a logged-in member visited the page, the database query failed and threw a PDOException.
  - Since the exception was caught by Plesk or bubbled up without proper CORS headers, the browser blocked the response under CORS policy and the server returned a 503 Service Unavailable.

## Resolution
- **Action**: Executed the migration endpoint `/api/run-wishlist-migration` on the production server `https://trial1506895.mbws.vn`.
- **Validation**: 
  - Ran `node scratch/test-wishlist-api.js` which registers a test user, toggles items in the wishlist, and syncs guest wishlists.
  - All 9 integration test steps completed successfully with 200 OK responses.
