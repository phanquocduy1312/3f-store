-- SQL Schema for 3F Club Shopee Point Request Database (3f)
-- Product catalog tables are also available in database/product_catalog_schema.sql.

CREATE DATABASE IF NOT EXISTS `3f` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `3f`;

-- 1. Table for uploaded receipt images
CREATE TABLE IF NOT EXISTS `uploaded_order_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `upload_source` VARCHAR(50) DEFAULT 'customer_form',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. Table for image scanning/OCR results
CREATE TABLE IF NOT EXISTS `order_image_scans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `image_id` INT NOT NULL,
  `scan_status` VARCHAR(50) DEFAULT 'success',
  `raw_text` TEXT NOT NULL,
  `extracted_customer_name` VARCHAR(255) NULL,
  `extracted_phone` VARCHAR(20) NULL,
  `extracted_email` VARCHAR(255) NULL,
  `extracted_order_code` VARCHAR(100) NULL,
  `extracted_order_amount` INT NULL,
  `extracted_order_date` DATE NULL,
  `extracted_order_status` VARCHAR(50) NULL,
  `extracted_shipping_provider` VARCHAR(100) NULL,
  `extracted_tracking_code` VARCHAR(100) NULL,
  `confidence` INT NOT NULL,
  `warnings` TEXT NULL, -- Stored as a JSON string
  `ocr_provider` VARCHAR(50) DEFAULT 'mock',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`image_id`) REFERENCES `uploaded_order_images`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table for customer shopee point requests
CREATE TABLE IF NOT EXISTS `shopee_point_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NULL,
  `zalo` VARCHAR(20) NULL,
  `shopee_order_code` VARCHAR(100) NOT NULL,
  `order_amount` INT NOT NULL,
  `expected_points` INT NOT NULL,
  `approved_points` INT DEFAULT 0,
  `image_id` INT NULL,
  `scan_id` INT NULL,
  `processing_status` VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  `verification_status` VARCHAR(50) DEFAULT 'not_checked',
  `matched_shopee_order_id` VARCHAR(100) NULL,
  `shopee_api_status` VARCHAR(50) NULL,
  `shopee_api_order_amount` INT NULL,
  `shopee_api_raw_json` LONGTEXT NULL,
  `verified_at` DATETIME NULL,
  `verification_note` TEXT NULL,
  `source` VARCHAR(50) DEFAULT 'customer_form', -- 'customer_form', 'manual_admin'
  `admin_note` TEXT NULL,
  `rejected_reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` TIMESTAMP NULL,
  `approved_by` VARCHAR(100) NULL,
  `rejected_at` TIMESTAMP NULL,
  FOREIGN KEY (`image_id`) REFERENCES `uploaded_order_images`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`scan_id`) REFERENCES `order_image_scans`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance optimization
CREATE INDEX idx_requests_phone ON shopee_point_requests(phone);
CREATE INDEX idx_requests_order_code ON shopee_point_requests(shopee_order_code);
CREATE INDEX idx_requests_processing_status ON shopee_point_requests(processing_status);

-- 4. Table for Shopee Open Platform tokens
CREATE TABLE IF NOT EXISTS `shopee_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shop_id` VARCHAR(100) NOT NULL,
  `partner_id` VARCHAR(100) NOT NULL,
  `access_token` VARCHAR(255) NOT NULL,
  `refresh_token` VARCHAR(255) NOT NULL,
  `expire_in` INT NOT NULL,
  `token_expired_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_shop_partner` (`shop_id`, `partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table for Loyalty Point Rules
CREATE TABLE IF NOT EXISTS `loyalty_point_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `source` VARCHAR(50) NOT NULL,
  `money_per_point` INT NOT NULL,
  `rounding_mode` VARCHAR(20) DEFAULT 'floor',
  `min_order_amount` INT DEFAULT 0,
  `max_points_per_order` INT DEFAULT NULL,
  `multiplier` DECIMAL(5,2) DEFAULT 1.00,
  `is_active` TINYINT(1) DEFAULT 1,
  `starts_at` TIMESTAMP NULL DEFAULT NULL,
  `ends_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Shopee point rule
INSERT INTO `loyalty_point_rules` (
  `name`, `source`, `money_per_point`, `rounding_mode`, 
  `min_order_amount`, `max_points_per_order`, `multiplier`, `is_active`
) VALUES (
  'Shopee default rule', 'shopee', 10000, 'floor', 
  0, NULL, 1.00, 1
);

-- 6. Table for Loyalty Rewards
CREATE TABLE IF NOT EXISTS `loyalty_rewards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `reward_type` VARCHAR(50) NOT NULL DEFAULT 'manual_reward',
  `image_url` TEXT NULL,
  `points_required` INT NOT NULL,
  `reward_value` INT NULL,
  `stock_quantity` INT NULL,
  `limit_per_customer` INT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `starts_at` DATETIME NULL,
  `ends_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table for Loyalty Reward Redemptions
CREATE TABLE IF NOT EXISTS `loyalty_reward_redemptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_phone` VARCHAR(30) NOT NULL,
  `customer_name` VARCHAR(255) NULL,
  `reward_id` INT NOT NULL,
  `points_spent` INT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `note` TEXT NULL,
  `processed_by` VARCHAR(255) NULL,
  `processed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_phone` (`customer_phone`),
  INDEX `idx_reward_id` (`reward_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`reward_id`) REFERENCES `loyalty_rewards`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table for Customer Point Transactions
CREATE TABLE IF NOT EXISTS `customer_point_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_phone` VARCHAR(30) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `points` INT NOT NULL,
  `balance_after` INT NULL,
  `reference_type` VARCHAR(50) NULL,
  `reference_id` INT NULL,
  `note` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_trans_phone` (`customer_phone`),
  INDEX `idx_trans_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
