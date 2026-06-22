# Phase 2: Frontend & Admin Updates

## Context Links
- [ShopeeRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/ShopeeRequestModal.tsx)
- [shopeePointApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/services/shopeePointApi.ts)
- [ShopeeRequestsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestsSection.tsx)

## Overview
- **Priority**: High
- **Current Status**: Pending
- **Description**: Update the frontend ShopeeRequestModal to enforce OTP verification for all users (both guests and logged-in), invoke the general send/verify OTP endpoints with purpose `shopee_point_request`, pass the verification token to the backend, and update the admin Shopee Requests view/drawer to display the OTP verification details.

## Key Insights
- Logged-in users should also undergo OTP verification for `shopee_point_request` purposes before submitting requests.
- The phone number field can default to the logged-in customer's phone but should be editable or clear.
- Verification details (OTP verified status, time, provider) should be displayed in the admin detail view.

## Requirements
- Render OTP modal/inputs for all users on Shopee request submission.
- Implement 60s countdown and Resend button in the OTP input step.
- Update `/api/admin/shopee/requests/detail` to return `otp_verified`, `otp_verified_at`, and `otp_provider`.
- Render these OTP fields in the admin Shopee request detail.

## Related Code Files
- **[MODIFY]** [ShopeeRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/Account/ShopeeRequestModal.tsx)
- **[MODIFY]** [ShopeeRequestsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeRequestsSection.tsx)

## Implementation Steps
1. Refactor `ShopeeRequestModal.tsx` step state:
   - Step 1: Input details (Phone, Order Code, Order Amount, Note).
   - Click "Gửi yêu cầu" -> trigger OTP Send (`/api/customer/otp/send`, purpose `shopee_point_request`) -> transition to Step 2.
   - Step 2: Input OTP.
   - Enter OTP -> Verify (`/api/customer/otp/verify`, purpose `shopee_point_request`) -> get token -> invoke create request with `verificationToken` -> transition to success/onClose.
2. In `ShopeeRequestsSection.tsx` (or the drawer detail view), render:
   - "Đã xác thực OTP: Có / Không"
   - "Thời gian xác thực OTP: [Date/Time]"
   - "Provider: Stringee / Mock / ..."

## Todo List
- [ ] Refactor `ShopeeRequestModal.tsx` steps and OTP triggers
- [ ] Implement countdown timer and resend button in the OTP step
- [ ] Modify `ShopeeRequestsSection.tsx` to display OTP verification status and metadata in details drawer

## Success Criteria
- Successful OTP modal flow for all users.
- Correct OTP details shown in the admin drawer.

## Risk Assessment
- Ensure layout fits within standard modal size, preserving premium look & feel.
