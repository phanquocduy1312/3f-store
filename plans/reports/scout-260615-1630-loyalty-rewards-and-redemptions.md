# Scout Report: Loyalty Rewards and Redemptions

Scouting backend and frontend structures for integrating loyalty rewards configuration, redemption requests, and transaction logs.

## File Discovery
The following paths will be created or modified:
### Backend (3f-api)
- `app/Models/LoyaltyRewardModel.php` [NEW]
- `app/Models/LoyaltyRewardRedemptionModel.php` [NEW]
- `app/Models/CustomerPointTransactionModel.php` [NEW]
- `app/Controllers/LoyaltyController.php` [MODIFY]
- `app/Controllers/CustomerPointController.php` [MODIFY]
- `app/Controllers/ShopeePointRequestController.php` [MODIFY]
- `app/Core/Router.php` [MODIFY]
- `public/index.php` [MODIFY]

### Frontend
- `src/pages/admin/ThreeFClubPage.tsx` [MODIFY]
- `src/services/loyaltyRewardsApi.ts` [NEW]
- `src/services/loyaltyRedemptionsApi.ts` [NEW]
- `src/services/loyaltyTransactionsApi.ts` [NEW]
- `src/pages/client/CustomerRewardsPage.tsx` [NEW]

## Current DB State & Dynamic Balance
- Currently, points are queried via summing `approved_points` in `shopee_point_requests` (`CustomerPointController.php`).
- Since customers can spend points, we will introduce `customer_point_transactions` to track point balance.
- Point balance will be dynamically computed: `Balance = SUM(points)`. Earn and refund transactions will record positive values; spend transactions will record negative values.
