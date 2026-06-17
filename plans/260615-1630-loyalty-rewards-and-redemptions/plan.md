---
title: Loyalty Rewards and Redemptions
description: Implement Loyalty rewards configuration, customer redemptions, and transaction history logs
status: in-progress
priority: high
effort: medium
branch: main
tags: backend, frontend, database, loyalty
created: 2026-06-15T16:30:00
---

# Overview Plan - Loyalty Rewards and Redemptions

Consolidating backend loyalty rules and introducing rewards, redemptions, and transactions.

## Phases

1. **Phase 1: DB Schema and Seeding**
   - Create tables: `loyalty_rewards`, `loyalty_reward_redemptions`, `customer_point_transactions`
   - Seed sample reward data
   - Link: [phase-01-db-schema.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1630-loyalty-rewards-and-redemptions/phase-01-db-schema.md)

2. **Phase 2: Models and Balance Checks**
   - Create `LoyaltyRewardModel.php`, `LoyaltyRewardRedemptionModel.php`, `CustomerPointTransactionModel.php`
   - Add transaction hooks in Shopee request approval
   - Implement dynamic point balance calculation
   - Link: [phase-02-models.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1630-loyalty-rewards-and-redemptions/phase-02-models.md)

3. **Phase 3: Controller and Routing API**
   - Modify `LoyaltyController.php` with rewards, redemptions, and transactions endpoints
   - Add frontend API clients
   - Link: [phase-03-api.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1630-loyalty-rewards-and-redemptions/phase-03-api.md)

4. **Phase 4: Admin and Client UI Tabs**
   - Implement "Quà đổi điểm", "Yêu cầu đổi quà", "Lịch sử điểm" tabs in `/admin/3f-club`
   - Implement Client page `/3f-club/rewards`
   - Link: [phase-04-ui.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1630-loyalty-rewards-and-redemptions/phase-04-ui.md)
