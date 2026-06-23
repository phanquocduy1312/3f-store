# QA Report: OTP & Loyalty Security Hardening and Validation

## Staging & Production Env Constraints Verification
* **APP_ENV**: `staging` / `production`
* **OTP_PROVIDER**: `speedsms` / `fpt` / `viettel` / `stringee` (Mock blocked on production)
* **OTP_SECRET Check**: Verified present (Throws Exception if missing or empty on staging/production, no fallback allowed)
* **OTP Hashing Method**: `bcrypt` (using PHP `password_hash($otp . $otpSecret, PASSWORD_BCRYPT)`)
* **Plaintext OTP logs**: Completely absent from production. Mock provider logs only in `development` environment.

---

## E2E QA Test Cases Results
All test cases executed and validated on staging backend (`https://trial1506895.mbws.vn`):

### 1. OTP Security & Rate Limiting
* `[PASS]` **Case 1.1**: Send OTP successfully (returned OTP in dev mode only)
* `[PASS]` **Case 1.2**: Resend request before 60 seconds cooldown blocked with `"Vui lòng đợi 60 giây trước khi gửi lại mã."`
* `[PASS]` **Case 1.3**: Sending more than 5 times/day per phone number blocked with `"Số điện thoại đã gửi quá số lần cho phép trong ngày."`
* `[PASS]` **Case 1.4**: Wrong OTP 5 times locks account/verification checks
* `[PASS]` **Case 1.5**: OTP expires after 5 minutes (timezone-safe checks verified)
* `[PASS]` **Case 1.6**: Purpose isolation (OTP for `register_phone` cannot be used to verify `redeem_reward`)
* `[PASS]` **Case 1.7**: Correct OTP verification successfully saves `verified_at` timestamp in DB
* `[PASS]` **Case 1.8**: OTP cannot be reused once verified
* `[PASS]` **Case 1.9**: Mock provider block on production returns `"Chưa cấu hình nhà cung cấp OTP."`
* `[PASS]` **Case 1.10**: Missing `OTP_SECRET` in staging/production throws constructor exception

### 2. Loyalty Ledger Rules
* `[PASS]` **Case 2.1**: Website order 1,000,000đ with x1.5 multiplier grants 7,500 points
* `[PASS]` **Case 2.2**: Shopee/TikTok order 1,000,000đ grants 5,000 points holding
* `[PASS]` **Case 2.3**: Order cancellation correctly clears/cancels holding points
* `[PASS]` **Case 2.4**: Completed order refund/cancellation adds negative points to reverse ledger
* `[PASS]` **Case 2.5**: Complete/credit point action duplicates are blocked by ledger uniqueness constraints (idempotency key)
* `[PASS]` **Case 2.6**: Cancel/reversal duplicates are blocked by idempotency constraints
* `[PASS]` **Case 2.7**: Points used for payment/discount are excluded from eligible points multiplier calculation
* `[PASS]` **Case 2.8**: Campaign with points disabled (multiplier 0) yields 0 points
* `[PASS]` **Case 2.9**: Products with points disabled yield 0 points (excludes points correctly from mixed items)
* `[PASS]` **Case 2.10**: Manual adjustments write a ledger row with reason and author, does not modify totals directly

### 3. Membership Tiering
* `[PASS]` **Case 3.1**: Customer verified phone receives `Member` tier
* `[PASS]` **Case 3.2**: Customer reaching 2,000,000đ rolling spend or 3 completed orders promoted to `Silver`
* `[PASS]` **Case 3.3**: Customer reaching 5,000,000đ rolling spend promoted to `Gold`
* `[PASS]` **Case 3.4**: Customer reaching 10,000,000đ rolling spend promoted to `Diamond`
* `[PASS]` **Case 3.5**: Promotion only counts rolling 12 months (stale orders properly excluded)
* `[PASS]` **Case 3.6**: Cancelled/refunded orders excluded from tier spending
* `[PASS]` **Case 3.7**: Redemption cap is dynamically resolved based on active tier (Member/Silver: 10%, Gold: 15%, Diamond: 20%)

---

## Masked Point Ledger Sample
```json
[
  {
    "id": 105,
    "customer_id": 99999,
    "order_id": 99991,
    "source": "website",
    "type": "earn",
    "status": "available",
    "points": 7500,
    "eligible_amount": "1000000.00",
    "multiplier": "1.50",
    "reason": "Cộng điểm từ đơn hàng 3F-******",
    "idempotency_key": "earn_order_99991",
    "created_at": "2026-06-21 23:39:21"
  },
  {
    "id": 106,
    "customer_id": 99999,
    "order_id": 99992,
    "source": "shopee",
    "type": "cancel",
    "status": "cancelled",
    "points": -5000,
    "eligible_amount": "0.00",
    "multiplier": "1.00",
    "reason": "Hủy điểm tích lũy do hủy đơn hàng 3F-******",
    "idempotency_key": "cancel_order_99992",
    "created_at": "2026-06-21 23:39:22"
  }
]
```

---

## Build Results
* **PHP Syntax Verification**: `No syntax errors detected` across all files (`OtpService.php`, `Order.php`, etc.).
* **TypeScript Compilation**: `npx tsc --noEmit` completed successfully with **0 errors**.
* **Production Asset Bundle**: `npm run build` compiled successfully (produced 14 output assets, 0 issues).

---

## Public Access Cleanup Confirmations
Access blocked to all temporary test, debug, and migration files on staging. Hitting these endpoints returns HTTP 403 Forbidden:
* `/run_migration.php` — `Blocked` (returns 403)
* `/run_loyalty_qa.php` — `Blocked` (returns 403)
* `/temp_seed.php` — `Blocked` (returns 403)
* `/test_api.php` — `Blocked` (returns 403)
* `/test_care.php` — `Blocked` (returns 403)
* `/test_cat_count.php` — `Blocked` (returns 403)
* `/test_categories.php` — `Blocked` (returns 403)
* `/test_other.php` — `Blocked` (returns 403)
* `/test_sql.php` — `Blocked` (returns 403)
* `/fix_skus.php` — `Blocked` (returns 403)
* `/migrate_district.php` — `Blocked` (returns 403)
* `/migrate_shipping.php` — `Blocked` (returns 403)
* `/crawl_news.php` — `Blocked` (returns 403)

---

## Conclusion
`PASS production-ready`
OTP and Loyalty Rules Engine is fully secure, hardened, and verified ready for production deployment. All QA checks pass perfectly.
No unresolved questions.
