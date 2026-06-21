# Phase 04: Order Admin UI Refactoring

## Context Links
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- Priority: Medium
- Status: Pending
- Description: Rebuild the admin order details drawer to show separate status categories, show next transition buttons dynamically, and allow entering note/reasons.

## Key Insights
- Displaying next states dynamically from API-supplied allowed transitions avoids hardcoding client rules.

## Requirements
- Split status into: Order, Payment, Shipping, and Loyalty point sections.
- Show badges with group-specific colors.
- Display transition buttons for next allowed statuses.
- Support staff assignment and notes fields.

## Architecture
- React layout updates in order drawer.

## Related Code Files
- `src/pages/admin/AdminOrdersPage.tsx` (Modify)
- `src/api/productsApi.ts` (Modify to add APIs)

## Implementation Steps
1. Add new API calls to `productsApi.ts`:
   - `getAdminOrderTransitions(orderId)`
   - `updateAdminOrderStatusPartially(orderId, groupKey, statusKey, note)`
2. In `AdminOrdersPage.tsx` drawer, replace the single status button footer with 4 distinct sections.
3. Fetch allowed transitions when opening an order detail.
4. Render current status with its label/color from configuration.
5. Render dynamic buttons for next allowed transitions. If clicked, prompt for a reason if configured.
6. Display timeline status logs segmented by `group_key` with icons.

## Todo List
- [ ] Implement partial update APIs in `productsApi.ts`
- [ ] Refactor order drawer layout in `AdminOrdersPage.tsx`
- [ ] Fetch and map dynamic transition lists
- [ ] Implement transition action buttons and note modal

## Success Criteria
- Admin can modify order, payment, shipping, and loyalty statuses separately.
- Only allowed transitions are shown.

## Risk Assessment
- Complex layout on mobile screens. Mitigate with responsive grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

## Security Considerations
- Require admin auth tokens on all requests.

## Next Steps
- Implement settings configuration views in Phase 5.
