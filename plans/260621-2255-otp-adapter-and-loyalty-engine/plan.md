---
title: OTP Adapter & Loyalty Rules Engine Implementation
description: Configurable OTP provider adapters and a dynamic 3F Club loyalty ledger and rules engine.
status: completed
priority: high
effort: high
branch: dev
tags: ['otp', 'crm', 'loyalty', 'admin']
created: 2026-06-21
---

# Plan Overview: OTP & Loyalty Upgrades

This plan introduces an adapter-based OTP service and a configurable 3F Club loyalty rules engine.

## Phases

1. **[Phase 1: OTP Adapter & Database](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2255-otp-adapter-and-loyalty-engine/phase-01-otp-adapter.md)**
   - Create migrations for `otp_requests`, `otp_send_logs`, `loyalty_point_transactions`, and `loyalty_settings`.
   - Implement `OtpProviderInterface`, `MockOtpProvider`, and real SMS adapters (SpeedSMS, FPT, Viettel, Stringee).
   - Implement `OtpService` logic (cooldown, hashed check, rate limit) and API controllers.

2. **[Phase 2: Loyalty Rules Engine](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2255-otp-adapter-and-loyalty-engine/phase-02-loyalty-rules.md)**
   - Implement `LoyaltySettings` database configuration model.
   - Implement points calculation formulas, multipliers, and rolling 12-month tier thresholds.
   - Write points ledger operations with unique keys for idempotency.
   - Expose endpoints for customer stats and order points calculation.

3. **[Phase 3: Frontend Integration & Configuration](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2255-otp-adapter-and-loyalty-engine/phase-03-frontend-config.md)**
   - Add "3F Club Settings" tab in Admin portal with subtabs (Cách tính điểm, Hạng thành viên, Hạn điểm, Kênh bán hàng, OTP & Bảo mật).
   - Update Customer UI to show points ledger, tiers, and verification CTA.

## Key Dependencies
- Database connectivity
- Clean API routing mappings
