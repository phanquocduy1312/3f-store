# Phase 3: Controller and Routing API

## Context Links
- [LoyaltyController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Add new loyalty endpoints to handle admin rewards CRUD, redemptions workflow, client rewards listing, customer redeem actions, and point transactions.

## Related Code Files
- [MODIFY] `LoyaltyController.php`
- [MODIFY] `Router.php`
- [MODIFY] `index.php`
- [NEW] `loyaltyRewardsApi.ts`
- [NEW] `loyaltyRedemptionsApi.ts`
- [NEW] `loyaltyTransactionsApi.ts`

## Implementation Steps
1. Add routes mapping in `Router.php` and `index.php`.
2. Implement reward management CRUD handlers inside `LoyaltyController.php`.
3. Implement `redeem` controller handling phone validation, active rewards, stock checking, limit checks, decrementing stock, deducting points, adding a transaction, and writing redemption records.
4. Implement `approve`, `reject`, and `fulfill` redemptions controllers with transaction logging.
5. Implement transactions query endpoints for admin and clients.
6. Create API files in frontend `src/services/`.

## Success Criteria
- API endpoints return expected formats with transaction safety.
- Double approvals or point deductions are prevented.
