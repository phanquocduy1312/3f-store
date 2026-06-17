# Phase 2: Create Combined Page

## Context Links
- [ShopeeRequestsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/shopee/ShopeeRequestsSection.tsx)
- [LoyaltySettingsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/loyalty/LoyaltySettingsSection.tsx)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create the combined page `ThreeFClubPage.tsx` at `/admin/3f-club` that houses the tabbed interface and the shared summary cards at the top.

## Key Insights
- Tabs: Yêu cầu Shopee, Cấu hình điểm, Quà đổi điểm, Yêu cầu đổi quà, Lịch sử điểm.
- The summary cards will pull stats from the loaded requests state and the active loyalty rule.

## Requirements
- Render the unified header: "3F Club" with subtitle: "Quản lý tích điểm Shopee, cấu hình điểm và đổi quà khách hàng".
- Display 5 summary cards:
  1. Total Shopee Requests
  2. Pending
  3. Valid API
  4. Approved
  5. Active conversion rate
- Tabs design should be easy to toggle and responsive.
- Render empty states for unimplemented tabs:
  - "Quà đổi điểm": empty state: “Tính năng quà đổi điểm sẽ được cấu hình ở giai đoạn tiếp theo.” with a disabled button / label "Sắp ra mắt".
  - "Yêu cầu đổi quà": empty state: “Chưa có yêu cầu đổi quà.” with a badge/label "Sắp ra mắt".
  - "Lịch sử điểm": empty state: “Lịch sử điểm sẽ được bổ sung sau.”

## Related Code Files
- [NEW] `ThreeFClubPage.tsx` (in `src/pages/admin/ThreeFClubPage.tsx`)

## Implementation Steps
1. Create `ThreeFClubPage.tsx` with a standard layout including `AdminSidebar`, `AdminHeader`, and Page content.
2. Maintain local state for tab selection, `requests` array, and `activeRule` object.
3. Pass callbacks `onRequestsLoaded={setRequests}` and `onActiveRuleLoaded={setActiveRule}` to sections.
4. Calculate totals for summary cards using the requests and activeRule states.
5. Implement conditional tab rendering.
6. Verify design responsiveness.

## Todo List
- [ ] Implement `ThreeFClubPage.tsx` with tabs
- [ ] Connect sections and callbacks
- [ ] Implement empty states for upcoming features
- [ ] Implement summary cards with loaded data

## Success Criteria
- Toggle tabs correctly renders the active section.
- Summary cards update in real time when requests are loaded or approved.
- All empty states show correctly.

## Risk Assessment
- Ensure requests state updates in the parent whenever the child component updates (e.g. after approval/rejection).

## Next Steps
- Move to Phase 3: Update Routes & Sidebar.
