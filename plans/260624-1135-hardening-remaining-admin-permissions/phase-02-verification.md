# Phase 2: Verification Plan

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260624-1135-hardening-remaining-admin-permissions.md)
- [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1135-hardening-remaining-admin-permissions/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Verify the build succeeds and test the permission restrictions manually or with end-to-end user checks.

## Implementation Steps
1. Run `npm run build` locally to ensure no TypeScript compilation or packaging errors.
2. Deploy changes via `python scripts/deploy_ftp.py`.
3. Inform the user and guide them on how to test with a low-privilege user account.

## Todo List
- [ ] Run local build check
- [ ] Deploy code to staging
- [ ] Confirm everything compiles and tests successfully on staging environment

## Success Criteria
- Build succeeds.
- Unauthorized administrators see read-only pages for Products, Orders, Customers, Reviews, Banners, Vouchers, News, Categories, and 3F Club.
