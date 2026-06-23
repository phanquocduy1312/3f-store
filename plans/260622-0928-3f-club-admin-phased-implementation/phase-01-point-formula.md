# Phase 1: Admin Point Formula Config

## Context Links
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx)
- [ClubSettingsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/loyalty/ClubSettingsSection.tsx)
- [LoyaltyController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php)
- [migrate_otp_and_loyalty.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/migrate_otp_and_loyalty.php)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Add the "Cấu hình 3F Club" tab to the admin panel with a single section "Cách tính điểm" showing money per point, point redemption value, shipping inclusion, point payment inclusion, expiration months, and reminder days. Ensure database seeding and robust backend validation are in place.

## Key Insights
- The backend configuration endpoints already exist (`/api/admin/loyalty/settings`) but lack proper validation.
- We need to introduce `include_shipping` and `include_points_payment` keys to `loyalty_settings` with default value `0` (false).

## Requirements
- Restore the `clubSettings` tab in `ThreeFClubPage.tsx`.
- Modify `ClubSettingsSection.tsx` to ONLY show the "Cách tính điểm" section (and remove/hide other sub-tabs like tiers, channels, otp which are slated for later phases).
- Display inputs for:
  - money_per_point (Số tiền để được 1 điểm, default: 200đ)
  - point_redeem_value (Giá trị quy đổi điểm, default: 20đ)
  - include_shipping (Tính phí vận chuyển, checkbox/select)
  - include_points_payment (Tính phần thanh toán bằng điểm, checkbox/select)
  - point_expiry_months (Hạn sử dụng điểm, default: 12 tháng)
  - expiry_reminder_days (Nhắc trước khi hết hạn, default: 7 ngày)
- Backend Validation in `LoyaltyController::saveSettings`:
  - `money_per_point` > 0
  - `point_redeem_value` > 0
  - `point_expiry_months` > 0
  - `expiry_reminder_days` >= 0
- Seeding: Update `migrate_otp_and_loyalty.php` to include `include_shipping` and `include_points_payment`.

## Related Code Files
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx)
- [ClubSettingsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/loyalty/ClubSettingsSection.tsx)
- [LoyaltyController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php)
- [migrate_otp_and_loyalty.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/migrate_otp_and_loyalty.php)

## Implementation Steps
1. **Database Seeding**:
   - Update `migrate_otp_and_loyalty.php` with `include_shipping` and `include_points_payment`.
   - Run the migration script: `php 3f-api/database/migrate_otp_and_loyalty.php`.
2. **Backend Validation**:
   - In `LoyaltyController::saveSettings`, check for `money_per_point`, `point_redeem_value`, `point_expiry_months`, and `expiry_reminder_days` values if they are present in the request.
   - Return a `400` response with error messages if validation rules are violated.
3. **Frontend UI Integration**:
   - Restore the "Cấu hình 3F Club" (`clubSettings`) tab in `ThreeFClubPage.tsx`.
   - Modify `ClubSettingsSection.tsx` to:
     - Remove the sub-tabs navigation headers.
     - Only render the "Cách tính điểm" settings fields.
     - Add fields for "Có tính phí ship không" and "Có tính phần thanh toán bằng điểm không" using select dropdowns (Có / Không).
4. **Verification**:
   - Verify React compiler and build.
   - Run manual verification tests.

## Todo List
- [ ] Update `migrate_otp_and_loyalty.php` and run migration
- [ ] Implement backend settings validation in `LoyaltyController.php`
- [ ] Restore `clubSettings` tab in `ThreeFClubPage.tsx`
- [ ] Simplify `ClubSettingsSection.tsx` UI to show only the point formula inputs
- [ ] Add shipping and point payment inclusion fields to `ClubSettingsSection.tsx`
- [ ] Run verification tests (`npx tsc --noEmit`, `npm run build`)
