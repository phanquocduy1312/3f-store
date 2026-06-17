# Phase 3: Frontend Config Page and Navigation

## Overview
- Priority: High
- Current Status: Pending
- Brief Description: Create the admin loyalty point rules settings page, hook up dynamic rule configuration forms, calculations preview, and update the side navigation links.

## Related Code Files
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [AdminSidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [LoyaltySettingsPage.tsx [NEW]](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/LoyaltySettingsPage.tsx)

## Implementation Steps
1. **Settings View Page**:
   - Create `src/pages/admin/LoyaltySettingsPage.tsx`.
   - Implement layouts to fetch active rules on mount.
   - Design forms for admin to edit rules (money per point, rounding mode, minimum order amount, maximum points cap, multiplier).
   - Implement rule updates via calling rule APIs.
   - Design calculator preview block where admin enters order amount and gets calculated loyalty points back via the preview API.
2. **Navigation and Routes**:
   - Add new route `/admin/loyalty-settings` to `App.tsx` mapped to `<LoyaltySettingsPage />`.
   - Update `AdminSidebar.tsx` to include `Cấu hình điểm` under "3F Club".
