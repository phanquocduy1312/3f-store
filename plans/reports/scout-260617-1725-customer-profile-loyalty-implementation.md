# Scout Report: Customer Profile & Loyalty Implementation

- Date: 2026-06-17
- Task: Design and implement Profile/Account Center for customers (ecommerce + 3F Club loyalty)

## Findings

### 1. Database Schema
- **`customers`** table exists but lacks fields: `birthday`, `gender`, `avatar_url`, and the authentication fields `full_name`, `password_hash`, `status`, `phone_verified_at`, `email_verified_at`, `last_login_at` because MySQL 8-specific `IF NOT EXISTS` syntax in the previous migration script did not execute properly on local Laragon database.
- **`customer_addresses`** table exists but uses older fields (`phone`, `province`, `district`, `ward`) instead of the new administrative fields (`province_code`, `province_name`, `ward_code`, `ward_name`, `note`, `type`).
- **`customer_pets`** table does not exist and needs to be created.
- **`customer_point_transactions`**, `loyalty_rewards`, `loyalty_reward_redemptions`, `voucher_pools` and `coupons`/`coupon_usages` tables exist and contain the loyalty data.

### 2. Backend Routing
- Entrypoint: [public/index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- Router: [app/Core/Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- Router matches exact paths and only has methods `get` and `post`. We need to add dynamic path parameter parsing (e.g. `:id`) and extend `Request::input` to support `PATCH` and `DELETE` requests parsed from JSON payloads.

### 3. Existing Customer Auth Controllers
- [app/Controllers/CustomerAuthController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerAuthController.php) has logic for registration, login, OTP requests, and linking phone numbers.
- We need to create a dedicated profile controller and separate endpoints for addresses, orders, club details, security, vouchers, and pets.

### 4. Frontend Routing & Context
- Routes in [src/App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- Auth Context in [src/context/CustomerAuthContext.tsx](file:///c:/Users/Admin/Downloads/ccc/src/context/CustomerAuthContext.tsx)
- We will add the Customer Route Guard, Layout, Profile Tabs, Address Book, Orders list/detail, Vouchers list, Loyalty transactions, Security configuration, and Pet profile cards.
