# Phase 3: Verification & Deployment

## Overview
- Priority: High
- Current Status: Pending
- Description: Validate frontend compilation and build, then deploy backend controller and frontend changes.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify zero TypeScript errors.
- Run `npm run build` to verify the frontend production build passes.

### Manual Verification
- Test creating a new address and choosing Province, District, and Ward from dropdowns.
- Test editing an existing address to check if dropdowns load existing values.
- Verify saving/updating correctly stores `district` and `district_code` in the database.
- Deploy the backend `CustomerAddressController.php` using FTP script.

## Related Code Files
- None.

## Todo List
- [ ] Run `npx tsc --noEmit` and fix errors.
- [ ] Run `npm run build` to verify compilation.
- [ ] Deploy modified controller and built files to staging.
