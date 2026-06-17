<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltyRewardModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    public function listRewards($filters = []) {
        $sql = "SELECT * FROM loyalty_rewards WHERE 1=1";
        $params = [];

        if (isset($filters['status'])) {
            if ($filters['status'] === 'active') {
                $sql .= " AND is_active = 1";
            } elseif ($filters['status'] === 'inactive') {
                $sql .= " AND is_active = 0";
            }
        }

        if (!empty($filters['type'])) {
            $sql .= " AND reward_type = :reward_type";
            $params[':reward_type'] = $filters['type'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND name LIKE :search";
            $params[':search'] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRewardById($id) {
        $stmt = $this->db->prepare("SELECT * FROM loyalty_rewards WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function createReward($data) {
        $sql = "
            INSERT INTO loyalty_rewards (
                name, description, reward_type, image_url, points_required,
                reward_value, stock_quantity, stock, reserved_stock, sku, weight, dimensions, limit_per_customer, is_active,
                starts_at, ends_at
            ) VALUES (
                :name, :description, :reward_type, :image_url, :points_required,
                :reward_value, :stock_quantity, :stock, :reserved_stock, :sku, :weight, :dimensions, :limit_per_customer, :is_active,
                :starts_at, :ends_at
            )
        ";
        $stock = isset($data['stock']) && $data['stock'] !== '' ? (int)$data['stock'] : (isset($data['stockQuantity']) && $data['stockQuantity'] !== '' ? (int)$data['stockQuantity'] : (isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : null));
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':reward_type' => $data['rewardType'] ?? $data['reward_type'] ?? 'manual_reward',
            ':image_url' => $data['imageUrl'] ?? $data['image_url'] ?? null,
            ':points_required' => (int)$data['pointsRequired'] ?? (int)$data['points_required'],
            ':reward_value' => isset($data['rewardValue']) && $data['rewardValue'] !== '' ? (int)$data['rewardValue'] : (isset($data['reward_value']) ? (int)$data['reward_value'] : null),
            ':stock_quantity' => $stock,
            ':stock' => $stock,
            ':reserved_stock' => isset($data['reservedStock']) ? (int)$data['reservedStock'] : (isset($data['reserved_stock']) ? (int)$data['reserved_stock'] : 0),
            ':sku' => $data['sku'] ?? null,
            ':weight' => isset($data['weight']) && $data['weight'] !== '' ? (float)$data['weight'] : null,
            ':dimensions' => $data['dimensions'] ?? null,
            ':limit_per_customer' => isset($data['limitPerCustomer']) && $data['limitPerCustomer'] !== '' ? (int)$data['limitPerCustomer'] : (isset($data['limit_per_customer']) ? (int)$data['limit_per_customer'] : null),
            ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : (isset($data['is_active']) ? (int)$data['is_active'] : 1),
            ':starts_at' => !empty($data['startsAt']) ? $data['startsAt'] : (!empty($data['starts_at']) ? $data['starts_at'] : null),
            ':ends_at' => !empty($data['endsAt']) ? $data['endsAt'] : (!empty($data['ends_at']) ? $data['ends_at'] : null),
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateReward($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        $allowedFields = [
            'name', 'description', 'reward_type', 'image_url', 'points_required',
            'reward_value', 'stock_quantity', 'stock', 'reserved_stock', 'sku', 'weight', 'dimensions', 'limit_per_customer', 'is_active',
            'starts_at', 'ends_at'
        ];

        // Map camelCase to snake_case if present
        $mappedData = [];
        foreach ($data as $key => $val) {
            if ($key === 'rewardType') $mappedData['reward_type'] = $val;
            elseif ($key === 'imageUrl') $mappedData['image_url'] = $val;
            elseif ($key === 'pointsRequired') $mappedData['points_required'] = $val;
            elseif ($key === 'rewardValue') $mappedData['reward_value'] = $val;
            elseif ($key === 'stockQuantity') $mappedData['stock_quantity'] = $val;
            elseif ($key === 'stock') $mappedData['stock'] = $val;
            elseif ($key === 'reservedStock') $mappedData['reserved_stock'] = $val;
            elseif ($key === 'limitPerCustomer') $mappedData['limit_per_customer'] = $val;
            elseif ($key === 'isActive') $mappedData['is_active'] = $val;
            elseif ($key === 'startsAt') $mappedData['starts_at'] = $val;
            elseif ($key === 'endsAt') $mappedData['ends_at'] = $val;
            else $mappedData[$key] = $val;
        }

        foreach ($mappedData as $key => $val) {
            if (in_array($key, $allowedFields)) {
                $fields[] = "`$key` = :$key";
                if ($key === 'points_required' || $key === 'is_active') {
                    $params[":$key"] = (int)$val;
                } else if ($key === 'reward_value' || $key === 'stock_quantity' || $key === 'stock' || $key === 'reserved_stock' || $key === 'limit_per_customer') {
                    $params[":$key"] = ($val !== '' && $val !== null) ? (int)$val : null;
                } else if ($key === 'weight') {
                    $params[":$key"] = ($val !== '' && $val !== null) ? (float)$val : null;
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

        $sql = "UPDATE loyalty_rewards SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function deactivateReward($id) {
        $stmt = $this->db->prepare("UPDATE loyalty_rewards SET is_active = 0 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function decrementStock($rewardId) {
        $stmt = $this->db->prepare("
            UPDATE loyalty_rewards 
            SET stock = stock - 1,
                stock_quantity = CASE WHEN stock_quantity IS NULL THEN NULL ELSE stock_quantity - 1 END
            WHERE id = :id AND stock IS NOT NULL AND stock > 0
        ");
        return $stmt->execute([':id' => $rewardId]);
    }

    public function incrementStock($rewardId) {
        $stmt = $this->db->prepare("
            UPDATE loyalty_rewards 
            SET stock = stock + 1,
                stock_quantity = CASE WHEN stock_quantity IS NULL THEN NULL ELSE stock_quantity + 1 END
            WHERE id = :id AND stock IS NOT NULL
        ");
        return $stmt->execute([':id' => $rewardId]);
    }

    private function checkAndMigrate() {
        try {
            $sql = "
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
            ";
            $this->db->exec($sql);

            $stmtCount = $this->db->query("SELECT COUNT(*) AS total FROM loyalty_rewards");
            $res = $stmtCount->fetch();
            if ($res && (int)$res['total'] === 0) {
                $this->db->exec("
                    INSERT INTO loyalty_rewards (name, description, reward_type, points_required, reward_value, stock_quantity)
                    VALUES 
                    ('Voucher 50.000đ', 'Đổi 500 điểm lấy voucher giảm 50.000đ', 'voucher', 500, 50000, 100),
                    ('Combo súp thưởng PetQ', 'Combo súp thưởng dinh dưỡng cao cấp', 'physical_gift', 1000, NULL, 20),
                    ('Miễn phí vận chuyển', 'Miễn phí vận chuyển toàn quốc cho đơn hàng kế tiếp', 'free_shipping', 300, NULL, NULL)
                ");
            }
        } catch (\Exception $e) {
            error_log("LoyaltyReward migration failed: " . $e->getMessage());
        }
    }
}
