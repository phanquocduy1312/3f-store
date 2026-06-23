# Scout Report: OTP & Loyalty Security Hardening

**Date**: 2026-06-21
**Time**: 23:23
**Task Slug**: security-hardening-and-full-qa-otp-loyalty

## 1. Relevant Files Discovered

### A. OTP Delivery & Verification (Backend)
- [OtpService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OtpService.php): Manages generation, cooldown checking, validation token generation, and provider routing.
- [OtpController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OtpController.php): API handler endpoints for sending and verifying OTP codes.
- [MockOtpProvider.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/Otp/MockOtpProvider.php): The development test mock SMS delivery channel.

### B. Loyalty & Membership Tiers (Backend)
- [LoyaltyProductionModel.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/LoyaltyProductionModel.php): Calculations for customer tiers, spend requirements, points credit limit, etc.
- [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php): Base order handling including status transition validations and point ledger logging.

### C. Admin & Customer Portals (Frontend)
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx): Displays workflow config and order transitions.
- [ThreeFClubPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/ThreeFClubPage.tsx): Admin loyalty settings.
- [CustomerRewardsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/CustomerRewardsPage.tsx): Customer loyalty summary.

## 2. Hardening Priorities
- Block mock provider in production.
- Throw error if `OTP_SECRET` is missing in production.
- Verify idempotency constraints in loyalty transaction records.
