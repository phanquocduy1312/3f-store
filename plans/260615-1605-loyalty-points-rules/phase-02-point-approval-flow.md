# Phase 2: Update Point Approval Flow

## Overview
- Priority: High
- Current Status: Pending
- Brief Description: Refactor backend controllers/services to use the dynamic rule-based point calculator in place of hardcoded operations.

## Related Code Files
- [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)
- [PointService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/PointService.php)

## Implementation Steps
1. **PointService**:
   - Refactor `PointService::calculateShopeePoints` to delegate to `LoyaltyPointService::calculatePoints($amount, "shopee")`.
2. **ShopeePointRequestController**:
   - In `approve()`, calculate points to award dynamically using `LoyaltyPointService::calculatePoints($amount, "shopee")`.
   - Implement the condition: If `shopee_api_order_amount` is set and `verification_status === "valid"`, calculate based on `shopee_api_order_amount`; otherwise, fall back to request `order_amount`.
