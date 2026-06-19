# Phase 02: Frontend components and data fetching

## Overview
- Priority: High
- Current status: Pending
- Brief description: Implement frontend UI components for the tabs.

## Requirements
- Add "Voucher" tab to the UI.
- Fetch data per tab asynchronously.
- Build sub-components: `Overview`, `Orders`, `Points`, `Addresses`, `Vouchers`, `Pets`, `Sessions`.
- Display specific loading skeletons and empty states for each.
- Ensure UI doesn't leak sensitive data.

## Related Code Files
- `src/api/adminCustomersApi.ts`
- `src/pages/admin/AdminCustomerDetailPage.tsx`

## Implementation Steps
1. Add new API methods to `adminCustomersApi.ts`.
2. Update `AdminCustomerDetailPage.tsx` to conditionally render tabs.
3. Build the actual components.

## Todo List
- [ ] Add API methods
- [ ] Implement conditional rendering
- [ ] Build sub-components
- [ ] Verify UX and error handling
