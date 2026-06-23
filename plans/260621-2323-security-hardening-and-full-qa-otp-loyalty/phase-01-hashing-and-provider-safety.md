# Phase 01: Hashing & Provider Safety

## Context Links
- [OtpService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OtpService.php)
- [MockOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/MockOtpProvider.php)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Secure OTP hashing logic, enforce production credentials, and block mock provider in production.

## Key Insights
- Standard PHP password hashing (bcrypt) is already used, which meets guidelines. We will reinforce the production checks.
- If `APP_ENV=production` and `OTP_PROVIDER=mock`, the system must block request execution to prevent unauthorized test bypasses.

## Requirements
- Throw a safe error if `OTP_SECRET` is missing in production.
- Block sending if `OTP_PROVIDER=mock` and `APP_ENV=production`.
- Mock provider logs OTP only in non-production.

## Related Code Files
- `3f-api/app/Services/OtpService.php`

## Implementation Steps
1. Add validation in `OtpService::__construct` to throw an exception if `APP_ENV=production` and `OTP_SECRET` is empty.
2. In `OtpService::requestOtp`, check if `APP_ENV=production` and `OTP_PROVIDER=mock`, and return a 400/429 style failure with message `"Chưa cấu hình nhà cung cấp OTP."`
3. Add environmental variables to `.env` files.

## Todo List
- [ ] Enforce `OTP_SECRET` check in `OtpService` constructor.
- [ ] Implement `mock` provider block in production environment.
- [ ] Add config templates/examples to `.env` file.

## Success Criteria
- Local execution with mock provider works in development.
- Production environment blocks mock provider with a clear error message.
