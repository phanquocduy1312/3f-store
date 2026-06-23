# Phase 1: API and Types Integration

## Context Links
- [customerAddressesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAddressesApi.ts)
- [CustomerAddressController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerAddressController.php)

## Overview
- Priority: High
- Current Status: In Progress
- Description: Extend the TS interfaces for addresses to support district properties (`district` and `districtCode`).

## Key Insights
- The remote database already has a `district_code` column added, and `district` has always existed but was blank.
- The PHP controller `CustomerAddressController.php` already supports receiving/sending `district` and `districtCode`.

## Requirements
- Update `AddressData` interface to include `district?: string` and `districtCode?: string`.

## Related Code Files
- [customerAddressesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAddressesApi.ts) [MODIFY]

## Implementation Steps
1. Add `district?: string;` and `districtCode?: string;` to `AddressData` interface in [customerAddressesApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAddressesApi.ts).

## Todo List
- [ ] Add `district` and `districtCode` to `AddressData` TS interface.

## Success Criteria
- TypeScript compiles successfully without any type errors in `customerAddressesApi.ts`.
