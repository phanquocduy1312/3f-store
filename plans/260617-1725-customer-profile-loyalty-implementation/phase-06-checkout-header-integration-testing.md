# Phase 6: Checkout, Header Integration & Testing

## Context Links
- [CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)
- [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)

## Overview
- Priority: High
- Status: Pending
- Description: Link the saved address book and customer details to CartCheckout for auto-filling delivery fields, update the global Header account dropdown to direct customers to the profile sections, and verify that the TypeScript compilation and Vite build complete successfully.

## Related Code Files
- [MODIFY] [CartCheckout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CartCheckout.tsx)
- [MODIFY] [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)

## Implementation Steps
1. In `CartCheckout.tsx`, check if customer is logged in. Prefill name, email, phone, and fetch their address book. Auto-fill fields if a default address is defined, and provide a select dropdown/button for choosing other saved addresses.
2. Ensure that order creation sends the `customer_token` via the Bearer header so the backend correctly assigns `customer_id`.
3. Modify the Header account icon/dropdown to link to account tabs (Overview, Orders, Club, Vouchers, Logout). Show warning badge if phone number is not linked.
4. Run `npx tsc --noEmit` and `npm run build` to verify the build passes.

## Todo List
- [ ] Connect address book autofill in `CartCheckout.tsx`.
- [ ] Update Header account dropdown in `Header.tsx`.
- [ ] Run typescript checks.
- [ ] Run production build to ensure output is clean.

## Success Criteria
- Checkout automatically loads the customer's default address.
- Placing an order while logged in links it to `customer_id` on the backend.
- Header options link to correct tabs.
- `npx tsc --noEmit` passes with 0 errors.
- `npm run build` succeeds without bundle errors.
