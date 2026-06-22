<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltyProductionModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    private function hasColumn($table, $column) {
        $cleanColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
        $stmt = $this->db->query("SHOW COLUMNS FROM `$table` LIKE '$cleanColumn'");
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function addColumnIfMissing($table, $column, $definition) {
        if (!$this->hasColumn($table, $column)) {
            $this->db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
        }
    }

    public function checkAndMigrate() {
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `membership_tiers` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `name` VARCHAR(100) NOT NULL,
                  `min_points` INT NOT NULL DEFAULT 0,
                  `multiplier` DECIMAL(6,2) NOT NULL DEFAULT 1.00,
                  `color` VARCHAR(30) NULL,
                  `benefits` TEXT NULL,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_tier_active_points` (`is_active`, `min_points`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $count = (int)$this->db->query("SELECT COUNT(*) AS total FROM membership_tiers")->fetch(PDO::FETCH_ASSOC)['total'];
            $platinumExists = (int)$this->db->query("SELECT COUNT(*) FROM membership_tiers WHERE name = 'Platinum'")->fetchColumn();
            if ($count === 0 || $platinumExists > 0) {
                $this->db->exec("DELETE FROM membership_tiers");
                $this->db->exec("
                    INSERT INTO membership_tiers (id, name, min_points, multiplier, color, benefits, is_active) VALUES
                    (1, 'Member', 0, 1.00, '#64748B', 'Tích điểm cơ bản', 1),
                    (2, 'Silver', 0, 1.00, '#94A3B8', 'Nhận 1.0x điểm, giới hạn sử dụng điểm 10%', 1),
                    (3, 'Gold', 0, 1.20, '#F59E0B', 'Nhận 1.2x điểm, giới hạn sử dụng điểm 15%', 1),
                    (4, 'Diamond', 0, 1.50, '#8B5CF6', 'Nhận 1.5x điểm, giới hạn sử dụng điểm 20%', 1)
                ");
            }

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `loyalty_campaigns` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `name` VARCHAR(255) NOT NULL,
                  `description` TEXT NULL,
                  `multiplier` DECIMAL(6,2) NOT NULL DEFAULT 1.00,
                  `start_at` DATETIME NULL,
                  `end_at` DATETIME NULL,
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_campaign_active_dates` (`is_active`, `start_at`, `end_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $campaignCount = (int)$this->db->query("SELECT COUNT(*) AS total FROM loyalty_campaigns")->fetch(PDO::FETCH_ASSOC)['total'];
            if ($campaignCount === 0) {
                $this->db->exec("
                    INSERT INTO loyalty_campaigns (name, description, multiplier, is_active) VALUES
                    ('Sinh nhat thang 12', 'x2 diem cho chien dich sinh nhat', 2.00, 0),
                    ('Black Friday', 'x3 diem trong thoi gian khuyen mai', 3.00, 0)
                ");
            }

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `voucher_pools` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `reward_id` INT NOT NULL,
                  `voucher_code` VARCHAR(120) NOT NULL,
                  `voucher_value` INT NULL,
                  `status` VARCHAR(30) NOT NULL DEFAULT 'available',
                  `assigned_customer_id` VARCHAR(64) NULL,
                  `assigned_redemption_id` INT NULL,
                  `assigned_at` DATETIME NULL,
                  `used_at` DATETIME NULL,
                  `expired_at` DATETIME NULL,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY `uniq_reward_voucher` (`reward_id`, `voucher_code`),
                  INDEX `idx_voucher_reward_status` (`reward_id`, `status`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `customer_loyalty_profiles` (
                  `customer_id` VARCHAR(64) PRIMARY KEY,
                  `customer_name` VARCHAR(255) NULL,
                  `phone` VARCHAR(30) NULL,
                  `birthday` DATE NULL,
                  `current_tier_id` INT NULL,
                  `total_earned_points` INT NOT NULL DEFAULT 0,
                  `total_spent_points` INT NOT NULL DEFAULT 0,
                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_profile_phone` (`phone`),
                  INDEX `idx_profile_tier` (`current_tier_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->db->exec("
                CREATE TABLE IF NOT EXISTS `birthday_bonus_logs` (
                  `id` INT AUTO_INCREMENT PRIMARY KEY,
                  `customer_id` VARCHAR(64) NOT NULL,
                  `year` INT NOT NULL,
                  `granted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY `uniq_birthday_customer_year` (`customer_id`, `year`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $this->addColumnIfMissing('loyalty_rewards', 'sku', "VARCHAR(100) NULL AFTER `image_url`");
            $this->addColumnIfMissing('loyalty_rewards', 'stock', "INT NULL AFTER `stock_quantity`");
            $this->addColumnIfMissing('loyalty_rewards', 'reserved_stock', "INT NOT NULL DEFAULT 0 AFTER `stock`");
            $this->addColumnIfMissing('loyalty_rewards', 'weight', "DECIMAL(10,2) NULL AFTER `reserved_stock`");
            $this->addColumnIfMissing('loyalty_rewards', 'dimensions', "VARCHAR(120) NULL AFTER `weight`");
            $this->db->exec("UPDATE loyalty_rewards SET stock = stock_quantity WHERE stock IS NULL AND stock_quantity IS NOT NULL");

            $this->addColumnIfMissing('loyalty_reward_redemptions', 'assigned_voucher_id', "INT NULL AFTER `reward_id`");
            $this->addColumnIfMissing('loyalty_reward_redemptions', 'voucher_code', "VARCHAR(120) NULL AFTER `assigned_voucher_id`");
            $this->addColumnIfMissing('loyalty_reward_redemptions', 'fulfilled_at', "DATETIME NULL AFTER `processed_at`");

            // Add is_points_enabled to products if not exists
            try {
                $checkCol = $this->db->query("SHOW COLUMNS FROM products LIKE 'is_points_enabled'")->fetch();
                if (!$checkCol) {
                    $this->db->exec("ALTER TABLE products ADD COLUMN is_points_enabled TINYINT(1) DEFAULT 1 AFTER is_active");
                }
            } catch (\Exception $e) {
                error_log("Failed to add is_points_enabled to products: " . $e->getMessage());
            }
        } catch (\Exception $e) {
            error_log("LoyaltyProduction migration failed: " . $e->getMessage());
        }
    }

    public function listVouchers($filters = []) {
        $sql = "SELECT v.*, r.name AS reward_name FROM voucher_pools v JOIN loyalty_rewards r ON v.reward_id = r.id WHERE 1=1";
        $params = [];
        if (!empty($filters['rewardId'])) {
            $sql .= " AND v.reward_id = :reward_id";
            $params[':reward_id'] = (int)$filters['rewardId'];
        }
        if (!empty($filters['status'])) {
            $sql .= " AND v.status = :status";
            $params[':status'] = $filters['status'];
        }
        $sql .= " ORDER BY v.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function importVouchers($rewardId, $codes, $voucherValue = null, $expiredAt = null) {
        $created = 0;
        $skipped = 0;
        $duplicates = [];
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO voucher_pools (reward_id, voucher_code, voucher_value, status, expired_at)
            VALUES (:reward_id, :voucher_code, :voucher_value, 'available', :expired_at)
        ");
        foreach ($codes as $code) {
            $code = trim($code);
            if ($code === '') continue;
            $stmt->execute([
                ':reward_id' => (int)$rewardId,
                ':voucher_code' => $code,
                ':voucher_value' => $voucherValue !== null && $voucherValue !== '' ? (int)$voucherValue : null,
                ':expired_at' => !empty($expiredAt) ? $expiredAt : null,
            ]);
            if ($stmt->rowCount() > 0) {
                $created++;
            } else {
                $skipped++;
                $duplicates[] = $code;
            }
        }
        return ['created' => $created, 'skipped' => $skipped, 'duplicates' => $duplicates];
    }

    public function getVoucherStats($rewardId) {
        $stmt = $this->db->prepare("
            SELECT
                COUNT(*) AS totalCodes,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS availableCodes,
                SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS assignedCodes,
                SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) AS usedCodes,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expiredCodes
            FROM voucher_pools
            WHERE reward_id = :reward_id
        ");
        $stmt->execute([':reward_id' => (int)$rewardId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        return [
            'totalCodes' => (int)($row['totalCodes'] ?? 0),
            'availableCodes' => (int)($row['availableCodes'] ?? 0),
            'assignedCodes' => (int)($row['assignedCodes'] ?? 0),
            'usedCodes' => (int)($row['usedCodes'] ?? 0),
            'expiredCodes' => (int)($row['expiredCodes'] ?? 0),
        ];
    }

    public function assignAvailableVoucher($rewardId, $customerId, $redemptionId) {
        $stmt = $this->db->prepare("
            SELECT * FROM voucher_pools
            WHERE reward_id = :reward_id AND status = 'available'
            ORDER BY id ASC
            LIMIT 1
            FOR UPDATE
        ");
        $stmt->execute([':reward_id' => (int)$rewardId]);
        $voucher = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$voucher) return null;

        $update = $this->db->prepare("
            UPDATE voucher_pools
            SET status = 'assigned',
                assigned_customer_id = :customer_id,
                assigned_redemption_id = :redemption_id,
                assigned_at = NOW()
            WHERE id = :id AND status = 'available'
        ");
        $update->execute([
            ':customer_id' => $customerId,
            ':redemption_id' => (int)$redemptionId,
            ':id' => (int)$voucher['id']
        ]);
        if ($update->rowCount() < 1) return null;

        $this->db->prepare("UPDATE loyalty_reward_redemptions SET assigned_voucher_id = :voucher_id, voucher_code = :code WHERE id = :id")
            ->execute([':voucher_id' => (int)$voucher['id'], ':code' => $voucher['voucher_code'], ':id' => (int)$redemptionId]);

        return $voucher;
    }

    public function releaseVoucherForRedemption($redemptionId) {
        $stmt = $this->db->prepare("
            UPDATE voucher_pools
            SET status = 'available', assigned_customer_id = NULL, assigned_redemption_id = NULL, assigned_at = NULL
            WHERE assigned_redemption_id = :redemption_id AND status = 'assigned'
        ");
        return $stmt->execute([':redemption_id' => (int)$redemptionId]);
    }

    public function listTiers() {
        return $this->db->query("SELECT * FROM membership_tiers ORDER BY min_points ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function upsertTier($data) {
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id > 0) {
            $stmt = $this->db->prepare("
                UPDATE membership_tiers
                SET name = :name, min_points = :min_points, multiplier = :multiplier,
                    color = :color, benefits = :benefits, is_active = :is_active
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':min_points' => (int)$data['minPoints'],
                ':multiplier' => (float)$data['multiplier'],
                ':color' => $data['color'] ?? null,
                ':benefits' => $data['benefits'] ?? null,
                ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1
            ]);
            return $id;
        }
        $stmt = $this->db->prepare("
            INSERT INTO membership_tiers (name, min_points, multiplier, color, benefits, is_active)
            VALUES (:name, :min_points, :multiplier, :color, :benefits, :is_active)
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':min_points' => (int)$data['minPoints'],
            ':multiplier' => (float)$data['multiplier'],
            ':color' => $data['color'] ?? null,
            ':benefits' => $data['benefits'] ?? null,
            ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function setTierActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE membership_tiers SET is_active = :is_active WHERE id = :id");
        return $stmt->execute([':id' => (int)$id, ':is_active' => (int)$isActive]);
    }

    public function getTierForPoints($points) {
        $stmt = $this->db->prepare("
            SELECT *, 
                   name AS tier_name, 
                   multiplier AS tier_multiplier, 
                   color AS tier_color, 
                   benefits AS tier_benefits, 
                   min_spend AS min_points 
            FROM loyalty_tiers
            WHERE is_active = 1 AND min_spend <= :points
            ORDER BY min_spend DESC
            LIMIT 1
        ");
        $stmt->execute([':points' => (int)$points]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function resolveCustomerId($idOrPhone) {
        if (empty($idOrPhone)) return $idOrPhone;
        
        $clean = preg_replace('/[^\d]/', '', (string)$idOrPhone);
        
        if (is_numeric($clean) && (int)$clean > 0 && strlen($clean) < 9) {
            $stmt = $this->db->prepare("SELECT id FROM customers WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$clean]);
            $val = $stmt->fetchColumn();
            if ($val) return $val;
        }
        
        // Try searching by phone/id
        $stmt = $this->db->prepare("SELECT id FROM customers WHERE phone = :phone OR phone = :clean OR id = :id LIMIT 1");
        $stmt->execute([':phone' => $idOrPhone, ':clean' => $clean, ':id' => $idOrPhone]);
        $val = $stmt->fetchColumn();
        if ($val) return $val;

        // Try searching by name/full_name
        $stmt = $this->db->prepare("SELECT id FROM customers WHERE name = :val OR full_name = :val LIMIT 1");
        $stmt->execute([':val' => $idOrPhone]);
        $val = $stmt->fetchColumn();
        return $val ?: $idOrPhone;
    }

    public function calculateCustomerTierName($customerId) {
        $customerId = $this->resolveCustomerId($customerId);
        $stmtPhone = $this->db->prepare("SELECT phone, is_phone_verified FROM customers WHERE id = :id LIMIT 1");
        $stmtPhone->execute([':id' => $customerId]);
        $customer = $stmtPhone->fetch(PDO::FETCH_ASSOC);
        if (!$customer) {
            return 'Member';
        }

        $phone = $customer['phone'];
        $isPhoneVerified = (int)($customer['is_phone_verified'] ?? 0);

        if ($isPhoneVerified !== 1) {
            return 'Member';
        }

        $stmtStats = $this->db->prepare("
            SELECT 
                COUNT(*) as order_count,
                COALESCE(SUM(subtotal - discount), 0) as total_spend
            FROM orders
            WHERE (customer_id = :cust_id OR phone = :phone)
              AND order_status = 'completed'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        ");
        $stmtStats->execute([':cust_id' => $customerId, ':phone' => $phone]);
        $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);
        $orderCount = (int)($stats['order_count'] ?? 0);
        $totalSpend = (float)($stats['total_spend'] ?? 0);

        // Fetch limits from loyalty_tiers
        try {
            $tiers = $this->db->query("SELECT key_name, min_spend, min_orders FROM loyalty_tiers")->fetchAll(PDO::FETCH_ASSOC);
            $tierMap = [];
            foreach ($tiers as $t) {
                $tierMap[$t['key_name']] = $t;
            }
        } catch (\Exception $e) {
            $tierMap = [];
        }

        $diamondSpend = isset($tierMap['diamond']) ? (float)$tierMap['diamond']['min_spend'] : 10000000;
        $diamondOrders = isset($tierMap['diamond']) ? (int)$tierMap['diamond']['min_orders'] : 12;
        
        $goldSpend = isset($tierMap['gold']) ? (float)$tierMap['gold']['min_spend'] : 5000000;
        $goldOrders = isset($tierMap['gold']) ? (int)$tierMap['gold']['min_orders'] : 6;
        
        $silverSpend = isset($tierMap['silver']) ? (float)$tierMap['silver']['min_spend'] : 2000000;
        $silverOrders = isset($tierMap['silver']) ? (int)$tierMap['silver']['min_orders'] : 3;

        if ($totalSpend >= $diamondSpend || $orderCount >= $diamondOrders) {
            return 'Diamond';
        } elseif ($totalSpend >= $goldSpend || $orderCount >= $goldOrders) {
            return 'Gold';
        } elseif ($totalSpend >= $silverSpend || $orderCount >= $silverOrders) {
            return 'Silver';
        }
        return 'Member';
    }

    public function ensureCustomerProfile($customerId, $name = null) {
        $resolvedId = $this->resolveCustomerId($customerId);
        
        // 1. Check if customer exists in main customers table
        $stmtCust = $this->db->prepare("SELECT phone, full_name, name FROM customers WHERE id = :id LIMIT 1");
        $stmtCust->execute([':id' => $resolvedId]);
        $custRow = $stmtCust->fetch();
        
        // 2. Check if they already have profile
        $stmtProf = $this->db->prepare("SELECT customer_id FROM customer_loyalty_profiles WHERE customer_id = :id LIMIT 1");
        $stmtProf->execute([':id' => $resolvedId]);
        $profRow = $stmtProf->fetch();

        // 3. Check if they have any points or shopee requests history
        $hasHistory = false;
        if (!$custRow && !$profRow) {
            $stmtTx = $this->db->prepare("SELECT COUNT(*) FROM customer_point_transactions WHERE customer_phone = :phone");
            $stmtTx->execute([':phone' => $customerId]);
            if ((int)$stmtTx->fetchColumn() > 0) {
                $hasHistory = true;
            } else {
                $stmtShopee = $this->db->prepare("SELECT COUNT(*) FROM shopee_point_requests WHERE phone = :phone");
                $stmtShopee->execute([':phone' => $customerId]);
                if ((int)$stmtShopee->fetchColumn() > 0) {
                    $hasHistory = true;
                }
            }
        }

        if (!$custRow && !$profRow && !$hasHistory) {
            throw new \Exception("Không tìm thấy thông tin khách hàng.");
        }

        $earned = $this->sumEarnedPoints($resolvedId);
        $spent = $this->sumSpentPoints($resolvedId);
        
        $tierName = $this->calculateCustomerTierName($resolvedId);
        $stmtTier = $this->db->prepare("SELECT * FROM loyalty_tiers WHERE name = :name AND is_active = 1 LIMIT 1");
        $stmtTier->execute([':name' => $tierName]);
        $tier = $stmtTier->fetch(PDO::FETCH_ASSOC);
        
        if (!$tier) {
            $stmtTier = $this->db->prepare("SELECT * FROM loyalty_tiers WHERE key_name = 'member' LIMIT 1");
            $stmtTier->execute();
            $tier = $stmtTier->fetch(PDO::FETCH_ASSOC);
        }

        // Get customer phone and name
        $phone = null;
        $customerName = $name;
        if ($custRow) {
            $phone = $custRow['phone'];
            if (empty($customerName)) {
                $customerName = $custRow['full_name'] ?: $custRow['name'] ?: null;
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO customer_loyalty_profiles
                (customer_id, customer_name, phone, current_tier_id, total_earned_points, total_spent_points)
            VALUES
                (:customer_id, :customer_name, :phone, :tier_id, :earned, :spent)
            ON DUPLICATE KEY UPDATE
                customer_name = COALESCE(VALUES(customer_name), customer_name),
                phone = COALESCE(VALUES(phone), phone),
                current_tier_id = VALUES(current_tier_id),
                total_earned_points = VALUES(total_earned_points),
                total_spent_points = VALUES(total_spent_points)
        ");
        $stmt->execute([
            ':customer_id' => $resolvedId,
            ':customer_name' => $customerName,
            ':phone' => $phone ?: $resolvedId,
            ':tier_id' => $tier ? (int)$tier['id'] : null,
            ':earned' => $earned,
            ':spent' => $spent
        ]);
        return $this->getCustomerTier($resolvedId);
    }

    public function getCustomerTier($customerId) {
        $customerId = $this->resolveCustomerId($customerId);
        $this->ensureBareProfile($customerId);
        $stmt = $this->db->prepare("
            SELECT p.customer_id, 
                   COALESCE(c.full_name, c.name, p.customer_name) AS customer_name,
                   COALESCE(c.phone, p.phone) AS phone,
                   p.birthday, p.current_tier_id, p.total_earned_points, p.total_spent_points,
                   (p.total_earned_points - p.total_spent_points) AS current_points,
                   t.name AS tier_name, t.multiplier AS tier_multiplier, t.color AS tier_color, t.benefits AS tier_benefits, 
                   t.min_spend AS min_points, t.min_spend, t.min_orders, t.redemption_cap_percent
            FROM customer_loyalty_profiles p
            LEFT JOIN customers c ON p.customer_id = c.id
            LEFT JOIN loyalty_tiers t ON p.current_tier_id = t.id
            WHERE p.customer_id = :customer_id
        ");
        $stmt->execute([':customer_id' => $customerId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    private function ensureBareProfile($customerId) {
        $stmt = $this->db->prepare("SELECT customer_id FROM customer_loyalty_profiles WHERE customer_id = :customer_id");
        $stmt->execute([':customer_id' => $customerId]);
        if (!$stmt->fetch()) {
            $this->ensureCustomerProfile($customerId);
        }
    }

    public function sumEarnedPoints($customerId) {
        // Try new table loyalty_point_transactions first
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(points), 0) AS total 
            FROM loyalty_point_transactions 
            WHERE customer_id = :id AND status = 'available' AND points > 0
        ");
        $stmt->execute([':id' => $customerId]);
        $val = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        if ($val > 0) return $val;

        // Fallback to legacy
        $stmt = $this->db->prepare("SELECT COALESCE(SUM(points), 0) AS total FROM customer_point_transactions WHERE customer_phone = :id AND points > 0");
        $stmt->execute([':id' => $customerId]);
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    public function sumSpentPoints($customerId) {
        // Try new table loyalty_point_transactions first
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(ABS(points)), 0) AS total 
            FROM loyalty_point_transactions 
            WHERE customer_id = :id AND status = 'used' AND points < 0
        ");
        $stmt->execute([':id' => $customerId]);
        $val = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        if ($val > 0) return $val;

        // Fallback to legacy
        $stmt = $this->db->prepare("SELECT COALESCE(SUM(ABS(points)), 0) AS total FROM customer_point_transactions WHERE customer_phone = :id AND points < 0");
        $stmt->execute([':id' => $customerId]);
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    public function listCampaigns() {
        return $this->db->query("SELECT * FROM loyalty_campaigns ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function upsertCampaign($data) {
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id > 0) {
            $stmt = $this->db->prepare("
                UPDATE loyalty_campaigns
                SET name = :name, description = :description, multiplier = :multiplier,
                    start_at = :start_at, end_at = :end_at, is_active = :is_active
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':multiplier' => (float)$data['multiplier'],
                ':start_at' => $data['startAt'] ?? null,
                ':end_at' => $data['endAt'] ?? null,
                ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1
            ]);
            return $id;
        }
        $stmt = $this->db->prepare("
            INSERT INTO loyalty_campaigns (name, description, multiplier, start_at, end_at, is_active)
            VALUES (:name, :description, :multiplier, :start_at, :end_at, :is_active)
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':multiplier' => (float)$data['multiplier'],
            ':start_at' => $data['startAt'] ?? null,
            ':end_at' => $data['endAt'] ?? null,
            ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function setCampaignActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE loyalty_campaigns SET is_active = :is_active WHERE id = :id");
        return $stmt->execute([':id' => (int)$id, ':is_active' => (int)$isActive]);
    }

    public function getActiveCampaignMultiplier() {
        $stmt = $this->db->query("
            SELECT COALESCE(MAX(multiplier), 1.00) AS multiplier
            FROM loyalty_campaigns
            WHERE is_active = 1
              AND (start_at IS NULL OR start_at <= NOW())
              AND (end_at IS NULL OR end_at >= NOW())
        ");
        return (float)$stmt->fetch(PDO::FETCH_ASSOC)['multiplier'];
    }

    public function getBirthdayMultiplier($customerId, $grant = false) {
        $profile = $this->getCustomerTier($customerId);
        if (empty($profile['birthday'])) return 1.0;
        $month = (int)date('m', strtotime($profile['birthday']));
        if ($month !== (int)date('m')) return 1.0;
        $year = (int)date('Y');
        $stmt = $this->db->prepare("SELECT id FROM birthday_bonus_logs WHERE customer_id = :customer_id AND year = :year");
        $stmt->execute([':customer_id' => $customerId, ':year' => $year]);
        if ($stmt->fetch()) return 1.0;
        if ($grant) {
            $insert = $this->db->prepare("INSERT IGNORE INTO birthday_bonus_logs (customer_id, year) VALUES (:customer_id, :year)");
            $insert->execute([':customer_id' => $customerId, ':year' => $year]);
        }
        return 2.0;
    }

    public function getCustomerProfile($customerId) {
        $tier = $this->ensureCustomerProfile($customerId);
        $tx = $this->db->prepare("SELECT * FROM customer_point_transactions WHERE customer_phone = :id ORDER BY id DESC LIMIT 100");
        $tx->execute([':id' => $customerId]);
        $red = $this->db->prepare("
            SELECT r.*, w.name AS reward_name, w.reward_type
            FROM loyalty_reward_redemptions r
            JOIN loyalty_rewards w ON r.reward_id = w.id
            WHERE r.customer_phone = :id
            ORDER BY r.id DESC
        ");
        $red->execute([':id' => $customerId]);
        $orders = $this->db->prepare("SELECT * FROM shopee_point_requests WHERE phone = :id AND processing_status = 'approved' ORDER BY id DESC");
        $orders->execute([':id' => $customerId]);
        $growth = $this->db->prepare("
            SELECT DATE(created_at) AS date, SUM(points) AS points
            FROM customer_point_transactions
            WHERE customer_phone = :id
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $growth->execute([':id' => $customerId]);
        return [
            'profile' => $tier,
            'availablePoints' => (new CustomerPointTransactionModel())->getBalance($customerId),
            'totalEarnedPoints' => $this->sumEarnedPoints($customerId),
            'totalSpentPoints' => $this->sumSpentPoints($customerId),
            'transactions' => $tx->fetchAll(PDO::FETCH_ASSOC),
            'redemptions' => $red->fetchAll(PDO::FETCH_ASSOC),
            'shopeeOrders' => $orders->fetchAll(PDO::FETCH_ASSOC),
            'growth' => $growth->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function getAnalytics() {
        $issued = (int)$this->db->query("SELECT COALESCE(SUM(points),0) AS total FROM customer_point_transactions WHERE points > 0")->fetch(PDO::FETCH_ASSOC)['total'];
        $used = (int)$this->db->query("SELECT COALESCE(SUM(ABS(points)),0) AS total FROM customer_point_transactions WHERE points < 0")->fetch(PDO::FETCH_ASSOC)['total'];
        $redemptions = (int)$this->db->query("SELECT COUNT(*) AS total FROM loyalty_reward_redemptions")->fetch(PDO::FETCH_ASSOC)['total'];
        $customers = (int)$this->db->query("SELECT COUNT(DISTINCT customer_phone) AS total FROM customer_point_transactions")->fetch(PDO::FETCH_ASSOC)['total'];
        $repeat = (int)$this->db->query("SELECT COUNT(*) AS total FROM (SELECT customer_phone FROM customer_point_transactions GROUP BY customer_phone HAVING COUNT(*) > 1) x")->fetch(PDO::FETCH_ASSOC)['total'];

        $topCustomers = $this->db->query("
            SELECT customer_phone, SUM(points) AS points
            FROM customer_point_transactions
            GROUP BY customer_phone
            ORDER BY points DESC
            LIMIT 10
        ")->fetchAll(PDO::FETCH_ASSOC);

        $topRewards = $this->db->query("
            SELECT w.name, COUNT(*) AS total
            FROM loyalty_reward_redemptions r
            JOIN loyalty_rewards w ON r.reward_id = w.id
            GROUP BY w.id, w.name
            ORDER BY total DESC
            LIMIT 10
        ")->fetchAll(PDO::FETCH_ASSOC);

        $topVouchers = $this->db->query("
            SELECT voucher_code, reward_id, COUNT(*) AS total
            FROM voucher_pools
            WHERE status IN ('assigned','used')
            GROUP BY voucher_code, reward_id
            ORDER BY total DESC
            LIMIT 10
        ")->fetchAll(PDO::FETCH_ASSOC);

        $timeline = $this->db->query("
            SELECT DATE(created_at) AS date,
                   SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS issued,
                   SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) AS used
            FROM customer_point_transactions
            GROUP BY DATE(created_at)
            ORDER BY date ASC
            LIMIT 120
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'totalIssuedPoints' => $issued,
            'totalUsedPoints' => $used,
            'topCustomers' => $topCustomers,
            'topRewards' => $topRewards,
            'topVouchers' => $topVouchers,
            'redemptionRate' => $issued > 0 ? round(($used / $issued) * 100, 2) : 0,
            'returnRate' => $customers > 0 ? round(($repeat / $customers) * 100, 2) : 0,
            'totalRedemptions' => $redemptions,
            'timeline' => $timeline
        ];
    }
}
