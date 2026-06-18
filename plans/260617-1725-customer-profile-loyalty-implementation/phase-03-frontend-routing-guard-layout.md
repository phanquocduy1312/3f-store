# Phase 3: Frontend Route Guard & Layout

## Context Links
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [CustomerAuthContext.tsx](file:///c:/Users/Admin/Downloads/ccc/src/context/CustomerAuthContext.tsx)

## Overview
- Priority: High
- Status: Pending
- Description: Setup routing for customer account center routes under `/account/*`, create the CustomerRouteGuard, and implement the sidebar/tab navigation and layout for both desktop and mobile viewports.

## Related Code Files
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [NEW] [CustomerRouteGuard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/CustomerRouteGuard.tsx)
- [NEW] [AccountLayout.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/AccountLayout.tsx)
- [NEW] [AccountCenter.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/AccountCenter.tsx)

## Implementation Steps
1. Create `CustomerRouteGuard.tsx` to check `isLoggedIn` and `isLoading` from `useCustomerAuth()`, showing a loading skeleton or redirecting to `/login?redirect=currentPath`.
2. Create `AccountLayout.tsx` which houses the sidebar navigation (Desktop) and horizontal tab navigation (Mobile).
3. Implement navigation links: Overview, Profile, Address Book, Orders, 3F Club, Vouchers, Security, and Pets.
4. Integrate the new `/account` routes in `App.tsx` utilizing the Option A route structures wrapped inside `CustomerRouteGuard`.

## Todo List
- [ ] Create `CustomerRouteGuard.tsx`.
- [ ] Create `AccountLayout.tsx`.
- [ ] Create the parent page `AccountCenter.tsx` to manage sub-page navigation.
- [ ] Register account center routes in `App.tsx`.

## Success Criteria
- Navigating to `/account/*` redirects unauthenticated users to `/login?redirect=/account/...`.
- Account layout displays properly on desktop and mobile without visual breakage or scroll leakage.
