# Phase 1: Database Schema & Backend Models

**Related Files:**
* Database Schema: [orders_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/orders_schema.sql)
* Migration Logic: [Order.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Order.php)
* Coupon Model: [Coupon.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/Coupon.php)
* Coupon Controller: [CouponController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CouponController.php)
* Routing: [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
* Order Flow: [OrderController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/OrderController.php)

---

## 1. Database Schema Updates
Add `coupons` and `coupon_usages` tables, and conditionally add `coupon_code` to the `orders` table.

### Schema Script Additions (`orders_schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('fixed','percent') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  max_discount_amount DECIMAL(12,2) NULL,
  min_order_amount DECIMAL(12,2) DEFAULT 0.00,
  usage_limit INT NULL,
  used_count INT DEFAULT 0,
  per_customer_limit INT NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  order_id INT NOT NULL,
  customer_phone VARCHAR(50) NULL,
  discount_amount DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usages_coupon (coupon_id),
  INDEX idx_usages_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration Check (`Order.php`)
Check if the `coupon_code` column exists on `orders` and run the `ALTER` statement if it does not. Also seed the `GIAM50K` coupon if empty.
```php
$checkCol = $this->db->query("SHOW COLUMNS FROM orders LIKE 'coupon_code'")->fetch();
if (!$checkCol) {
    $this->db->exec("ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(100) NULL AFTER discount");
}

$stmt = $this->db->prepare("SELECT id FROM coupons WHERE code = 'GIAM50K'");
$stmt->execute();
if (!$stmt->fetch()) {
    $this->db->exec("INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, is_active) VALUES ('GIAM50K', 'Giảm 50K', 'Giảm 50.000đ cho đơn từ 399.000đ', 'fixed', 50000.00, 399000.00, 1)");
}
```

---

## 2. Coupon Validation API

### Endpoint: `POST /api/coupons/validate`
Validate coupon using:
1. Normalization (uppercase, trim).
2. Date range checks (`starts_at` & `ends_at`).
3. Total amount constraints (`min_order_amount`).
4. Total use constraints (`usage_limit`).
5. Customer frequency check (`per_customer_limit`).
6. Discount value cap calculation.

---

## 3. Order Creation Modification (`OrderController.php`)
Include `couponCode` parameter in the payload:
* If provided, fetch and validate coupon on the backend.
* Check that coupon is valid and compute the exact `discount_amount`.
* Subtract `discount_amount` from `subtotal` to determine final `total`.
* Perform all database updates (insert order, reserve stock, insert `coupon_usages`, increment `used_count`) under a single database transaction.
* Return a `400 Bad Request` if coupon is invalid.

---

## 4. Admin Order Details
Synchronize order query outputs to retrieve the new fields:
* Include `coupon_code` (alias `couponCode`) and map `discount` (alias `discountAmount`) in responses.
