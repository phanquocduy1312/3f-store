# Research Report: OTP Provider Adapter & 3F Club Loyalty Rules Engine

**Date**: 2026-06-21
**Time**: 22:55 (GMT+7)
**Slug**: otp-adapter-and-loyalty-engine
**Type**: researcher

## Executive Summary
This report analyzes the technical requirements to implement an adapter-based OTP service and a configurable multi-dimensional loyalty rules engine.

## 1. OTP Provider Adapter Architecture
To support multiple SMS gateways (SpeedSMS, FPT, Viettel, Stringee) and ensure modularity, we define a standard interface:
```php
interface OtpProviderInterface {
    public function sendOtp(string $phone, string $message, array $metadata = []): OtpSendResult;
}
```
A service class `OtpService` selects the provider based on the dynamic environment variable `OTP_PROVIDER` (defaulting to `mock` in dev mode).

### Cooldown & Limit Rules:
- Cooldown: 60s window per phone and purpose.
- Expiry: 5 minutes.
- Limit: 5 sends per day per phone.
- Failed verification attempts: Max 5 per request.

## 2. 3F Club Loyalty Rules Engine
The loyalty system utilizes a strict points ledger model to guarantee balance accuracy, prevent double-crediting (idempotency), and track point lifecycle states (`holding`, `available`, `used`, `expired`, `cancelled`).

### Calculation Formula:
- Eligible spend: `productSubtotalAfterDiscount - amountPaidByPoints - excludedProducts` (excluding shipping and cancelled items).
- Earning calculation: `points = eligibleAmount / money_per_point * channel_multiplier * campaign_multiplier`.
- Multipliers: Shopee/TikTok: x1, Website/Retail: x1.5, Campaign boosts: configurable.

### Membership Tiers:
- **Member**: Phone verified. Can use points.
- **Silver**: Spend >= 2M or >=3 orders. Redemption capped at 10%.
- **Gold**: Spend >= 5M or >=6 orders. Redemption capped at 15%.
- **Diamond**: Spend >= 10M or >=12 orders. Redemption capped at 20%.
- Spending calculation: Sum of eligible completed orders in the last rolling 12 months.

## 3. Database Schema
- `otp_requests` and `otp_send_logs`: Houses hashed OTP verifications and audit logs.
- `loyalty_point_transactions`: Strict ledger database ensuring double-entry-like history and unique constraints to prevent double-award bugs.
- `loyalty_settings`: Dynamic table keeping parameters out of raw code.
