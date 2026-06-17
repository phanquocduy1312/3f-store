# Phase 2: Models and Balance Checks

## Context Links
- [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Implement Model classes for rewards, redemptions, and point transactions. Integrate points earning transactions upon Shopee request approval.

## Requirements
- `LoyaltyRewardModel.php`
- `LoyaltyRewardRedemptionModel.php`
- `CustomerPointTransactionModel.php`
- Update `SumApprovedPointsByPhone` fallback in `ShopeePointRequest` to query transactions instead.

## Architecture
Dynamic balance:
`balance = SUM(points) from customer_point_transactions`
Earn / Refund are positive. Spend is negative.

## Implementation Steps
1. Create `CustomerPointTransactionModel.php` with `addTransaction`, `listTransactions`, `getCustomerTransactions`.
2. Update `ShopeePointRequestController.php` on `approve` to call `addTransaction` for `earn_shopee_order`.
3. Create `LoyaltyRewardModel.php` with `listRewards`, `getRewardById`, `createReward`, `updateReward`, `deactivateReward`, `decrementStock`, `incrementStock`.
4. Create `LoyaltyRewardRedemptionModel.php` with `listRedemptions`, `getRedemptionById`, `createRedemption`, `updateStatus`, `countCustomerRedemptions`.

## Success Criteria
- Approving Shopee requests properly saves point transaction records.
- Correct calculations of customer balances.
