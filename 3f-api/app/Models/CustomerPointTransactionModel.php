<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class CustomerPointTransactionModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    public function getBalance($phone) {
        // Check if there are any transactions for this customer
        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM customer_point_transactions WHERE customer_phone = :phone");
        $stmt->execute([':phone' => $phone]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && (int)$row['total'] === 0) {
            // No transactions exist. Check if they have legacy approved Shopee points.
            $stmtLegacy = $this->db->prepare("
                SELECT SUM(approved_points) AS total_points 
                FROM shopee_point_requests 
                WHERE phone = :phone AND processing_status = 'approved'
            ");
            $stmtLegacy->execute([':phone' => $phone]);
            $legacyRow = $stmtLegacy->fetch(PDO::FETCH_ASSOC);
            $legacyPoints = isset($legacyRow['total_points']) ? (int)$legacyRow['total_points'] : 0;

            if ($legacyPoints > 0) {
                // Automatically create a sync transaction
                $this->addTransaction(
                    $phone,
                    'earn_shopee_order',
                    $legacyPoints,
                    $legacyPoints,
                    null,
                    null,
                    'Đồng bộ điểm tích lũy lịch sử'
                );
                return $legacyPoints;
            }
            return 0;
        }

        // Sum up the points
        $stmtSum = $this->db->prepare("SELECT SUM(points) AS balance FROM customer_point_transactions WHERE customer_phone = :phone");
        $stmtSum->execute([':phone' => $phone]);
        $sumRow = $stmtSum->fetch(PDO::FETCH_ASSOC);
        return isset($sumRow['balance']) ? (int)$sumRow['balance'] : 0;
    }

    public function addTransaction($customerPhone, $type, $points, $balanceAfter = null, $referenceType = null, $referenceId = null, $note = null) {
        if ($balanceAfter === null) {
            // Calculate current balance first
            // Note: getBalance calls addTransaction if no transactions exist, so we avoid infinite recursion
            $stmtSum = $this->db->prepare("SELECT SUM(points) AS balance FROM customer_point_transactions WHERE customer_phone = :phone");
            $stmtSum->execute([':phone' => $customerPhone]);
            $sumRow = $stmtSum->fetch(PDO::FETCH_ASSOC);
            $currentBalance = isset($sumRow['balance']) ? (int)$sumRow['balance'] : 0;
            
            // If currentBalance is 0 and no rows exist, try check legacy points (except if we are already syncing)
            if ($currentBalance === 0 && $note !== 'Đồng bộ điểm tích lũy lịch sử') {
                $stmtCount = $this->db->prepare("SELECT COUNT(*) AS total FROM customer_point_transactions WHERE customer_phone = :phone");
                $stmtCount->execute([':phone' => $customerPhone]);
                $countRow = $stmtCount->fetch(PDO::FETCH_ASSOC);
                if ($countRow && (int)$countRow['total'] === 0) {
                    $stmtLegacy = $this->db->prepare("
                        SELECT SUM(approved_points) AS total_points 
                        FROM shopee_point_requests 
                        WHERE phone = :phone AND processing_status = 'approved'
                    ");
                    $stmtLegacy->execute([':phone' => $customerPhone]);
                    $legacyRow = $stmtLegacy->fetch(PDO::FETCH_ASSOC);
                    $currentBalance = isset($legacyRow['total_points']) ? (int)$legacyRow['total_points'] : 0;
                }
            }

            $balanceAfter = $currentBalance + $points;
        }

        $sql = "
            INSERT INTO customer_point_transactions (
                customer_phone, type, points, balance_after, 
                reference_type, reference_id, note
            ) VALUES (
                :customer_phone, :type, :points, :balance_after, 
                :reference_type, :reference_id, :note
            )
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':customer_phone' => $customerPhone,
            ':type' => $type,
            ':points' => (int)$points,
            ':balance_after' => (int)$balanceAfter,
            ':reference_type' => $referenceType,
            ':reference_id' => $referenceId ? (int)$referenceId : null,
            ':note' => $note
        ]);
        $newId = (int)$this->db->lastInsertId();

        // Sync to customer_loyalty_profiles
        try {
            (new LoyaltyProductionModel())->ensureCustomerProfile($customerPhone);
        } catch (\Exception $e) {
            // Ignore
        }

        return $newId;
    }

    public function addManualAdjustment($customerId, $phone, $points, $reason, $note, $adminId) {
        $balanceAfter = null;
        $currentBalance = $this->getBalance($phone);
        $balanceAfter = $currentBalance + $points;
        
        $sql = "
            INSERT INTO customer_point_transactions (
                customer_id, customer_phone, type, points, balance_after, 
                description, note, created_by_admin_id
            ) VALUES (
                :customer_id, :customer_phone, 'manual_adjustment', :points, :balance_after, 
                :description, :note, :admin_id
            )
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':customer_id' => $customerId,
            ':customer_phone' => $phone ?: '',
            ':points' => (int)$points,
            ':balance_after' => (int)$balanceAfter,
            ':description' => $reason,
            ':note' => $note,
            ':admin_id' => (int)$adminId
        ]);
        
        // Sync to customer_loyalty_profiles
        try {
            (new LoyaltyProductionModel())->ensureCustomerProfile($customerId);
        } catch (\Exception $e) {
            // Ignore
        }
        
        // Cập nhật lại membership tier dựa trên tổng điểm lịch sử nếu cộng điểm dương (fallback)
        if ($points > 0 && $phone) {
            $stmtSum = $this->db->prepare("SELECT SUM(points) AS total FROM customer_point_transactions WHERE customer_phone = :phone AND points > 0");
            $stmtSum->execute([':phone' => $phone]);
            $sumRow = $stmtSum->fetch(PDO::FETCH_ASSOC);
            $totalEarned = isset($sumRow['total']) ? (int)$sumRow['total'] : 0;
            
            // Tìm tier phù hợp
            try {
                $stmtTier = $this->db->prepare("SELECT id FROM loyalty_tiers WHERE is_active = 1 AND min_spend <= :points ORDER BY min_spend DESC LIMIT 1");
                $stmtTier->execute([':points' => $totalEarned]);
                $tierRow = $stmtTier->fetch(PDO::FETCH_ASSOC);
                if ($tierRow) {
                    $stmtUpdateCust = $this->db->prepare("UPDATE customers SET current_tier_id = :tier_id WHERE id = :id");
                    $stmtUpdateCust->execute([':tier_id' => $tierRow['id'], ':id' => $customerId]);
                }
            } catch (\Exception $e) {
                // Ignore if legacy tables or columns don't exist
            }
        }
        
        return [
            'success' => true,
            'transaction_id' => (int)$this->db->lastInsertId(),
            'old_points' => $currentBalance,
            'new_points' => $balanceAfter
        ];
    }

    public function listTransactions($filters = []) {
        $sql = "SELECT * FROM customer_point_transactions WHERE 1=1";
        $params = [];

        if (!empty($filters['phone'])) {
            $sql .= " AND customer_phone = :phone";
            $params[':phone'] = $filters['phone'];
        }

        if (!empty($filters['type'])) {
            $sql .= " AND type = :type";
            $params[':type'] = $filters['type'];
        }

        if (!empty($filters['dateFrom'])) {
            $sql .= " AND created_at >= :dateFrom";
            $params[':dateFrom'] = $filters['dateFrom'] . " 00:00:00";
        }

        if (!empty($filters['dateTo'])) {
            $sql .= " AND created_at <= :dateTo";
            $params[':dateTo'] = $filters['dateTo'] . " 23:59:59";
        }

        $sql .= " ORDER BY id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCustomerTransactions($customerPhone) {
        // Trigger balance sync check first so legacy points appear as a transaction
        $this->getBalance($customerPhone);

        $stmt = $this->db->prepare("SELECT * FROM customer_point_transactions WHERE customer_phone = :phone ORDER BY id DESC");
        $stmt->execute([':phone' => $customerPhone]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function checkAndMigrate() {
        try {
            $sql = "
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
            ";
            $this->db->exec($sql);
            
            // Self-healing: add customer_id and created_by_admin_id
            $checkCustomerCol = $this->db->query("SHOW COLUMNS FROM customer_point_transactions LIKE 'customer_id'")->fetch();
            if (!$checkCustomerCol) {
                $this->db->exec("ALTER TABLE customer_point_transactions ADD COLUMN customer_id INT NULL AFTER id");
                $this->db->exec("ALTER TABLE customer_point_transactions ADD INDEX idx_trans_customer_id (customer_id)");
            }
            $checkAdminCol = $this->db->query("SHOW COLUMNS FROM customer_point_transactions LIKE 'created_by_admin_id'")->fetch();
            if (!$checkAdminCol) {
                $this->db->exec("ALTER TABLE customer_point_transactions ADD COLUMN created_by_admin_id INT NULL");
            }
            $checkDescCol = $this->db->query("SHOW COLUMNS FROM customer_point_transactions LIKE 'description'")->fetch();
            if (!$checkDescCol) {
                $this->db->exec("ALTER TABLE customer_point_transactions ADD COLUMN description TEXT NULL");
            }
        } catch (\Exception $e) {
            error_log("CustomerPointTransaction migration failed: " . $e->getMessage());
        }
    }
}
