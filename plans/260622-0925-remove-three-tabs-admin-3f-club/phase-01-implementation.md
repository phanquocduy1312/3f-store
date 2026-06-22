# Phase 1: Implementation - Remove Three Tabs

## Context Links
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Delete the tabs "Hạng thành viên", "Quà & Voucher", and "Cấu hình 3F Club" and their panels from [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx).

## Requirements
- Only "Đơn Shopee" and "Lịch sử" should remain visible in the navigation and tabs.
- Clean up unused imports of sub-sections (`MembershipTiersSection`, `LoyaltyRewardsSection`, `LoyaltyRedemptionsSection`, `ClubSettingsSection`).
- Clean up unused icons and types in `ThreeFClubPage.tsx`.

## Related Code Files
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx)

## Implementation Steps
1. Modify `MainTab` type definition to only contain `"shopee"` and `"history"`.
2. Clean up `mainTabs` definition to only contain those two tabs.
3. Remove `rewardsSubTab` state and its associated `useEffect`.
4. Delete the JSX rendering blocks for the three removed tabs in the main content container.
5. Remove unused imports.

## Todo List
- [ ] Simplify `MainTab` and `mainTabs` in `ThreeFClubPage.tsx`
- [ ] Remove `rewardsSubTab` state and effects
- [ ] Remove tab panel components and their imports
