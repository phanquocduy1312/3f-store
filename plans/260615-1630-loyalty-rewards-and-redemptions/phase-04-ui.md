# Phase 4: Admin and Client UI Tabs

## Context Links
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Add real UI implementation to the empty state tabs (Rewards Catalog, Redemption Requests, Points History) in the unified admin panel and create the customer page.

## Related Code Files
- [MODIFY] `ThreeFClubPage.tsx`
- [NEW] `CustomerRewardsPage.tsx`
- [MODIFY] `App.tsx` (to mount customer route `/3f-club/rewards`)

## Implementation Steps
1. Create subsections or include full catalog, requests, and history table logic in `ThreeFClubPage.tsx`.
2. Add "Tạo quà" button and Modal with validations to manage rewards.
3. Design status mapping, search, and confirmation alerts for redemptions workflow (Duyệt/Từ chối/Đã giao).
4. Create customer-facing `/3f-club/rewards` page allowing them to input phone, view point balance, browse active rewards, redeem items, and review transaction history.

## Success Criteria
- Toggle and interactive elements on tabs load real-time API values.
- Client-side page renders list and handles client redeem requests cleanly.
