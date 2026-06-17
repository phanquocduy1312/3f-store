# Phase 5: Frontend Orders, Vouchers & Loyalty

## Context Links
- [customerOrdersApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerOrdersApi.ts)
- [customerClubApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerClubApi.ts)
- [customerVouchersApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerVouchersApi.ts)
- [customerSecurityApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerSecurityApi.ts)
- [customerPetsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerPetsApi.ts)

## Overview
- Priority: High
- Status: Pending
- Description: Build the remaining frontend pages and API client handlers for orders history, 3F loyalty point details & Shopee scanning requests, voucher listings, password security, session logs, and pet profile management.

## Related Code Files
- [NEW] Remaining API clients in `src/api/`
- [NEW] Components for Orders, Club, Vouchers, Security, Pets tabs under `src/components/Account/`

## Implementation Steps
1. Build `OrdersTab.tsx` listing orders, filters for statuses, cancellation button for `pending` orders, reorder logic, and detailed modal/page.
2. Build `ClubTab.tsx` with point status, tier progress, historical transaction lists, and a form to submit Shopee point claim requests.
3. Build `VouchersTab.tsx` showing tabbed folders for available, used, and expired coupons/vouchers, along with copy-code action.
4. Build `SecurityTab.tsx` enabling password updates, session listing, and session revocation.
5. Build `PetsTab.tsx` rendering pet cards, showing dog/cat icons, and providing add/edit pet profile options.

## Todo List
- [ ] Implement Vouchers, Orders, Club, Security, and Pets frontend API hooks.
- [ ] Create `OrdersTab.tsx` list and detail overlay.
- [ ] Create `ClubTab.tsx` points view and Shopee request forms.
- [ ] Create `VouchersTab.tsx`, `SecurityTab.tsx`, and `PetsTab.tsx`.

## Success Criteria
- Active/used/expired vouchers are properly filtered.
- Cancellation and reordering work correctly.
- Point tier increments on Gold (5k) and Platinum (15k) and matches the multiplier rules.
- Pets can be added/edited/deleted with correct species selection.
