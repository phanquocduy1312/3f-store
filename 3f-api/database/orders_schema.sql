CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  zalo VARCHAR(50) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_addresses_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  zalo VARCHAR(50) NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  note TEXT NULL,
  payment_method VARCHAR(50) NOT NULL,
  shipping_method VARCHAR(50) NOT NULL DEFAULT 'express',
  payment_status VARCHAR(100) NOT NULL DEFAULT 'unpaid',
  order_status VARCHAR(100) NOT NULL DEFAULT 'pending_confirmation',
  shipping_status VARCHAR(100) NOT NULL DEFAULT 'no_shipment',
  loyalty_status VARCHAR(100) NOT NULL DEFAULT 'not_earned',
  order_source VARCHAR(50) NULL,
  assigned_staff_id INT NULL,
  internal_note TEXT NULL,
  customer_note TEXT NULL,
  cancelled_reason VARCHAR(255) NULL,
  returned_reason VARCHAR(255) NULL,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  loyalty_points_earned INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_code (order_code),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_payment_status (payment_status),
  INDEX idx_orders_shipping_status (shipping_status),
  INDEX idx_orders_loyalty_status (loyalty_status),
  INDEX idx_orders_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,
  sku VARCHAR(120) NULL,
  product_name VARCHAR(500) NOT NULL,
  variant_name VARCHAR(500) NULL,
  image_url TEXT NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_items_order (order_id),
  INDEX idx_items_product (product_id),
  INDEX idx_items_variant (variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  group_key VARCHAR(50) NOT NULL DEFAULT 'order',
  from_status VARCHAR(100) NOT NULL,
  to_status VARCHAR(100) NOT NULL,
  note TEXT NULL,
  changed_by VARCHAR(100) NULL,
  changed_by_admin_id INT NULL,
  changed_by_customer_id INT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_payment_proofs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  image_url TEXT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proofs_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('fixed','percent','free_shipping','gift') NOT NULL DEFAULT 'fixed',
  discount_value DECIMAL(12,2) NOT NULL,
  max_discount_amount DECIMAL(12,2) NULL,
  min_order_amount DECIMAL(12,2) DEFAULT 0.00,
  usage_limit INT NULL,
  used_count INT DEFAULT 0,
  per_customer_limit INT NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  is_active TINYINT(1) DEFAULT 1,
  show_on_home TINYINT(1) DEFAULT 0,
  show_in_cart TINYINT(1) DEFAULT 0,
  show_in_ai_advisor TINYINT(1) DEFAULT 0,
  display_title VARCHAR(120) NULL,
  display_label VARCHAR(80) NULL,
  badge_text VARCHAR(80) NULL,
  theme_color VARCHAR(40) DEFAULT 'sky',
  icon_key VARCHAR(40) DEFAULT 'ticket',
  sort_order INT DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS coupon_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NULL,
  code VARCHAR(100) NOT NULL,
  event_type ENUM('view','copy','apply_success','apply_failed','redeem_order') NOT NULL,
  customer_phone VARCHAR(50) NULL,
  metadata_json TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coupon_events_coupon (coupon_id),
  INDEX idx_coupon_events_code (code),
  INDEX idx_coupon_events_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- New tables for CRM + Loyalty + Automation
CREATE TABLE IF NOT EXISTS workflow_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_key VARCHAR(50) NOT NULL,
  status_key VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT NULL,
  color VARCHAR(50) NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  is_default TINYINT(1) DEFAULT 0,
  is_terminal TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_group_status (group_key, status_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_key VARCHAR(50) NOT NULL,
  from_status VARCHAR(100) NOT NULL,
  to_status VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  requires_reason TINYINT(1) DEFAULT 0,
  requires_permission VARCHAR(100) NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_transition (group_key, from_status, to_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS automation_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(100) NOT NULL,
  trigger_group VARCHAR(50) NULL,
  from_status VARCHAR(100) NULL,
  to_status VARCHAR(100) NULL,
  conditions_json TEXT NULL,
  actions_json TEXT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_id INT NULL,
  activity_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  metadata JSON NULL,
  created_by_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  channel_key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  provider VARCHAR(100) NULL,
  config_json TEXT NULL,
  is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipping_providers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config_json TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_shipping_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  method_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_shipping_methods_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
