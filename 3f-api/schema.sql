-- SQL Schema for 3F Club Shopee Point Request Database (3f)

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
