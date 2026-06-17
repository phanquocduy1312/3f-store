<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

class Order {
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
        $schemaPath = dirname(__DIR__, 2) . '/database/orders_schema.sql';
        if (!file_exists($schemaPath)) {
            return;
        }

        $sql = file_get_contents($schemaPath);
        $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sql)));
        foreach ($statements as $statement) {
            if ($statement !== '') {
                $this->db->exec($statement);
            }
        }
    }

    public function createOrder($orderData, $items) {
        $db = $this->db;
        $inTransaction = $db->inTransaction();
        if (!$inTransaction) {
            $db->beginTransaction();
        }
        try {
            // 1. Insert order record
            $sqlOrder = "
                INSERT INTO orders (
                    order_code, customer_id, receiver_name, phone, email, zalo,
                    province, district, ward, address_line, note,
                    payment_method, payment_status, order_status,
                    subtotal, shipping_fee, discount, total
                ) VALUES (
                    :order_code, :customer_id, :receiver_name, :phone, :email, :zalo,
                    :province, :district, :ward, :address_line, :note,
                    :payment_method, :payment_status, :order_status,
                    :subtotal, :shipping_fee, :discount, :total
                )
            ";
            $stmtOrder = $db->prepare($sqlOrder);
            $stmtOrder->execute([
                ':order_code' => $orderData['order_code'],
                ':customer_id' => $orderData['customer_id'] ? (int)$orderData['customer_id'] : null,
                ':receiver_name' => $orderData['receiver_name'],
                ':phone' => $orderData['phone'],
                ':email' => $orderData['email'] ?: null,
                ':zalo' => $orderData['zalo'] ?: null,
                ':province' => $orderData['province'],
                ':district' => $orderData['district'],
                ':ward' => $orderData['ward'],
                ':address_line' => $orderData['address_line'],
                ':note' => $orderData['note'] ?: null,
                ':payment_method' => $orderData['payment_method'],
                ':payment_status' => $orderData['payment_status'] ?: 'unpaid',
                ':order_status' => $orderData['order_status'] ?: 'pending',
                ':subtotal' => (float)$orderData['subtotal'],
                ':shipping_fee' => (float)($orderData['shipping_fee'] ?? 0.00),
                ':discount' => (float)($orderData['discount'] ?? 0.00),
                ':total' => (float)$orderData['total']
            ]);

            $orderId = (int)$db->lastInsertId();

            // 2. Insert items
            $itemModel = new OrderItem();
            foreach ($items as $item) {
                $itemModel->insertItem(
                    $orderId,
                    $item['product_id'],
                    $item['variant_id'] ?: null,
                    $item['sku'] ?: null,
                    $item['product_name'],
                    $item['variant_name'] ?: null,
                    $item['image_url'] ?: null,
                    $item['price'],
                    $item['quantity']
                );
            }

            // 3. Log initial status
            $this->logStatusChange($orderId, '', $orderData['order_status'] ?: 'pending', 'Đơn hàng khởi tạo thành công', 'system');

            if (!$inTransaction) {
                $db->commit();
            }
            return $orderId;
        } catch (Exception $e) {
            if (!$inTransaction) {
                $db->rollBack();
            }
            throw $e;
        }
    }

    public function getOrderDetails($orderCode) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE order_code = :order_code LIMIT 1");
        $stmt->execute([':order_code' => trim($orderCode)]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        $order['status_logs'] = $this->getStatusLogs((int)$order['id']);
        return $order;
    }

    public function getOrderDetailsById($orderId) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = :order_id LIMIT 1");
        $stmt->execute([':order_id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        $order['status_logs'] = $this->getStatusLogs((int)$order['id']);
        return $order;
    }

    public function getOrdersByPhone($phone) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE phone = :phone ORDER BY id DESC");
        $stmt->execute([':phone' => trim($phone)]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        }
        return $orders;
    }

    public function listOrders($filters = []) {
        $sql = "SELECT * FROM orders WHERE 1=1";
        $params = [];

        if (!empty($filters['q'])) {
            $sql .= " AND (order_code LIKE :q OR phone LIKE :q OR receiver_name LIKE :q)";
            $params[':q'] = '%' . trim($filters['q']) . '%';
        }

        if (!empty($filters['order_status'])) {
            $sql .= " AND order_status = :order_status";
            $params[':order_status'] = trim($filters['order_status']);
        }

        if (!empty($filters['payment_status'])) {
            $sql .= " AND payment_status = :payment_status";
            $params[':payment_status'] = trim($filters['payment_status']);
        }

        $sql .= " ORDER BY id DESC";

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        // Count total
        $countSql = "SELECT COUNT(*) AS total FROM (" . $sql . ") AS temp";
        $stmtCount = $this->db->prepare($countSql);
        $stmtCount->execute($params);
        $total = (int)($stmtCount->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        // Fetch paginated
        $sql .= " LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => (int)ceil($total / $limit)
            ]
        ];
    }

    public function updateOrderStatus($orderId, $newStatus, $note = null, $changedBy = null) {
        $stmt = $this->db->prepare("SELECT order_status, payment_status, order_code FROM orders WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found.");
        }

        $currentStatus = $order['order_status'];

        if ($currentStatus === $newStatus) {
            return true;
        }

        // Validate state transitions
        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['packing', 'cancelled'],
            'packing' => ['shipping', 'cancelled'],
            'shipping' => ['completed'],
            'completed' => [],
            'cancelled' => [],
            'refunded' => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [], true)) {
            throw new Exception("Trạng thái chuyển đổi từ {$currentStatus} sang {$newStatus} không hợp lệ.");
        }

        // Update the order_status field
        $stmtUpdate = $this->db->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
        $stmtUpdate->execute([
            ':status' => $newStatus,
            ':id' => (int)$orderId
        ]);

        // Log the change
        $this->logStatusChange($orderId, $currentStatus, $newStatus, $note, $changedBy);
        return true;
    }

    public function updatePaymentStatus($orderId, $newPaymentStatus, $note = null, $changedBy = null) {
        $stmt = $this->db->prepare("SELECT payment_status FROM orders WHERE id = :id");
        $stmt->execute([':id' => (int)$orderId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$current) {
            throw new Exception("Order not found.");
        }

        if ($current['payment_status'] === $newPaymentStatus) {
            return true;
        }

        $stmtUpdate = $this->db->prepare("UPDATE orders SET payment_status = :status WHERE id = :id");
        $stmtUpdate->execute([
            ':status' => $newPaymentStatus,
            ':id' => (int)$orderId
        ]);

        $this->logStatusChange($orderId, '', '', "Cập nhật thanh toán: {$newPaymentStatus}" . ($note ? " - {$note}" : ""), $changedBy);
        return true;
    }

    public function updateLoyaltyPointsEarned($orderId, $points) {
        $stmt = $this->db->prepare("UPDATE orders SET loyalty_points_earned = :points WHERE id = :id");
        return $stmt->execute([
            ':points' => (int)$points,
            ':id' => (int)$orderId
        ]);
    }

    public function logStatusChange($orderId, $fromStatus, $toStatus, $note = null, $changedBy = null) {
        $stmt = $this->db->prepare("
            INSERT INTO order_status_logs (order_id, from_status, to_status, note, changed_by)
            VALUES (:order_id, :from_status, :to_status, :note, :changed_by)
        ");
        return $stmt->execute([
            ':order_id' => (int)$orderId,
            ':from_status' => $fromStatus,
            ':to_status' => $toStatus,
            ':note' => $note,
            ':changed_by' => $changedBy ?: 'system'
        ]);
    }

    private function getStatusLogs($orderId) {
        $stmt = $this->db->prepare("SELECT * FROM order_status_logs WHERE order_id = :order_id ORDER BY id ASC");
        $stmt->execute([':order_id' => (int)$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
