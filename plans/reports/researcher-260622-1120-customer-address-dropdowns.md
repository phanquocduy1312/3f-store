# Technical Research Report: Vietnam administrative division API

## Context
Integrating the Vietnam provinces API (`https://provinces.open-api.vn/api/`) into the customer address book for cascading dropdown selection.

## API Endpoints Verified
1. **Get Provinces**:
   `GET https://provinces.open-api.vn/api/p/`
   Returns array: `[{ code: number, name: string }]`

2. **Get Districts for a Province**:
   `GET https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
   Returns object with `districts`: `[{ code: number, name: string }]`

3. **Get Wards for a District**:
   `GET https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
   Returns object with `wards`: `[{ code: number, name: string }]`

## Database & Backend Compatibility
- Table `customer_addresses` has `province`, `province_code`, `district`, `district_code`, `ward`, `ward_code`.
- Backend accepts `provinceCode`, `provinceName`, `districtCode`, `district`, `wardCode`, `wardName` in `CustomerAddressController.php` requests.
- Dropdown selections will map:
  - Province name to `provinceName`, code to `provinceCode`.
  - District name to `district`, code to `districtCode`.
  - Ward name to `wardName`, code to `wardCode`.

## Visual Alignment
- Maintain premium custom theme: dark blue headers (`#0B1F3A`), accents (`#0057E7`), and border style (`border-[#DCEBFF]`).
- The Province and Ward fields are currently in a 2-column grid. We will change it to a 3-column layout or keep it stacked neatly for mobile responsiveness.
