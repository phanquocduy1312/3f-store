# Phase 01: Email and Phone Verification Implementation

## Context Links
- [customerProfileApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerProfileApi.ts)
- [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx)
- [CustomerProfileController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerProfileController.php)

## Overview
- **Priority**: High
- **Current Status**: Completed
- **Description**: Add real email verification API requests/verification, and hook up phone verification with a simplified "Verify Now" option if the current phone number is unverified, all integrated directly with the backend database.

## Key Insights
- Backend OTP service uses `CustomerOtp` which maps the target identifier (phone or email) into the `phone` column of the `customer_otps` table.
- Since we don't have SMS gateway and SMTP config in this dev/test phase, the backend outputs the generated OTP code in the `devOtp` key of the response when `APP_DEBUG` is true. We should show this OTP in toast messages in dev environment so it can be copied and entered.
- To verify the current phone, we can use the existing `request-phone-change` and `verify-phone-change` endpoints by requesting the verification of the *current* phone number.

## Requirements
- Functional:
  - Users can click "Xác minh ngay" next to their email if it's unverified.
  - Users can click "Xác minh ngay" next to their phone number if it's unverified.
  - A form/input appears to trigger OTP and input the 6-digit OTP code.
  - When verified, the verification status pill changes to "Đã xác minh" immediately without page reload (after refetching profile).

## Architecture
- Client UI (`ProfilePage.tsx`) -> client API service (`customerProfileApi.ts`) -> Remote PHP API server -> Database (`customers.email_verified_at`, `customers.phone_verified_at`).

## Related Code Files
- [customerProfileApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerProfileApi.ts) (MODIFY)
- [ProfilePage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/account/ProfilePage.tsx) (MODIFY)

## Implementation Steps
1. Add `requestEmailVerificationApi` and `verifyEmailApi` functions to `customerProfileApi.ts`.
2. Update the Phone layout in `ProfilePage.tsx`:
   - If phone is unverified, show a "Xác minh ngay" button.
   - If user clicks "Xác minh ngay" or "Đổi số điện thoại", open the phone input/verification panel.
3. Implement the Email layout and verification panel in `ProfilePage.tsx`:
   - If email is unverified, show a "Xác minh ngay" button.
   - If clicked, open the email verification OTP panel.
   - Trigger the OTP request, display `devOtp` if returned, and verify OTP.

## Todo List
- [x] Deploy backend files via FTP (Completed)
- [x] Add email verification API endpoints in `customerProfileApi.ts`
- [x] Update `ProfilePage.tsx` phone verification UX
- [x] Implement email verification flow in `ProfilePage.tsx`
- [x] Verify functionality on dev server

## Success Criteria
- Email can be verified successfully with real OTP flow.
- Phone can be verified successfully with real OTP flow.
- Verification statuses are updated correctly in the UI.

## Risk Assessment
- None. Rate-limiting is in place (5 requests / 15 mins).

## Security Considerations
- Token validation is required for both requests.

## Next Steps
- None. Implementation is fully complete.
