-- Customer Auth Schema Migration
-- Extends customers table + adds session/OTP tables

-- Add auth columns to customers (idempotent with IF NOT EXISTS pattern)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS phone_verified_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS email_verified_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL;

-- Make phone nullable (it was NOT NULL before)
ALTER TABLE customers MODIFY COLUMN phone VARCHAR(30) NULL;

-- Add unique index on email if not exists (ignore error if exists)
ALTER TABLE customers ADD UNIQUE INDEX idx_customers_email_unique (email);

-- Backfill full_name from name column for existing rows
UPDATE customers SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- Customer sessions for token-based auth
CREATE TABLE IF NOT EXISTS customer_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cs_customer (customer_id),
  INDEX idx_cs_token (token_hash),
  INDEX idx_cs_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer OTPs for phone verification
CREATE TABLE IF NOT EXISTS customer_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(30) NOT NULL,
  otp_hash VARCHAR(64) NOT NULL,
  purpose ENUM('login','register','reset_password','link_phone') NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  verified_at DATETIME NULL,
  verification_token VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_phone (phone),
  INDEX idx_otp_purpose (purpose),
  INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
