<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltyPointRuleModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    /**
     * Finds active rule details by source.
     * Checks is_active, starts_at, ends_at.
     */
    public function getActiveRule($source) {
        $sql = "
            SELECT * FROM loyalty_point_rules 
            WHERE source = :source 
              AND is_active = 1
              AND (starts_at IS NULL OR starts_at <= NOW())
              AND (ends_at IS NULL OR ends_at >= NOW())
            ORDER BY id DESC 
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':source' => $source]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Lists all rules ordered by id desc.
     */
    public function listRules() {
        $stmt = $this->db->prepare("SELECT * FROM loyalty_point_rules ORDER BY id DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Deactivates all other active rules for a source.
     */
    public function deactivateOthersForSource($source, $excludeId = null) {
        $sql = "UPDATE loyalty_point_rules SET is_active = 0 WHERE source = :source AND is_active = 1";
        $params = [':source' => $source];
        if ($excludeId !== null) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Inserts new rule.
     */
    public function createRule($data) {
        $sql = "
            INSERT INTO loyalty_point_rules (
                name, 
                source, 
                money_per_point, 
                rounding_mode, 
                min_order_amount, 
                max_points_per_order, 
                multiplier, 
                is_active, 
                starts_at, 
                ends_at
            ) VALUES (
                :name, 
                :source, 
                :money_per_point, 
                :rounding_mode, 
                :min_order_amount, 
                :max_points_per_order, 
                :multiplier, 
                :is_active, 
                :starts_at, 
                :ends_at
            )
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'                 => $data['name'],
            ':source'               => $data['source'],
            ':money_per_point'      => (int)$data['money_per_point'],
            ':rounding_mode'        => isset($data['rounding_mode']) ? $data['rounding_mode'] : 'floor',
            ':min_order_amount'     => isset($data['min_order_amount']) ? (int)$data['min_order_amount'] : 0,
            ':max_points_per_order' => (isset($data['max_points_per_order']) && $data['max_points_per_order'] !== '' && $data['max_points_per_order'] !== null) ? (int)$data['max_points_per_order'] : null,
            ':multiplier'           => isset($data['multiplier']) ? (float)$data['multiplier'] : 1.00,
            ':is_active'            => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':starts_at'            => !empty($data['starts_at']) ? $data['starts_at'] : null,
            ':ends_at'              => !empty($data['ends_at']) ? $data['ends_at'] : null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Updates an existing rule.
     */
    public function updateRule($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        $allowedFields = [
            'name', 'source', 'money_per_point', 'rounding_mode', 
            'min_order_amount', 'max_points_per_order', 'multiplier', 
            'is_active', 'starts_at', 'ends_at'
        ];

        foreach ($data as $key => $val) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "`$key` = :$key";
                if ($key === 'money_per_point' || $key === 'min_order_amount' || $key === 'is_active') {
                    $params[":$key"] = (int)$val;
                } else if ($key === 'max_points_per_order') {
                    $params[":$key"] = ($val !== '' && $val !== null) ? (int)$val : null;
                } else if ($key === 'multiplier') {
                    $params[":$key"] = (float)$val;
                } else if ($key === 'starts_at' || $key === 'ends_at') {
                    $params[":$key"] = !empty($val) ? $val : null;
                } else {
                    $params[":$key"] = $val;
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE loyalty_point_rules SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Deactivates a rule.
     */
    public function deactivateRule($id) {
        $stmt = $this->db->prepare("UPDATE loyalty_point_rules SET is_active = 0 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Checks if table exists, auto-creates it, and seeds default rule if empty.
     */
    public function checkAndMigrate() {
        try {
            // 1. Create table if not exists
            $sqlCreateTable = "
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
            ";
            $this->db->exec($sqlCreateTable);

            // 2. Seed default rule if empty
            $stmtCount = $this->db->query("SELECT COUNT(*) AS total FROM loyalty_point_rules");
            $res = $stmtCount->fetch();
            if ($res && (int)$res['total'] === 0) {
                $sqlSeed = "
                    INSERT INTO loyalty_point_rules (
                        name, source, money_per_point, rounding_mode, 
                        min_order_amount, max_points_per_order, multiplier, is_active
                    ) VALUES (
                        'Shopee default rule', 'shopee', 10000, 'floor', 
                        0, NULL, 1.00, 1
                    )
                ";
                $this->db->exec($sqlSeed);
            }
        } catch (\Exception $e) {
            error_log("LoyaltyPointRule migration failed: " . $e->getMessage());
        }
    }
}
