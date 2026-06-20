# Phase 02: Admin Panel Management UI

## Context Links
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- **Priority**: Medium-High
- **Current Status**: Planning
- **Description**: Add Banner Management pages to the admin dashboard, including listing, campaigns management, sorting order, and banner upload forms.

## Key Insights
- Admin panel uses React + React Router.
- Need to add new API helper methods in `src/api/productsApi.ts` for banners CRUD actions.
- Form must support file inputs (images) along with standard text overlays and dropdown lists for banner placement positions.

## Requirements
- Add banner management endpoint calls to `productsApi.ts`.
- Insert "Quản lý Banner" sidebar option in `components/admin/admin-sidebar.tsx`.
- Register the route `/admin/banners` in `src/App.tsx`.
- Create `src/pages/admin/AdminBannersPage.tsx` showing a beautiful listing grid.
- Implement banner creation/edit dialog/modal with:
  - Inputs: Title, Placement (home_hero_slider, home_promo_top_right, home_promo_bottom_right), Link URL, Title Text, Subtitle Text, CTA Button text, Display Period (Start/End dates), Sort Order.
  - Image upload selector with a live image preview.
  - Active toggle switch.

## Architecture
- Simple Admin Layout layout with sidebar navigations.
- Modal inputs validate and convert images to FormData for API posts.

## Related Code Files
- **[NEW]** `src/pages/admin/AdminBannersPage.tsx`
- **[MODIFY]** `src/api/productsApi.ts`
- **[MODIFY]** `components/admin/admin-sidebar.tsx`
- **[MODIFY]** `src/App.tsx`

## Implementation Steps
1. Add banner management API operations (`getBannersAdmin`, `createBannerAdmin`, `updateBannerAdmin`, `deleteBannerAdmin`) in `src/api/productsApi.ts`.
2. Modify `components/admin/admin-sidebar.tsx` to include the menu item "Quản lý Banner".
3. Map the lazy loaded route in `src/App.tsx`.
4. Create the `AdminBannersPage` component showing lists.
5. Code the Edit/Create dialog layout using Tailwind glassmorphism styling parameters.
6. Test saving new banners and uploading files on local browser admin views.

## Todo List
- [ ] Add API helpers in `productsApi.ts`
- [ ] Add menu item in `admin-sidebar.tsx`
- [ ] Add route `/admin/banners` in `App.tsx`
- [ ] Create `AdminBannersPage.tsx` file and design the list
- [ ] Build the creation/edit modal and test form updates

## Success Criteria
- Sidebar redirects correctly.
- Admin Banners list renders all uploaded banners, showing clicks, status, and previews.
- Create/Edit/Delete requests work without JavaScript crashes.

## Risk Assessment
- *Risk*: Multipart form-data payload errors.
- *Mitigation*: Ensure headers are correctly set to `multipart/form-data` when upload is active.

## Security Considerations
- Direct validation checks on forms (valid URLs, non-empty fields).
- Ensure only authenticated admin sessions can access this page.

## Next Steps
- Integrate the banners dynamically on the client-side homepage (Phase 03).
