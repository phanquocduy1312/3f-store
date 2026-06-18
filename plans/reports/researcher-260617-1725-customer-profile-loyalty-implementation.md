# Researcher Report: Customer Profile & Loyalty Architecture

- Date: 2026-06-17
- Slug: customer-profile-loyalty-implementation

## Key Solutions

### 1. Dynamic Routing in PHP mini MVC
Currently, [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php) performs a direct string match.
We will enhance `Router::dispatch()` to match patterns with placeholders (e.g. `:id`, `:orderCode`) using regex:
- Convert path definitions like `/api/customer/addresses/:id` to `#^/api/customer/addresses/([^/]+)$#`.
- Extract captured match groups and populate them directly into `$_GET` and `$_REQUEST` arrays, so handlers can access them seamlessly.
- Implement HTTP method support for PATCH, DELETE, and PUT.

### 2. Database Compatibility Migrations
- Write an SQL script to alter `customers` and `customer_addresses` using standard MySQL commands.
- Run queries sequentially and catch `PDOException`. If the column or table already exists, log it and proceed without throwing errors.
- Clean up default membership tiers:
  - Delete `Diamond` tier.
  - Update `Platinum` to have `min_points = 15000` and `color = '#06B6D4'`.

### 3. Vouchers Consolidated Fetching
`/api/customer/vouchers` will return a merged list from:
- **`voucher_pools`**: Vouchers assigned to the customer's phone (`assigned_customer_id = :phone`).
- **`coupons`**: System-wide active coupons.
  - Check if they are already used by this customer in `coupon_usages` table.
  - Exclude if used, expired, or inactive.

### 4. Loyalty Details
- Points: Query points balance using `CustomerPointTransactionModel::getBalance($phone)`.
- History: Fetch list of transactions using `CustomerPointTransactionModel::getCustomerTransactions($phone)`.
- Shopee requests: Query `shopee_point_requests` by phone.
