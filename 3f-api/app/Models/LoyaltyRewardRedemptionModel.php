<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltyRewardRedemptionModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    public function listRedemptions($filters = []) {
        $sql = "
            SELECT r.*, w.name AS reward_name, w.reward_type
            FROM loyalty_reward_redemptions r
            JOIN loyalty_rewards w ON r.reward_id = w.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND r.status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['phone'])) {
            $sql .= " AND r.customer_phone = :phone";
            $params[':phone'] = $filters['phone'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (r.customer_phone LIKE :search OR r.customer_name LIKE :search OR w.name LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY r.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRedemptionById($id) {
        $stmt = $this->db->prepare("
            SELECT r.*, w.name AS reward_name, w.reward_type, w.stock_quantity
            FROM loyalty_reward_redemptions r
            JOIN loyalty_rewards w ON r.reward_id = w.id
            WHERE r.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createRedemption($data) {
        $sql = "
            INSERT INTO loyalty_reward_redemptions (
                customer_phone, customer_name, reward_id, points_spent, status, note
            ) VALUES (
                :customer_phone, :customer_name, :reward_id, :points_spent, :status, :note
            )
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':customer_phone' => $data['phone'] ?? $data['customer_phone'],
            ':customer_name' => $data['customerName'] ?? $data['customer_name'] ?? null,
            ':reward_id' => (int)$data['rewardId'] ?? (int)$data['reward_id'],
            ':points_spent' => (int)$data['pointsSpent'] ?? (int)$data['points_spent'],
            ':status' => $data['status'] ?? 'pending',
            ':note' => $data['note'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus($id, $status, $processedBy = null, $note = null) {
        $sql = "
            UPDATE loyalty_reward_redemptions 
            SET status = :status, 
                processed_by = :processed_by, 
                processed_at = NOW()
        ";
        $params = [
            ':id' => $id,
            ':status' => $status,
            ':processed_by' => $processedBy
        ];

        if ($note !== null) {
            $sql .= ", note = :note";
            $params[':note'] = $note;
        }

        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function countCustomerRedemptions($customerPhone, $rewardId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) AS total 
            FROM loyalty_reward_redemptions 
            WHERE customer_phone = :phone 
              AND reward_id = :reward_id 
              AND status != 'rejected' 
              AND status != 'cancelled'
        ");
        $stmt->execute([
            ':phone' => $customerPhone,
            ':reward_id' => $rewardId
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['total'] : 0;
    }

    private function checkAndMigrate() {
        try {
            $sql = "
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
            ";
            $this->db->exec($sql);
        } catch (\Exception $e) {
            error_log("LoyaltyRewardRedemption migration failed: " . $e->getMessage());
        }
    }
}
