-- Migration for Customer Profile, Address Book, Security, and Pets

-- 1. Alter customers table safely
ALTER TABLE customers MODIFY COLUMN phone VARCHAR(30) NULL;
ALTER TABLE customers ADD COLUMN full_name VARCHAR(255) NULL AFTER id;
ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE customers ADD COLUMN status ENUM('active','blocked') NOT NULL DEFAULT 'active';
ALTER TABLE customers ADD COLUMN phone_verified_at DATETIME NULL;
ALTER TABLE customers ADD COLUMN email_verified_at DATETIME NULL;
ALTER TABLE customers ADD COLUMN last_login_at DATETIME NULL;
ALTER TABLE customers ADD COLUMN birthday DATE NULL;
ALTER TABLE customers ADD COLUMN gender VARCHAR(20) NULL;
ALTER TABLE customers ADD COLUMN avatar_url TEXT NULL;

-- 2. Create customer_sessions table if not exists
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

-- 3. Create customer_otps table if not exists
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

-- 4. Alter customer_addresses table safely
ALTER TABLE customer_addresses ADD COLUMN receiver_phone VARCHAR(30) NULL;
ALTER TABLE customer_addresses ADD COLUMN province_code VARCHAR(50) NULL;
ALTER TABLE customer_addresses ADD COLUMN province_name VARCHAR(255) NULL;
ALTER TABLE customer_addresses ADD COLUMN ward_code VARCHAR(50) NULL;
ALTER TABLE customer_addresses ADD COLUMN ward_name VARCHAR(255) NULL;
ALTER TABLE customer_addresses ADD COLUMN note TEXT NULL;
ALTER TABLE customer_addresses ADD COLUMN type ENUM('home','office','other') DEFAULT 'home';

-- 5. Create customer_pets table
CREATE TABLE IF NOT EXISTS customer_pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  species ENUM('cat','dog','other') NOT NULL,
  breed VARCHAR(255) NULL,
  gender ENUM('male','female','unknown') NULL,
  birthday DATE NULL,
  weight_kg DECIMAL(6,2) NULL,
  health_notes TEXT NULL,
  allergies TEXT NULL,
  favorite_food TEXT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pets_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Adjust loyalty membership tiers
DELETE FROM membership_tiers WHERE name = 'Diamond';
UPDATE membership_tiers SET min_points = 15000, color = '#06B6D4' WHERE name = 'Platinum';
