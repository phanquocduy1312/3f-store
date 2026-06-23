# Phase 2: Loyalty Rules Engine

## Overview
- Priority: High
- Current Status: Planning
- Description: Design and write the point formulas, membership tier levels (Member, Silver, Gold, Diamond), ledger structures for double-crediting protection, and administrative settings APIs.

## Related Code Files
- **[NEW]** [LoyaltySettings.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/LoyaltySettings.php): CRM Loyalty settings key-value manager.
- **[NEW]** [LoyaltyPointTransaction.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/LoyaltyPointTransaction.php): Ledger database model with unique idempotency keys.
- **[MODIFY]** [LoyaltyController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php): Implement points check, reward/voucher redeem limits, and verification of rolling order history.

## Implementation Steps
1. Add `loyalty_point_transactions` and `loyalty_settings` to the migration script. Seed the settings table with default rules (200 VND = 1 point, 1 point = 20 VND voucher, etc.).
2. Write `LoyaltySettings` model that fetches and caches variables from DB, ensuring no values are hardcoded in the codebase.
3. Write `LoyaltyPointTransaction` model to record points ledger operations (Status: `holding`, `available`, `used`, `expired`, `cancelled`). Establish idempotence checks via unique order reference.
4. Implement points calculation in `LoyaltyController::calculateEligiblePoints()`:
   - Eligible spend = product subtotal - points discount - point-disabled items.
   - Points = eligibleAmount / money_per_point * channel_multiplier * campaign_multiplier.
5. Implement rolling 12-month tier logic:
   - Verify completed orders and spend thresholds.
   - Cap voucher redemption based on the current active tier limit.

## Success Criteria
- Completed orders trigger dynamic point creation with unique references.
- Reversing/refunding orders triggers ledger rows with `reverse` or `cancel` type.
- Tiers are computed correctly on the rolling 12-month history.
