<?php

// Load environment variables from .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'(.*)'$/", $val, $matches)) {
                $val = $matches[1];
            }
            $val = trim($val);
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../config/config.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database.\n";

    // 1. otp_requests Table
    $sqlOtpRequests = "
    CREATE TABLE IF NOT EXISTS otp_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(30) NOT NULL,
        purpose ENUM('login', 'register', 'reset_password', 'register_phone', 'redeem_reward', 'use_points', 'change_phone', 'link_phone', 'sensitive_action', 'shopee_point_request', 'shopee_point_guest') NOT NULL,
        otp_hash VARCHAR(256) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        failed_attempts INT NOT NULL DEFAULT 0,
        resend_count INT NOT NULL DEFAULT 0,
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(255) NULL,
        metadata_json TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_otp_req_phone_purpose (phone, purpose),
        INDEX idx_otp_req_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlOtpRequests);
    echo "Table otp_requests checked/created.\n";

    // 2. otp_send_logs Table
    $sqlOtpSendLogs = "
    CREATE TABLE IF NOT EXISTS otp_send_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(30) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        status ENUM('success', 'failed') NOT NULL,
        error_message TEXT NULL,
        provider_response TEXT NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlOtpSendLogs);
    echo "Table otp_send_logs checked/created.\n";

    // 3. loyalty_settings Table
    $sqlLoyaltySettings = "
    CREATE TABLE IF NOT EXISTS loyalty_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description VARCHAR(255) NULL,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlLoyaltySettings);
    echo "Table loyalty_settings checked/created.\n";

    // 3b. loyalty_tiers Table
    $sqlLoyaltyTiers = "
    CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        color VARCHAR(30) NOT NULL,
        min_spend DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        min_orders INT NOT NULL DEFAULT 0,
        redemption_cap_percent INT NOT NULL DEFAULT 10,
        benefits TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlLoyaltyTiers);
    echo "Table loyalty_tiers checked/created.\n";

    // Seed default loyalty_tiers if empty
    $countTiers = (int)$db->query("SELECT COUNT(*) FROM loyalty_tiers")->fetchColumn();
    if ($countTiers === 0) {
        $db->exec("
            INSERT INTO loyalty_tiers (key_name, name, multiplier, color, min_spend, min_orders, redemption_cap_percent, benefits, is_active) VALUES
            ('member', 'Member', 1.00, '#64748B', 0.00, 0, 10, 'Xác thực SĐT, tích điểm cơ bản', 1),
            ('silver', 'Silver', 1.00, '#94A3B8', 2000000.00, 3, 10, 'Tích điểm tốt hơn trên kênh riêng.\nĐược dùng điểm tối đa 10% giá trị đơn.\nCó voucher chăm sóc định kỳ.', 1),
            ('gold', 'Gold', 1.20, '#F59E0B', 5000000.00, 6, 15, 'Ưu đãi riêng cho combo lớn.\nĐược dùng điểm tối đa 15% giá trị đơn.\nĐược nhắc lịch mua lại theo lịch ăn / cát / pate của pet.\nĐược ưu tiên nhận deal sớm.', 1),
            ('diamond', 'Diamond', 1.50, '#8B5CF6', 10000000.00, 12, 20, 'Nhóm chăm sóc riêng / ưu tiên CSKH.\nĐược dùng điểm tối đa 20% giá trị đơn.\nCó deal riêng cho khách nuôi nhiều bé.\nĐược ưu tiên giữ hàng, deal hot hoặc sản phẩm mới.', 1)
        ");
        echo "Default loyalty_tiers seeded.\n";
    }

    // Seed default settings
    $defaultSettings = [
        'money_per_point' => ['200', 'Số tiền (VND) chi tiêu để đổi lấy 1 điểm tích lũy'],
        'point_redeem_value' => ['20', 'Giá trị chuyển đổi của 1 điểm sang voucher giảm giá (1 điểm = 20 VND)'],
        'point_expiry_months' => ['12', 'Thời gian hết hạn của điểm tích lũy kể từ lúc khả dụng (tháng)'],
        'expiry_reminder_days' => ['7', 'Số ngày báo trước khi điểm sắp hết hạn'],
        'multiplier_website' => ['1.5', 'Hệ số điểm khi mua qua website'],
        'multiplier_zalo' => ['1.5', 'Hệ số điểm khi mua qua Zalo'],
        'multiplier_facebook' => ['1.5', 'Hệ số điểm khi mua qua Facebook'],
        'multiplier_store' => ['1.5', 'Hệ số điểm khi mua trực tiếp tại cửa hàng'],
        'multiplier_shopee' => ['1.0', 'Hệ số điểm khi mua qua Shopee'],
        'multiplier_tiktok' => ['1.0', 'Hệ số điểm khi mua qua TikTok Shop'],
        'tier_member_spend' => ['0', 'Số tiền tích lũy tối thiểu hạng Member (VND)'],
        'tier_member_orders' => ['0', 'Số đơn hàng tối thiểu hạng Member'],
        'tier_member_cap' => ['10', 'Tỷ lệ thanh toán tối đa bằng điểm hạng Member (%)'],
        'tier_silver_spend' => ['2000000', 'Số tiền tích lũy tối thiểu hạng Silver (VND)'],
        'tier_silver_orders' => ['3', 'Số đơn hàng tối thiểu hạng Silver'],
        'tier_silver_cap' => ['10', 'Tỷ lệ thanh toán tối đa bằng điểm hạng Silver (%)'],
        'tier_gold_spend' => ['5000000', 'Số tiền tích lũy tối thiểu hạng Gold (VND)'],
        'tier_gold_orders' => ['6', 'Số đơn hàng tối thiểu hạng Gold'],
        'tier_gold_cap' => ['15', 'Tỷ lệ thanh toán tối đa bằng điểm hạng Gold (%)'],
        'tier_diamond_spend' => ['10000000', 'Số tiền tích lũy tối thiểu hạng Diamond (VND)'],
        'tier_diamond_orders' => ['12', 'Số đơn hàng tối thiểu hạng Diamond'],
        'tier_diamond_cap' => ['20', 'Tỷ lệ thanh toán tối đa bằng điểm hạng Diamond (%)'],
        'otp_required_redemption' => ['1', 'Bắt buộc xác thực OTP khi đổi điểm lấy voucher/quà tặng (0 = Không, 1 = Có)'],
        'include_shipping' => ['0', 'Có tính phí ship khi tích lũy điểm không (0 = Không, 1 = Có)'],
        'include_points_payment' => ['0', 'Có tính phần thanh toán bằng điểm khi tích lũy điểm không (0 = Không, 1 = Có)']
    ];

    $stmtSettingsCheck = $db->prepare("SELECT COUNT(*) FROM loyalty_settings WHERE setting_key = :key");
    $stmtInsertSettings = $db->prepare("INSERT INTO loyalty_settings (setting_key, setting_value, description) VALUES (:key, :value, :desc)");

    foreach ($defaultSettings as $key => $info) {
        $stmtSettingsCheck->execute([':key' => $key]);
        if ((int)$stmtSettingsCheck->fetchColumn() === 0) {
            $stmtInsertSettings->execute([
                ':key' => $key,
                ':value' => $info[0],
                ':desc' => $info[1]
            ]);
        }
    }
    echo "Default loyalty_settings seeded.\n";

    // 4. loyalty_point_transactions Table
    $sqlLoyaltyPointTransactions = "
    CREATE TABLE IF NOT EXISTS loyalty_point_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        order_id INT NULL,
        source ENUM('website', 'zalo', 'facebook', 'store', 'shopee', 'tiktok', 'manual', 'campaign', 'reward') NOT NULL,
        type ENUM('earn', 'hold', 'release', 'redeem', 'expire', 'cancel', 'reverse', 'adjust') NOT NULL,
        status ENUM('holding', 'available', 'used', 'expired', 'cancelled') NOT NULL,
        points INT NOT NULL,
        eligible_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        balance_after INT NULL,
        expires_at DATETIME NULL,
        reference_type VARCHAR(50) NULL,
        reference_id INT NULL,
        reason TEXT NULL,
        created_by_admin_id INT NULL,
        metadata_json TEXT NULL,
        idempotency_key VARCHAR(100) UNIQUE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lpt_customer (customer_id),
        INDEX idx_lpt_order (order_id),
        INDEX idx_lpt_status (status),
        INDEX idx_lpt_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlLoyaltyPointTransactions);
    // Add is_phone_verified and phone_verified_at to customers table if not exists
    try {
        $checkCol = $db->query("SHOW COLUMNS FROM customers LIKE 'is_phone_verified'")->fetch();
        if (!$checkCol) {
            $db->exec("ALTER TABLE customers ADD COLUMN is_phone_verified TINYINT(1) DEFAULT 0 AFTER phone");
            echo "Added column is_phone_verified to customers table.\n";
        }
    } catch (\PDOException $e) {
        // Ignore
    }

    try {
        $checkCol = $db->query("SHOW COLUMNS FROM customers LIKE 'phone_verified_at'")->fetch();
        if (!$checkCol) {
            $db->exec("ALTER TABLE customers ADD COLUMN phone_verified_at DATETIME NULL AFTER is_phone_verified");
            echo "Added column phone_verified_at to customers table.\n";
        }
    } catch (\PDOException $e) {
        // Ignore
    }

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
