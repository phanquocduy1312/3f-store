# Cook Report: Email Verification Registration Flow

## Overview
- **Task**: Triển khai luồng đăng ký tài khoản khách hàng bằng email verification link.
- **Date**: 2026-06-23 15:40
- **Status**: Completed
- **Branch**: dev

## Progress & Key Actions
1. **Database Schema**: Created `pending_registrations` SQL schema and auto-migrator in `CustomerAuthController.php` to handle self-healing migrations.
2. **SMTP Transmission**: 
   - Unified pure PHP SMTP client in `SmtpClient.php` with TLS support and UTF-8 header encoding.
   - Refactored `EmailService.php` to delete duplicated socket logic and call `SmtpClient` directly, lowering line count below 200 lines.
3. **Controller Updates**: Added validation, 60s cooldown check, daily limit (5) check, password hashing, secure raw token generation (32-byte), and SHA-256 token hashing inside `CustomerAuthController.php`.
4. **Registration Verification**: Created transactional verify endpoint in `CustomerAuthController.php` which converts temporary pending profiles to active customers upon link click, issues session tokens, and cleans up records.
5. **Frontend Pages & Routing**:
   - Added `/verify-registration` route in `App.tsx`.
   - Created `VerifyRegistrationPage.tsx` page to handle callback validation, loading, success triggers, and manual retry options.
   - Updated `Register.tsx` to handle post-registration layout, Gmail quick links, and developer verification bypass url.
6. **Typescript & Build Checks**: Verified successfully. `npx tsc --noEmit` and `npm run build` ran with 0 errors.

## SMTP Env Configuration Required
```env
MAIL_DRIVER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="3F Store"

FRONTEND_URL=https://3f-store.vercel.app
APP_URL=https://trial1506895.mbws.vn

EMAIL_VERIFICATION_EXPIRES_MINUTES=60
EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS=60
EMAIL_VERIFICATION_DAILY_LIMIT=5
```
