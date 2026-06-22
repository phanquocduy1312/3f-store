# Phase 1: OTP Provider Adapter

## Overview
- Priority: High
- Current Status: Planning
- Description: Design and write the base migrations, SMS adapter interface, concrete provider implementations (including Mock for dev), and the `OtpService` to manage OTP request validation.

## Related Code Files
- **[NEW]** [migrate_otp_and_loyalty.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/migrate_otp_and_loyalty.php): SQL migrations.
- **[NEW]** [OtpProviderInterface.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/OtpProviderInterface.php): Interface.
- **[NEW]** [OtpSendResult.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/OtpSendResult.php): Send status encapsulation.
- **[NEW]** [MockOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/MockOtpProvider.php): Mock OTP adapter logging SMS to local file.
- **[NEW]** [SpeedSmsOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/SpeedSmsOtpProvider.php): SpeedSMS provider.
- **[NEW]** [FptSmsOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/FptSmsOtpProvider.php): FPT SMS provider.
- **[NEW]** [ViettelSmsOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/ViettelSmsOtpProvider.php): Viettel SMS provider.
- **[NEW]** [StringeeOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/StringeeOtpProvider.php): Stringee provider.
- **[NEW]** [OtpService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/OtpService.php): Rate-limit checks, hashes, verification.
- **[NEW]** [OtpController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OtpController.php): API router controllers for verify and request.

## Implementation Steps
1. Create `migrate_otp_and_loyalty.php` with the table structures for `otp_requests` and `otp_send_logs`. Trigger this from `3f-api/public/run_migration.php`.
2. Define the `OtpProviderInterface` and create concrete provider classes mapping request payloads to mock files or external SMS gateways.
3. Write `OtpService` coordinating generation, DB updates (using secure hash password checks instead of plain text), resend window validation (60s check), daily send limits (5/day check), and failed attempts lock (5 checks).
4. Register the new endpoints in `3f-api/public/index.php` mapping POST to `OtpController`.

## Success Criteria
- Requesting OTP outputs the mock OTP value inside log files or runs clean gateway operations.
- Resending within 60 seconds returns: `“Vui lòng đợi 60 giây trước khi gửi lại mã.”`.
- Storing code in database must be a secure hash, not plain text.
