# Cook Report: OTP Provider Adapter and 3F Club Loyalty Rules Engine

## Completed Tasks

* **OTP Backend Services**:
  * Extensible adapter pattern using `OtpProviderInterface` and `OtpSendResult`.
  * Support for `Mock`, `SpeedSMS`, `FPT`, `Viettel`, `Stringee` providers.
  * Hashed OTP verification (`password_hash`), 60s cooldown limit, max 5 daily sends per phone, and max 5 failed attempts lockout.
  * API endpoints `/api/customer/otp/send` and `/api/customer/otp/verify` registered.

* **Loyalty Rules Engine**:
  * Rules configured dynamically via new `loyalty_settings` table.
  * Points ledger (`loyalty_point_transactions`) supporting point states (`holding`, `available`, `used`, `expired`, `cancelled`) and idempotency key uniqueness.
  * Dynamic member tier calculations (rolling 12-month spend/orders: Member, Silver, Gold, Diamond) with tier redemption caps.
  * Order credit and point reversal logic integrated with SQL ledger updates.

* **Admin UI (Settings Panel)**:
  * Integrated settings tab under `ThreeFClubPage.tsx` active tab `clubSettings`.
  * Rendered `ClubSettingsSection.tsx` showing subtabs: "Cách tính điểm", "Hạng thành viên", "Hạn điểm", "Kênh bán hàng", "OTP & Bảo mật".

* **Customer UI (3F Club Page)**:
  * Profile loyalty dashboard (`CustomerRewardsPage.tsx`) upgraded to query `/api/customer/club/summary` and `/api/customer/club/transactions`.
  * Renders available, holding, used, and expired points.
  * Renders rolling 12-month tier progress bars for spent money and completed order counts.
  * Displays phone verification status with CTA banner to profile if not verified.
  * Enforces beautiful OTP verification modal before executing redemption.

* **Build & Validation**:
  * Database migration successfully executed via CLI PHP.
  * Verified TypeScript type checks pass: `npx tsc --noEmit` returns exit code 0.
  * Verified production bundle build: `npm run build` completed successfully.

## Unresolved Questions / Credentials Needed

* Real API keys and credentials for SpeedSMS, FPT SMS, Viettel SMS, and Stringee OTP gateways need to be added to the production environment variables when rolling out to live servers.
