# Phase 2: Admin Dashboard Integration

**Context Links**
- Scout Report: [scout-260612-1545-connect-frontend-with-php-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1545-connect-frontend-with-php-backend.md)
- Admin Listing: [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx)
- Detailed Modal: [ShopeeRequestDetailModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestDetailModal.tsx)

## Overview
- Priority: High
- Current Status: Pending
- Description: Link the administrative interface (requests list, detail views, and action modals) to backend MVC endpoints.

## Key Insights
- Database returned records use integer IDs, which must be cast to string for the existing UI mapping.
- Legacies like "Need more info" (Yêu cầu bổ sung) must be removed.
- Remote images require passing through `buildImageUrl(path)` to point to the correct storage directory.

## Requirements
- Fetch administrative listings with current status, pagination offset, and filters.
- Support viewing single details via the modal, which fetches latest data from backend.
- Support approve and reject triggers with modal notes.

## Architecture
- Direct REST call from React frontend to PHP admin endpoints using JSON payloads.

## Related Code Files
- [ShopeeRequestsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ShopeeRequestsPage.tsx)
- [ShopeeRequestDetailModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestDetailModal.tsx)

## Implementation Steps
1. Refactor list fetchers in `ShopeeRequestsPage.tsx` using `getShopeePointRequests`.
2. Map response variables to state.
3. Retrieve detailed request item upon opening the detail modal using `getShopeePointRequestDetail`.
4. Replace local state modifications with `approveShopeePointRequest` and `rejectShopeePointRequest` API triggers.

## Todo List
- [ ] Connect ShopeeRequestsPage list fetching to API
- [ ] Add loading, error, pagination states to ShopeeRequestsPage
- [ ] Connect ShopeeRequestDetailModal detail fetching to detail API
- [ ] Wire up approve/reject backend requests inside action handlers
- [ ] Test build and verify TypeScript compiler output

## Success Criteria
- Request list load retrieves real data from database.
- Details modal displays correctly, rendering relative images via `buildImageUrl`.
- Approval and rejection update backend state successfully.
