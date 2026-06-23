<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

class OrderShippingMethod {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    public function migrate() {
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS order_shipping_methods (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    method_key VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(120) NOT NULL,
                    description TEXT NULL,
                    fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                    is_active TINYINT(1) NOT NULL DEFAULT 1,
                    sort_order INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_order_shipping_methods_active (is_active, sort_order)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $count = (int)$this->db->query("SELECT COUNT(*) FROM order_shipping_methods")->fetchColumn();
            if ($count === 0) {
                $defaults = [
                    ['express', 'Giao hàng hỏa tốc', 'Nhận hàng trong 2 giờ. Chỉ áp dụng khu vực TP.HCM', 0, 1, 1],
                    ['sameday', 'Giao hàng trong ngày', 'Nhận hàng hôm nay. Chỉ áp dụng khu vực TP.HCM', 0, 1, 2],
                    ['fast', 'Giao hàng nhanh', 'Nhận hàng trong 2-5 ngày làm việc', 0, 1, 3],
                ];
                $stmt = $this->db->prepare("
                    INSERT INTO order_shipping_methods (method_key, name, description, fee, is_active, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                foreach ($defaults as $row) {
                    $stmt->execute($row);
                }
            }
        } catch (\PDOException $e) {
            // Defer the actual error to the API call that needs this table.
        }
    }

    public function listAll($activeOnly = false) {
        $sql = "SELECT * FROM order_shipping_methods";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $this->db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map([$this, 'formatRow'], $rows);
    }

    public function findByKey($methodKey, $activeOnly = false) {
        $sql = "SELECT * FROM order_shipping_methods WHERE method_key = :method_key";
        if ($activeOnly) {
            $sql .= " AND is_active = 1";
        }
        $sql .= " LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':method_key' => trim((string)$methodKey)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : null;
    }

    public function save(array $payload) {
        $id = isset($payload['id']) ? (int)$payload['id'] : 0;
        $methodKey = trim((string)($payload['methodKey'] ?? $payload['method_key'] ?? ''));
        $name = trim((string)($payload['name'] ?? ''));
        $description = trim((string)($payload['description'] ?? ''));
        $fee = isset($payload['fee']) ? (float)$payload['fee'] : 0.0;
        $sortOrder = isset($payload['sortOrder']) ? (int)$payload['sortOrder'] : (int)($payload['sort_order'] ?? 0);
        $isActive = isset($payload['isActive']) ? (int)(!!$payload['isActive']) : (int)($payload['is_active'] ?? 1);

        if ($methodKey === '' || !preg_match('/^[a-z0-9_\\-]{2,50}$/', $methodKey)) {
            throw new Exception('Mã phương thức không hợp lệ. Chỉ dùng chữ thường, số, gạch ngang hoặc gạch dưới.');
        }
        if ($name === '') {
            throw new Exception('Tên phương thức giao hàng là bắt buộc.');
        }
        if ($fee < 0) {
            throw new Exception('Phí giao hàng không được âm.');
        }

        if ($isActive === 0) {
            $this->assertCanDeactivate($id, $methodKey);
        }

        if ($id > 0) {
            $stmt = $this->db->prepare("
                UPDATE order_shipping_methods
                SET method_key = :method_key,
                    name = :name,
                    description = :description,
                    fee = :fee,
                    is_active = :is_active,
                    sort_order = :sort_order
                WHERE id = :id
            ");
            $stmt->execute([
                ':method_key' => $methodKey,
                ':name' => $name,
                ':description' => $description !== '' ? $description : null,
                ':fee' => $fee,
                ':is_active' => $isActive,
                ':sort_order' => $sortOrder,
                ':id' => $id,
            ]);
            return $this->findById($id);
        }

        $stmt = $this->db->prepare("
            INSERT INTO order_shipping_methods (method_key, name, description, fee, is_active, sort_order)
            VALUES (:method_key, :name, :description, :fee, :is_active, :sort_order)
        ");
        $stmt->execute([
            ':method_key' => $methodKey,
            ':name' => $name,
            ':description' => $description !== '' ? $description : null,
            ':fee' => $fee,
            ':is_active' => $isActive,
            ':sort_order' => $sortOrder,
        ]);

        return $this->findById((int)$this->db->lastInsertId());
    }

    public function setActive($id, $isActive) {
        $id = (int)$id;
        $isActive = (int)(!!$isActive);
        $current = $this->findById($id);
        if (!$current) {
            throw new Exception('Không tìm thấy phương thức giao hàng.');
        }
        if ($isActive === 0) {
            $this->assertCanDeactivate($id, $current['methodKey']);
        }

        $stmt = $this->db->prepare("UPDATE order_shipping_methods SET is_active = :is_active WHERE id = :id");
        $stmt->execute([':is_active' => $isActive, ':id' => $id]);
        return $this->findById($id);
    }

    public function delete($id) {
        $id = (int)$id;
        $current = $this->findById($id);
        if (!$current) {
            throw new Exception('Không tìm thấy phương thức giao hàng.');
        }

        $stmtOrders = $this->db->prepare("SELECT COUNT(*) FROM orders WHERE shipping_method = :method_key");
        $stmtOrders->execute([':method_key' => $current['methodKey']]);
        if ((int)$stmtOrders->fetchColumn() > 0) {
            throw new Exception('Phương thức này đã có đơn sử dụng. Hãy tắt thay vì xóa để giữ lịch sử đơn hàng.');
        }

        $stmt = $this->db->prepare("DELETE FROM order_shipping_methods WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM order_shipping_methods WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->formatRow($row) : null;
    }

    private function assertCanDeactivate($id, $methodKey) {
        $params = [];
        $sql = "SELECT COUNT(*) FROM order_shipping_methods WHERE is_active = 1";
        if ((int)$id > 0) {
            $sql .= " AND id <> :id";
            $params[':id'] = (int)$id;
        } else {
            $sql .= " AND method_key <> :method_key";
            $params[':method_key'] = trim((string)$methodKey);
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        if ((int)$stmt->fetchColumn() <= 0) {
            throw new Exception('Phải còn ít nhất một phương thức giao hàng đang bật để khách đặt hàng.');
        }
    }

    private function formatRow(array $row) {
        return [
            'id' => (int)$row['id'],
            'methodKey' => $row['method_key'],
            'method_key' => $row['method_key'],
            'name' => $row['name'],
            'description' => $row['description'],
            'fee' => (float)$row['fee'],
            'isActive' => (int)$row['is_active'] === 1,
            'is_active' => (int)$row['is_active'],
            'sortOrder' => (int)$row['sort_order'],
            'sort_order' => (int)$row['sort_order'],
            'createdAt' => $row['created_at'] ?? null,
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }
}
