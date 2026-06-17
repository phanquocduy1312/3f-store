# Phase 3: Update Routes & Sidebar

## Context Links
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Add the new `/admin/3f-club` route to the router while keeping the old routes functional, and update the sidebar navigation to only expose "3F Club".

## Key Insights
- Keep `/admin/shopee-requests` and `/admin/loyalty-settings` active in routes to prevent broken links, but remove them from the sidebar so the user only sees "3F Club".

## Requirements
- Edit `App.tsx` to include `ThreeFClubPage` lazy import and add `<Route path="/admin/3f-club" element={<ThreeFClubPage />} />`.
- Edit `admin-sidebar.tsx` to:
  - Remove "Yêu cầu Shopee" menu item.
  - Remove "Cấu hình điểm" menu item.
  - Set `path: "/admin/3f-club"` on the "3F Club" menu item so clicking it navigates to the combined page.

## Related Code Files
- [MODIFY] `App.tsx`
- [MODIFY] `admin-sidebar.tsx`

## Implementation Steps
1. Add new route `/admin/3f-club` in `App.tsx`.
2. Update `admin-sidebar.tsx` menuItems list.
3. Clean up any stale imports.
4. Run `npx tsc --noEmit` and `npm run build` to verify compilation.

## Todo List
- [ ] Add route to `App.tsx`
- [ ] Update sidebar menus in `admin-sidebar.tsx`
- [ ] Run typescript checks and production build

## Success Criteria
- Navigation to `/admin/3f-club` loads the unified page.
- Old routes still load if entered manually.
- The project compiles successfully without any typescript or build warnings.
