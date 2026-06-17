# Phase 4: Frontend Profile & Address Book

## Context Links
- [customerProfileApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerProfileApi.ts)
- [customerAddressesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAddressesApi.ts)

## Overview
- Priority: High
- Status: Pending
- Description: Build API clients and UI tabs for editing personal details (name, email, birthday, gender), changing phone numbers via verification OTP, and managing the saved addresses book.

## Related Code Files
- [NEW] [customerProfileApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerProfileApi.ts)
- [NEW] [customerAddressesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAddressesApi.ts)
- [NEW] [ProfileTab.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/ProfileTab.tsx)
- [NEW] [AddressBookTab.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/AddressBookTab.tsx)

## Implementation Steps
1. Create `customerProfileApi.ts` and `customerAddressesApi.ts` using `buildApiUrl` and authorized bearer tokens.
2. Build `ProfileTab.tsx` with name, email, birthday, and gender editing.
3. Build the modal for changing phone number: Step 1 (new phone), Step 2 (OTP code input), Step 3 (success update).
4. Build `AddressBookTab.tsx` listing all user addresses with add, edit, delete, and set-default options. Integrate open-api administrative divisions selection dropdowns.

## Todo List
- [ ] Implement Profile & Address API clients.
- [ ] Create `ProfileTab.tsx` component and phone change flow modal.
- [ ] Create `AddressBookTab.tsx` with division dropdown selectors.

## Success Criteria
- Editing profile details triggers valid PATCH request and refreshes AuthContext.
- Phone change verified successfully via OTP.
- User can add, edit, delete, and mark default addresses. Default address auto-updates default state of other addresses.
