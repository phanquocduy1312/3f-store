# Phase 1: Backend Implementation

## Context Links
- [Researcher Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260622-1045-stringee-otp-shopee-requests.md)
- [StringeeOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/StringeeOtpProvider.php)
- [OtpService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OtpService.php)
- [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)

## Overview
- **Priority**: High
- **Current Status**: Pending
- **Description**: Configure environment variables, implement the Stringee OTP provider using custom JWT HS256 tokens and cURL POST request, restrict mock OTP in production, isolate OTP purpose to `shopee_point_request`, check and consume OTP verification token when creating a Shopee request.

## Key Insights
- Pure PHP environment; cURL POST requests and manual JWT encoding (Base64Url + HMAC SHA256) are needed.
- `shopee_point_request` must be isolated; token must be single-use and consumed upon request creation.

## Requirements
- Support `.env` variables `STRINGEE_SID`, `STRINGEE_SECRET`, `STRINGEE_FROM`, and optional `STRINGEE_SMS_ENDPOINT`.
- Normalize phone numbers to `84xxxxxxxxx` for Stringee.
- Safe logging to `otp_send_logs` (hide plaintext OTP).
- Block mock provider in production.

## Architecture
```
[Client] --(verify OTP)--> [OtpService] -> (verified_at + token generated)
[Client] --(submit request + token)--> [ShopeePointRequestController]
                                                |
                                        [OtpService] (validate token)
                                                |
                                        [OtpService] (consume token)
                                                |
                                        [ShopeePointRequest] (insert request)
```

## Related Code Files
- **[MODIFY]** [3f-api/.env](file:///c:/Users/Admin/Downloads/ccc/3f-api/.env)
- **[MODIFY]** [StringeeOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/StringeeOtpProvider.php)
- **[MODIFY]** [OtpService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OtpService.php)
- **[MODIFY]** [ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php)
- **[MODIFY]** [ShopeePointRequest.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/ShopeePointRequest.php)

## Implementation Steps
1. Add environment variables to `3f-api/.env`.
2. Update `checkAndMigrate` in `ShopeePointRequest.php` to add `otp_verified`, `otp_verified_at`, and `otp_provider` columns to `shopee_point_requests`.
3. Implement `consumeVerificationToken` in `OtpService.php`.
4. Fully implement `sendOtp` in `StringeeOtpProvider.php` with cURL and manual JWT generation.
5. In `ShopeePointRequestController->create()`, extract the OTP token, check/validate it, consume it, and record the OTP details to the request record.

## Todo List
- [ ] Add env variables in `3f-api/.env`
- [ ] Implement database migrations for OTP columns in `ShopeePointRequest.php`
- [ ] Implement `consumeVerificationToken` in `OtpService.php`
- [ ] Complete `StringeeOtpProvider.php` implementation
- [ ] Enforce OTP token validation and consumption in `ShopeePointRequestController.php`

## Success Criteria
- Stringee API successfully generates HS256 JWT tokens.
- OTP verification token is consumed immediately after single use.
- Unit/mock tests pass.

## Risk Assessment
- Wrong JWT generation or payload claim mismatches from Stringee console. Standardize header `cty` and payload `rest_api` claim.

## Security Considerations
- Plaintext OTP is hashed in DB and never logged.
- Mock provider is blocked on production.
