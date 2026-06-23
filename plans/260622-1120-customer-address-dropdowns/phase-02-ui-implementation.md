# Phase 2: UI Dropdown Component Implementation

## Context Links
- [AddressBookPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AddressBookPage.tsx)

## Overview
- Priority: High
- Current Status: Pending
- Description: Re-engineer the location fields (Province, District, Ward) into cascading selects that fetch data from `https://provinces.open-api.vn/api/`.

## Key Insights
- Open Provinces API URL:
  - Provinces list: `https://provinces.open-api.vn/api/p/`
  - Province districts: `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
  - District wards: `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
- Selecting a new Province must clear and reset District and Ward selects.
- Selecting a new District must clear and reset Ward selects.
- When loading an existing address for edit, the code must fetch the districts/wards lists matching the selected province/district codes to pre-select correct values.

## Requirements
- Replace `Province/City` text input with a Province `<select>`.
- Add a new `Quận/Huyện` (District) `<select>`.
- Replace `Phường/Xã` (Ward) text input with a Ward `<select>`.
- Validate that all three values are selected.
- Format address text in list items to include `district`: e.g. `{addressLine}, {wardName}, {district}, {provinceName}`.

## Related Code Files
- [AddressBookPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/AddressBookPage.tsx) [MODIFY]

## Implementation Steps
1. Fetch provinces list on component mount or modal open.
2. Maintain local state arrays for `provinces`, `districts`, and `wards`.
3. Update `openCreateModal` to clear dropdown states.
4. Update `openEditModal` to asynchronously fetch relevant districts/wards lists based on the existing `provinceCode` and `districtCode` to populate dropdown lists before setting form values.
5. In form UI, render `<select>` elements for Province, District, and Ward.
6. Validate input correctness (verify selection, not empty placeholder).
7. Format rendering of addresses in list views.

## Todo List
- [ ] Add provinces/districts/wards state lists.
- [ ] Implement cascaded select change handler logic.
- [ ] Implement pre-loading dropdown options when editing an address.
- [ ] Replace input text fields with `<select>` elements in JSX.
- [ ] Add Quận/Huyện select element.
- [ ] Update address text representation.
- [ ] Update form validation.
