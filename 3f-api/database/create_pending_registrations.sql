-- Migration: Create pending_registrations table for email verification flow
CREATE TABLE IF NOT EXISTS pending_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,

  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,

  last_sent_at DATETIME NULL,
  resend_count INT NOT NULL DEFAULT 0,
  daily_send_date DATE NULL,
  daily_send_count INT NOT NULL DEFAULT 0,

  ip_address VARCHAR(64) NULL,
  user_agent TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,

  UNIQUE KEY uniq_pending_email (email),
  INDEX idx_pending_token_hash (token_hash),
  INDEX idx_pending_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
