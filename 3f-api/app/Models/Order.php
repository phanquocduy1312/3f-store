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
                try {
                    $this->db->exec($statement);
                } catch (\PDOException $e) {
                    // Ignore duplicate table errors
                }
            }
        }

        // Helper function to check and add column
        $addColumn = function($table, $column, $definition) {
            try {
                $check = $this->db->query("SHOW COLUMNS FROM `$table` LIKE '$column'")->fetch();
                if (!$check) {
                    $this->db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
                }
            } catch (\PDOException $e) {
                // Ignore
            }
        };

        // Helper function to check and modify column
        $modifyColumn = function($table, $column, $definition) {
            try {
                $this->db->exec("ALTER TABLE `$table` MODIFY COLUMN `$column` $definition");
            } catch (\PDOException $e) {
                // Ignore
            }
        };

        // Alter orders table
        $modifyColumn('orders', 'order_status', "VARCHAR(100) NOT NULL DEFAULT 'pending_confirmation'");
        $modifyColumn('orders', 'payment_status', "VARCHAR(100) NOT NULL DEFAULT 'unpaid'");
        
        $addColumn('orders', 'coupon_code', "VARCHAR(100) NULL AFTER discount");
        $addColumn('orders', 'shipping_method', "VARCHAR(50) NOT NULL DEFAULT 'express' AFTER payment_method");
        $addColumn('orders', 'shipping_status', "VARCHAR(100) NOT NULL DEFAULT 'no_shipment' AFTER order_status");
        $addColumn('orders', 'loyalty_status', "VARCHAR(100) NOT NULL DEFAULT 'not_earned' AFTER shipping_status");
        $addColumn('orders', 'order_source', "VARCHAR(50) NULL AFTER loyalty_status");
        $addColumn('orders', 'assigned_staff_id', "INT NULL AFTER order_source");
        $addColumn('orders', 'internal_note', "TEXT NULL AFTER assigned_staff_id");
        $addColumn('orders', 'customer_note', "TEXT NULL AFTER internal_note");
        $addColumn('orders', 'cancelled_reason', "VARCHAR(255) NULL AFTER customer_note");
        $addColumn('orders', 'returned_reason', "VARCHAR(255) NULL AFTER cancelled_reason");
        $addColumn('orders', 'completed_at', "TIMESTAMP NULL AFTER loyalty_points_earned");
        $addColumn('orders', 'cancelled_at', "TIMESTAMP NULL AFTER completed_at");

        // Alter order_status_logs table
        $addColumn('order_status_logs', 'group_key', "VARCHAR(50) NOT NULL DEFAULT 'order' AFTER order_id");
        $modifyColumn('order_status_logs', 'from_status', "VARCHAR(100) NOT NULL");
        $modifyColumn('order_status_logs', 'to_status', "VARCHAR(100) NOT NULL");
        $addColumn('order_status_logs', 'changed_by_admin_id', "INT NULL AFTER changed_by");
        $addColumn('order_status_logs', 'changed_by_customer_id', "INT NULL AFTER changed_by_admin_id");
        $addColumn('order_status_logs', 'metadata', "JSON NULL AFTER changed_by_customer_id");

        // Seed workflow_statuses
        try {
            $count = (int)$this->db->query("SELECT COUNT(*) AS total FROM workflow_statuses")->fetch(PDO::FETCH_ASSOC)['total'];
            if ($count === 0) {
                $statuses = [
                    // main order
                    ['order', 'pending_confirmation', 'Chờ xác nhận', 'Chờ xác nhận thông tin đơn hàng', '#f59e0b', 1, 1, 0, 0],
                    ['order', 'confirmed', 'Đã xác nhận', 'Đơn hàng đã được xác nhận', '#3b82f6', 2, 0, 0, 0],
                    ['order', 'pending_payment', 'Chờ thanh toán', 'Chờ thanh toán từ khách hàng', '#eab308', 3, 0, 0, 0],
                    ['order', 'paid_or_cod', 'Đã thanh toán / COD', 'Đã xác nhận thanh toán hoặc COD', '#10b981', 4, 0, 0, 0],
                    ['order', 'preparing', 'Đang chuẩn bị hàng', 'Đang đóng gói và chuẩn bị sản phẩm', '#6366f1', 5, 0, 0, 0],
                    ['order', 'awaiting_pickup_or_booking', 'Chờ lấy hàng / đặt ship', 'Chờ shipper lấy hàng hoặc đặt ship', '#8b5cf6', 6, 0, 0, 0],
                    ['order', 'shipping', 'Đang giao', 'Đơn hàng đang trên đường giao', '#a855f7', 7, 0, 0, 0],
                    ['order', 'delivered', 'Giao thành công', 'Đơn hàng đã giao tới người nhận', '#22c55e', 8, 0, 0, 0],
                    ['order', 'completed', 'Hoàn tất', 'Đơn hàng đã hoàn tất', '#15803d', 9, 0, 0, 1],
                    ['order', 'return_requested', 'Yêu cầu đổi / trả', 'Khách hàng yêu cầu đổi hoặc trả hàng', '#ef4444', 10, 0, 0, 0],
                    ['order', 'return_completed', 'Đã đổi trả xong', 'Hoàn tất quá trình đổi trả hàng', '#b91c1c', 11, 0, 0, 1],
                    ['order', 'cancelled', 'Đã hủy', 'Đơn hàng đã bị hủy', '#6b7280', 12, 0, 0, 1],
                    // payment
                    ['payment', 'unpaid', 'Chưa thanh toán', 'Chưa thực hiện thanh toán', '#f59e0b', 1, 1, 1, 0],
                    ['payment', 'paid', 'Đã thanh toán', 'Thanh toán hoàn tất', '#22c55e', 2, 0, 0, 1],
                    ['payment', 'cod', 'COD', 'Thanh toán khi nhận hàng', '#3b82f6', 3, 0, 0, 0],
                    ['payment', 'refunded', 'Hoàn tiền', 'Đã hoàn tiền cho khách hàng', '#6b7280', 4, 0, 0, 1],
                    ['payment', 'payment_failed', 'Thanh toán lỗi', 'Giao dịch thanh toán thất bại', '#ef4444', 5, 0, 0, 0],
                    // shipping
                    ['shipping', 'no_shipment', 'Chưa tạo vận đơn', 'Chưa tạo thông tin vận chuyển', '#f59e0b', 1, 1, 1, 0],
                    ['shipping', 'shipment_created', 'Đã tạo vận đơn', 'Vận đơn đã được khởi tạo', '#3b82f6', 2, 0, 0, 0],
                    ['shipping', 'picking_up', 'Đang lấy hàng', 'Shipper đang lấy hàng từ kho', '#6366f1', 3, 0, 0, 0],
                    ['shipping', 'shipping', 'Đang giao', 'Đang trên đường vận chuyển', '#a855f7', 4, 0, 0, 0],
                    ['shipping', 'delivered', 'Giao thành công', 'Giao hàng thành công', '#22c55e', 5, 0, 0, 1],
                    ['shipping', 'delivery_failed', 'Giao thất bại', 'Giao hàng không thành công', '#ef4444', 6, 0, 0, 0],
                    ['shipping', 'returned', 'Hoàn hàng', 'Đã hoàn trả hàng về kho', '#6b7280', 7, 0, 0, 1],
                    // loyalty
                    ['loyalty', 'not_earned', 'Chưa tích điểm', 'Chưa cộng điểm cho đơn hàng', '#f59e0b', 1, 1, 1, 0],
                    ['loyalty', 'pending_review', 'Chờ duyệt', 'Đang chờ quản trị viên duyệt điểm', '#3b82f6', 2, 0, 0, 0],
                    ['loyalty', 'holding', 'Điểm tạm giữ', 'Điểm đang được giữ trong thời gian đổi trả', '#eab308', 3, 0, 0, 0],
                    ['loyalty', 'credited', 'Đã cộng điểm', 'Điểm đã được cộng vào tài khoản', '#22c55e', 4, 0, 0, 1],
                    ['loyalty', 'redeemed', 'Đã dùng điểm', 'Điểm đã được sử dụng', '#a855f7', 5, 0, 0, 0],
                    ['loyalty', 'cancelled', 'Hủy điểm', 'Đã hủy điểm tích lũy', '#6b7280', 6, 0, 0, 1]
                ];
                $stmt = $this->db->prepare("INSERT INTO workflow_statuses (group_key, status_key, label, description, color, sort_order, is_active, is_default, is_terminal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($statuses as $status) {
                    $stmt->execute($status);
                }
            }
        } catch (\PDOException $e) {
            // Ignore
        }

        // Seed workflow_transitions
        try {
            $countTrans = (int)$this->db->query("SELECT COUNT(*) AS total FROM workflow_transitions")->fetch(PDO::FETCH_ASSOC)['total'];
            if ($countTrans === 0) {
                $transitions = [
                    // order transitions
                    ['order', 'pending_confirmation', 'confirmed', 'Xác nhận đơn hàng', 0, null, 1, 1],
                    ['order', 'pending_confirmation', 'cancelled', 'Hủy đơn hàng', 1, null, 1, 2],
                    ['order', 'confirmed', 'preparing', 'Chuẩn bị hàng', 0, null, 1, 1],
                    ['order', 'confirmed', 'cancelled', 'Hủy đơn hàng', 1, null, 1, 2],
                    ['order', 'pending_payment', 'paid_or_cod', 'Thanh toán đơn hàng', 0, null, 1, 1],
                    ['order', 'pending_payment', 'cancelled', 'Hủy đơn hàng', 1, null, 1, 2],
                    ['order', 'paid_or_cod', 'preparing', 'Chuẩn bị hàng', 0, null, 1, 1],
                    ['order', 'preparing', 'awaiting_pickup_or_booking', 'Chờ lấy / đặt ship', 0, null, 1, 1],
                    ['order', 'preparing', 'cancelled', 'Hủy đơn hàng', 1, null, 1, 2],
                    ['order', 'awaiting_pickup_or_booking', 'shipping', 'Bắt đầu giao hàng', 0, null, 1, 1],
                    ['order', 'shipping', 'delivered', 'Giao hàng thành công', 0, null, 1, 1],
                    ['order', 'shipping', 'cancelled', 'Hủy đơn hàng', 1, null, 1, 2],
                    ['order', 'delivered', 'completed', 'Hoàn tất đơn hàng', 0, null, 1, 1],
                    ['order', 'completed', 'return_requested', 'Yêu cầu đổi / trả', 1, null, 1, 1],
                    ['order', 'return_requested', 'return_completed', 'Hoàn tất đổi trả', 0, null, 1, 1],
                    
                    // payment transitions
                    ['payment', 'unpaid', 'paid', 'Thanh toán trực tiếp', 0, null, 1, 1],
                    ['payment', 'unpaid', 'cod', 'COD thanh toán sau', 0, null, 1, 2],
                    ['payment', 'unpaid', 'payment_failed', 'Lỗi giao dịch', 0, null, 1, 3],
                    ['payment', 'cod', 'paid', 'Xác nhận thu COD', 0, null, 1, 1],
                    ['payment', 'payment_failed', 'paid', 'Thanh toán lại thành công', 0, null, 1, 1],
                    ['payment', 'payment_failed', 'unpaid', 'Đóng cổng thanh toán cũ', 0, null, 1, 2],
                    ['payment', 'paid', 'refunded', 'Hoàn tiền giao dịch', 1, null, 1, 1],
                    
                    // shipping transitions
                    ['shipping', 'no_shipment', 'shipment_created', 'Tạo vận đơn ship', 0, null, 1, 1],
                    ['shipping', 'shipment_created', 'picking_up', 'Shipper đang lấy', 0, null, 1, 1],
                    ['shipping', 'shipment_created', 'no_shipment', 'Hủy vận đơn ship', 0, null, 1, 2],
                    ['shipping', 'picking_up', 'shipping', 'Bắt đầu giao', 0, null, 1, 1],
                    ['shipping', 'picking_up', 'delivery_failed', 'Shipper không lấy được hàng', 1, null, 1, 2],
                    ['shipping', 'shipping', 'delivered', 'Giao thành công', 0, null, 1, 1],
                    ['shipping', 'shipping', 'delivery_failed', 'Giao hàng thất bại', 1, null, 1, 2],
                    ['shipping', 'delivery_failed', 'shipping', 'Giao lại', 0, null, 1, 1],
                    ['shipping', 'delivery_failed', 'returned', 'Chuyển hoàn kho', 0, null, 1, 2],
                    ['shipping', 'delivered', 'returned', 'Thu hồi/Trả hàng', 1, null, 1, 1],
                    
                    // loyalty transitions
                    ['loyalty', 'not_earned', 'holding', 'Tạm giữ điểm tích lũy', 0, null, 1, 1],
                    ['loyalty', 'not_earned', 'pending_review', 'Đưa vào hàng đợi duyệt điểm', 0, null, 1, 2],
                    ['loyalty', 'not_earned', 'credited', 'Cộng điểm nóng', 0, null, 1, 3],
                    ['loyalty', 'holding', 'credited', 'Xác nhận cộng điểm', 0, null, 1, 1],
                    ['loyalty', 'holding', 'cancelled', 'Hủy điểm tích lũy tạm giữ', 1, null, 1, 2],
                    ['loyalty', 'pending_review', 'credited', 'Xác nhận duyệt cộng điểm', 0, null, 1, 1],
                    ['loyalty', 'pending_review', 'cancelled', 'Từ chối duyệt điểm', 1, null, 1, 2],
                    ['loyalty', 'credited', 'cancelled', 'Hủy / Hoàn tác điểm tích lũy', 1, null, 1, 1],
                ];
                $stmt = $this->db->prepare("INSERT INTO workflow_transitions (group_key, from_status, to_status, label, requires_reason, requires_permission, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($transitions as $trans) {
                    $stmt->execute($trans);
                }
            }
        } catch (\PDOException $e) {
            // Ignore
        }

        // Seed shipping_providers
        try {
            $countShip = (int)$this->db->query("SELECT COUNT(*) AS total FROM shipping_providers")->fetch(PDO::FETCH_ASSOC)['total'];
            if ($countShip === 0) {
                $providers = [
                    ['shipper_noi_bo', 'Shipper nội bộ', 'internal', null, 1, 1],
                    ['grab', 'Grab', 'third_party', null, 1, 2],
                    ['be', 'Be', 'third_party', null, 1, 3],
                    ['ahamove', 'Ahamove', 'third_party', null, 1, 4],
                    ['lalamove', 'Lalamove', 'third_party', null, 1, 5],
                    ['ghn', 'Giao Hàng Nhanh', 'third_party', null, 1, 6],
                    ['ghtk', 'Giao Hàng Tiết Kiệm', 'third_party', null, 1, 7],
                    ['viettelpost', 'Viettel Post', 'third_party', null, 1, 8],
                    ['jnt', 'J&T Express', 'third_party', null, 1, 9]
                ];
                $stmt = $this->db->prepare("INSERT INTO shipping_providers (provider_key, label, type, config_json, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($providers as $prov) {
                    $stmt->execute($prov);
                }
            }
        } catch (\PDOException $e) {
            // Ignore
        }

        // Seed notification_channels
        try {
            $countNotif = (int)$this->db->query("SELECT COUNT(*) AS total FROM notification_channels")->fetch(PDO::FETCH_ASSOC)['total'];
            if ($countNotif === 0) {
                $channels = [
                    ['email', 'Email', 'Sendgrid/SMTP', null, 1],
                    ['sms', 'SMS', 'Twilio/Viettel', null, 0],
                    ['zalo', 'Zalo ZNS', 'Zalo Business API', null, 0],
                    ['internal', 'Hệ thống thông báo', 'System Dashboard', null, 1]
                ];
                $stmt = $this->db->prepare("INSERT INTO notification_channels (channel_key, label, provider, config_json, is_active) VALUES (?, ?, ?, ?, ?)");
                foreach ($channels as $chan) {
                    $stmt->execute($chan);
                }
            }
        } catch (\PDOException $e) {
            // Ignore
        }

        // Data Migration: Map old orders safely
        try {
            $stmtOld = $this->db->query("SELECT id, order_status FROM orders WHERE order_status IN ('pending', 'packing')");
            $oldOrders = $stmtOld->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($oldOrders)) {
                $stmtUpdate = $this->db->prepare("UPDATE orders SET order_status = :new_status WHERE id = :id");
                foreach ($oldOrders as $order) {
                    $newStatus = 'pending_confirmation';
                    if ($order['order_status'] === 'packing') {
                        $newStatus = 'preparing';
                    }
                    $stmtUpdate->execute([':new_status' => $newStatus, ':id' => $order['id']]);
                }
            }
        } catch (\PDOException $e) {
            // Log warning to PHP error log
            error_log("Old status mapping migration warning: " . $e->getMessage());
        }

        // Seed demo coupons
        try {
            $stmt = $this->db->prepare("SELECT id FROM coupons WHERE code = 'GIAM50K'");
            $stmt->execute();
            if (!$stmt->fetch()) {
                $this->db->exec("INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, is_active) VALUES ('GIAM50K', 'Giảm 50K', 'Giảm 50.000đ cho đơn từ 399.000đ', 'fixed', 50000.00, 399000.00, 1)");
            }
        } catch (\PDOException $e) {
            // Ignore database errors
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
                    payment_method, shipping_method, payment_status, order_status,
                    shipping_status, loyalty_status, order_source,
                    subtotal, shipping_fee, discount, coupon_code, total
                ) VALUES (
                    :order_code, :customer_id, :receiver_name, :phone, :email, :zalo,
                    :province, :district, :ward, :address_line, :note,
                    :payment_method, :shipping_method, :payment_status, :order_status,
                    :shipping_status, :loyalty_status, :order_source,
                    :subtotal, :shipping_fee, :discount, :coupon_code, :total
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
                ':shipping_method' => $orderData['shipping_method'] ?? 'express',
                ':payment_status' => $orderData['payment_status'] ?: 'unpaid',
                ':order_status' => $orderData['order_status'] ?: 'pending_confirmation',
                ':shipping_status' => 'no_shipment',
                ':loyalty_status' => 'not_earned',
                ':order_source' => $orderData['order_source'] ?? 'website',
                ':subtotal' => (float)$orderData['subtotal'],
                ':shipping_fee' => (float)($orderData['shipping_fee'] ?? 0.00),
                ':discount' => (float)($orderData['discount'] ?? 0.00),
                ':coupon_code' => isset($orderData['coupon_code']) ? $orderData['coupon_code'] : null,
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
            $this->logStatusChange($orderId, 'order', '', $orderData['order_status'] ?: 'pending_confirmation', 'Đơn hàng được tạo từ website', 'customer/system');
            $this->logStatusChange($orderId, 'payment', '', $orderData['payment_status'] ?: 'unpaid', 'Khởi tạo trạng thái thanh toán', 'customer/system');
            $this->logStatusChange($orderId, 'shipping', '', 'no_shipment', 'Khởi tạo trạng thái vận chuyển', 'customer/system');
            $this->logStatusChange($orderId, 'loyalty', '', 'not_earned', 'Khởi tạo trạng thái tích điểm', 'customer/system');

            // Log customer activity
            $this->logCustomerActivity(
                $orderData['customer_id'],
                $orderId,
                'order_created',
                "Đơn hàng được tạo thành công",
                "Đơn hàng #{$orderData['order_code']} được khởi tạo thành công với tổng số tiền " . number_format($orderData['total']) . "đ",
                null
            );

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
        $stmt = $this->db->prepare("
            SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email 
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.id 
            WHERE o.order_code = :order_code 
            LIMIT 1
        ");
        $stmt->execute([':order_code' => trim($orderCode)]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        $order['status_logs'] = $this->getStatusLogs((int)$order['id']);
        
        $order['couponCode'] = $order['coupon_code'] ?? null;
        $order['discountAmount'] = (float)($order['discount'] ?? 0.00);
        $order['subtotalAmount'] = (float)($order['subtotal'] ?? 0.00);
        $order['shippingFee'] = (float)($order['shipping_fee'] ?? 0.00);
        $order['totalAmount'] = (float)($order['total'] ?? 0.00);

        return $order;
    }

    public function getOrderDetailsById($orderId) {
        $stmt = $this->db->prepare("
            SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email 
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.id 
            WHERE o.id = :order_id 
            LIMIT 1
        ");
        $stmt->execute([':order_id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        $order['status_logs'] = $this->getStatusLogs((int)$order['id']);

        $order['couponCode'] = $order['coupon_code'] ?? null;
        $order['discountAmount'] = (float)($order['discount'] ?? 0.00);
        $order['subtotalAmount'] = (float)($order['subtotal'] ?? 0.00);
        $order['shippingFee'] = (float)($order['shipping_fee'] ?? 0.00);
        $order['totalAmount'] = (float)($order['total'] ?? 0.00);

        return $order;
    }

    public function getOrdersByPhone($phone) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE phone = :phone ORDER BY id DESC");
        $stmt->execute([':phone' => trim($phone)]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
            $order['couponCode'] = $order['coupon_code'] ?? null;
            $order['discountAmount'] = (float)($order['discount'] ?? 0.00);
            $order['subtotalAmount'] = (float)($order['subtotal'] ?? 0.00);
            $order['shippingFee'] = (float)($order['shipping_fee'] ?? 0.00);
            $order['totalAmount'] = (float)($order['total'] ?? 0.00);
        }
        return $orders;
    }

    public function listOrders($filters = []) {
        $sql = "SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email 
                FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['q'])) {
            $sql .= " AND (o.order_code LIKE :q OR o.phone LIKE :q OR o.receiver_name LIKE :q OR c.name LIKE :q)";
            $params[':q'] = '%' . trim($filters['q']) . '%';
        }

        if (!empty($filters['order_status'])) {
            $sql .= " AND o.order_status = :order_status";
            $params[':order_status'] = trim($filters['order_status']);
        }

        if (!empty($filters['payment_status'])) {
            $sql .= " AND o.payment_status = :payment_status";
            $params[':payment_status'] = trim($filters['payment_status']);
        }

        if (!empty($filters['start_date'])) {
            $sql .= " AND DATE(o.created_at) >= :start_date";
            $params[':start_date'] = trim($filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $sql .= " AND DATE(o.created_at) <= :end_date";
            $params[':end_date'] = trim($filters['end_date']);
        }

        $sql .= " ORDER BY o.id DESC";

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

        foreach ($items as &$order) {
            $order['items'] = (new OrderItem())->getItemsByOrderId((int)$order['id']);
            $order['status_logs'] = $this->getStatusLogs((int)$order['id']);
            $order['couponCode'] = $order['coupon_code'] ?? null;
            $order['discountAmount'] = (float)($order['discount'] ?? 0.00);
            $order['subtotalAmount'] = (float)($order['subtotal'] ?? 0.00);
            $order['shippingFee'] = (float)($order['shipping_fee'] ?? 0.00);
            $order['totalAmount'] = (float)($order['total'] ?? 0.00);
        }

        // Calculate summary
        $summarySql = "
            SELECT 
                COUNT(*) as totalOrders,
                SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pendingOrders,
                SUM(CASE WHEN order_status IN ('confirmed', 'packing') THEN 1 ELSE 0 END) as processingOrders,
                SUM(CASE WHEN order_status = 'shipping' THEN 1 ELSE 0 END) as shippingOrders,
                SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completedOrders,
                SUM(CASE WHEN order_status = 'completed' THEN total ELSE 0 END) as completedRevenue
            FROM orders
        ";
        $summaryRow = $this->db->query($summarySql)->fetch(PDO::FETCH_ASSOC);
        $summary = [
            'totalOrders' => (int)($summaryRow['totalOrders'] ?? 0),
            'pendingOrders' => (int)($summaryRow['pendingOrders'] ?? 0),
            'processingOrders' => (int)($summaryRow['processingOrders'] ?? 0),
            'shippingOrders' => (int)($summaryRow['shippingOrders'] ?? 0),
            'completedOrders' => (int)($summaryRow['completedOrders'] ?? 0),
            'completedRevenue' => (float)($summaryRow['completedRevenue'] ?? 0)
        ];

        return [
            'items' => $items,
            'summary' => $summary,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => (int)ceil($total / $limit)
            ]
        ];
    }

    private function validateTransition($groupKey, $fromStatus, $toStatus, $changedBy) {
        if (empty($fromStatus)) {
            return true;
        }
        if ($fromStatus === $toStatus) {
            return true;
        }

        // Check if fromStatus is terminal
        $stmtStatus = $this->db->prepare("SELECT is_terminal FROM workflow_statuses WHERE group_key = :group_key AND status_key = :status_key");
        $stmtStatus->execute([':group_key' => $groupKey, ':status_key' => $fromStatus]);
        $statusRow = $stmtStatus->fetch();
        $isTerminal = $statusRow ? (int)$statusRow['is_terminal'] : 0;

        if ($isTerminal === 1 && $changedBy !== 'admin') {
            throw new Exception("Không thể chuyển đổi từ trạng thái cuối cùng (terminal state).");
        }

        // Check if transition is allowed in workflow_transitions table
        $stmtTrans = $this->db->prepare("
            SELECT id FROM workflow_transitions 
            WHERE group_key = :group_key 
              AND from_status = :from_status 
              AND to_status = :to_status 
              AND is_active = 1
        ");
        $stmtTrans->execute([
            ':group_key' => $groupKey,
            ':from_status' => $fromStatus,
            ':to_status' => $toStatus
        ]);
        if (!$stmtTrans->fetch()) {
            throw new Exception("Quy trình chuyển đổi trạng thái {$groupKey} từ '{$fromStatus}' sang '{$toStatus}' không được phép.");
        }

        return true;
    }

    public function updateOrderStatus($orderId, $newStatus, $note = null, $changedBy = null, $adminId = null, $customerId = null) {
        $stmt = $this->db->prepare("SELECT order_status, customer_id, order_code FROM orders WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found.");
        }

        $currentStatus = $order['order_status'];
        if ($currentStatus === $newStatus) {
            return true;
        }

        $this->validateTransition('order', $currentStatus, $newStatus, $changedBy);

        // Update orders table
        $sql = "UPDATE orders SET order_status = :status";
        $params = [':status' => $newStatus, ':id' => (int)$orderId];
        if ($newStatus === 'completed') {
            $sql .= ", completed_at = CURRENT_TIMESTAMP";
        } elseif ($newStatus === 'cancelled') {
            $sql .= ", cancelled_at = CURRENT_TIMESTAMP";
        }
        $sql .= " WHERE id = :id";

        $stmtUpdate = $this->db->prepare($sql);
        $stmtUpdate->execute($params);

        // Log the change
        $this->logStatusChange($orderId, 'order', $currentStatus, $newStatus, $note, $changedBy, $adminId, $customerId);

        // CRM Activity
        $this->logCustomerActivity(
            $order['customer_id'],
            $orderId,
            'order_status_changed',
            "Trạng thái đơn hàng: " . $newStatus,
            $note ?: "Thay đổi trạng thái đơn hàng từ '{$currentStatus}' sang '{$newStatus}'",
            ['from_status' => $currentStatus, 'to_status' => $newStatus],
            $adminId
        );

        return true;
    }

    public function updatePaymentStatus($orderId, $newStatus, $note = null, $changedBy = null, $adminId = null, $customerId = null) {
        $stmt = $this->db->prepare("SELECT payment_status, customer_id, order_code FROM orders WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found.");
        }

        $currentStatus = $order['payment_status'];
        if ($currentStatus === $newStatus) {
            return true;
        }

        $this->validateTransition('payment', $currentStatus, $newStatus, $changedBy);

        // Update orders table
        $stmtUpdate = $this->db->prepare("UPDATE orders SET payment_status = :status WHERE id = :id");
        $stmtUpdate->execute([':status' => $newStatus, ':id' => (int)$orderId]);

        // Log the change
        $this->logStatusChange($orderId, 'payment', $currentStatus, $newStatus, $note, $changedBy, $adminId, $customerId);

        // CRM Activity
        $this->logCustomerActivity(
            $order['customer_id'],
            $orderId,
            'payment_status_changed',
            "Trạng thái thanh toán: " . $newStatus,
            $note ?: "Thay đổi trạng thái thanh toán từ '{$currentStatus}' sang '{$newStatus}'",
            ['from_status' => $currentStatus, 'to_status' => $newStatus],
            $adminId
        );

        return true;
    }

    public function updateShippingStatus($orderId, $newStatus, $note = null, $changedBy = null, $adminId = null, $customerId = null) {
        $stmt = $this->db->prepare("SELECT shipping_status, customer_id, order_code FROM orders WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found.");
        }

        $currentStatus = $order['shipping_status'];
        if ($currentStatus === $newStatus) {
            return true;
        }

        $this->validateTransition('shipping', $currentStatus, $newStatus, $changedBy);

        // Update orders table
        $stmtUpdate = $this->db->prepare("UPDATE orders SET shipping_status = :status WHERE id = :id");
        $stmtUpdate->execute([':status' => $newStatus, ':id' => (int)$orderId]);

        // Log the change
        $this->logStatusChange($orderId, 'shipping', $currentStatus, $newStatus, $note, $changedBy, $adminId, $customerId);

        // CRM Activity
        $this->logCustomerActivity(
            $order['customer_id'],
            $orderId,
            'shipping_status_changed',
            "Trạng thái vận chuyển: " . $newStatus,
            $note ?: "Thay đổi trạng thái vận chuyển từ '{$currentStatus}' sang '{$newStatus}'",
            ['from_status' => $currentStatus, 'to_status' => $newStatus],
            $adminId
        );

        return true;
    }

    public function updateLoyaltyStatus($orderId, $newStatus, $note = null, $changedBy = null, $adminId = null, $customerId = null) {
        $stmt = $this->db->prepare("SELECT loyalty_status, customer_id, order_code, phone, total, loyalty_points_earned, receiver_name FROM orders WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => (int)$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found.");
        }

        $currentStatus = $order['loyalty_status'];
        if ($currentStatus === $newStatus) {
            return true;
        }

        $this->validateTransition('loyalty', $currentStatus, $newStatus, $changedBy);

        // Update orders table
        $stmtUpdate = $this->db->prepare("UPDATE orders SET loyalty_status = :status WHERE id = :id");
        $stmtUpdate->execute([':status' => $newStatus, ':id' => (int)$orderId]);

        // Log the change
        $this->logStatusChange($orderId, 'loyalty', $currentStatus, $newStatus, $note, $changedBy, $adminId, $customerId);

        // CRM Activity
        $this->logCustomerActivity(
            $order['customer_id'],
            $orderId,
            'loyalty_status_changed',
            "Trạng thái tích điểm: " . $newStatus,
            $note ?: "Thay đổi trạng thái tích điểm từ '{$currentStatus}' sang '{$newStatus}'",
            ['from_status' => $currentStatus, 'to_status' => $newStatus],
            $adminId
        );

        // Execute point adjustments based on the status target
        if ($newStatus === 'credited') {
            // Check duplicate awards
            $stmtCheck = $this->db->prepare("
                SELECT id FROM customer_point_transactions 
                WHERE customer_phone = :phone 
                  AND type = 'earn_web_order' 
                  AND reference_type = 'order' 
                  AND reference_id = :order_id
            ");
            $stmtCheck->execute([
                ':phone' => $order['phone'],
                ':order_id' => $orderId
            ]);
            $exists = $stmtCheck->fetch();

            if (!$exists) {
                // Calculate points
                $preview = \App\Services\LoyaltyPointService::previewPoints((int)$order['total'], $order['phone'], "web_store", false);
                $points = (int)$preview['finalPoints'];

                if ($points > 0) {
                    $txModel = new CustomerPointTransactionModel();
                    $txModel->addTransaction(
                        $order['phone'],
                        'earn_web_order',
                        $points,
                        null,
                        'order',
                        $orderId,
                        "Cộng điểm từ đơn web {$order['order_code']}"
                    );

                    // Update balance
                    $loyaltyModel = new LoyaltyProductionModel();
                    $loyaltyModel->ensureCustomerProfile($order['phone'], $order['receiver_name']);

                    // Update order loyalty_points_earned
                    $this->updateLoyaltyPointsEarned($orderId, $points);
                }
            }
        } elseif ($newStatus === 'cancelled') {
            // Reverse points if credited before
            if ($order['loyalty_points_earned'] > 0) {
                // Check if already reversed
                $stmtCheckRev = $this->db->prepare("
                    SELECT id FROM customer_point_transactions 
                    WHERE customer_phone = :phone 
                      AND type = 'cancel_web_order' 
                      AND reference_type = 'order' 
                      AND reference_id = :order_id
                ");
                $stmtCheckRev->execute([
                    ':phone' => $order['phone'],
                    ':order_id' => $orderId
                ]);
                $existsRev = $stmtCheckRev->fetch();

                if (!$existsRev) {
                    $pointsToDeduct = -$order['loyalty_points_earned'];
                    $txModel = new CustomerPointTransactionModel();
                    $txModel->addTransaction(
                        $order['phone'],
                        'cancel_web_order',
                        $pointsToDeduct,
                        null,
                        'order',
                        $orderId,
                        "Hủy điểm tích lũy do hủy/trả đơn hàng {$order['order_code']}"
                    );

                    // Update balance
                    $loyaltyModel = new LoyaltyProductionModel();
                    $loyaltyModel->ensureCustomerProfile($order['phone'], $order['receiver_name']);

                    // Clear loyalty_points_earned in orders
                    $this->updateLoyaltyPointsEarned($orderId, 0);
                }
            }
        }

        return true;
    }

    public function updateLoyaltyPointsEarned($orderId, $points) {
        $stmt = $this->db->prepare("UPDATE orders SET loyalty_points_earned = :points WHERE id = :id");
        return $stmt->execute([
            ':points' => (int)$points,
            ':id' => (int)$orderId
        ]);
    }

    public function logStatusChange($orderId, $groupKey, $fromStatus, $toStatus, $note = null, $changedBy = null, $adminId = null, $customerId = null, $metadata = null) {
        $stmt = $this->db->prepare("
            INSERT INTO order_status_logs (order_id, group_key, from_status, to_status, note, changed_by, changed_by_admin_id, changed_by_customer_id, metadata)
            VALUES (:order_id, :group_key, :from_status, :to_status, :note, :changed_by, :changed_by_admin_id, :changed_by_customer_id, :metadata)
        ");
        return $stmt->execute([
            ':order_id' => (int)$orderId,
            ':group_key' => $groupKey,
            ':from_status' => $fromStatus !== null ? $fromStatus : '',
            ':to_status' => $toStatus !== null ? $toStatus : '',
            ':note' => $note,
            ':changed_by' => $changedBy ?: 'system',
            ':changed_by_admin_id' => $adminId ? (int)$adminId : null,
            ':changed_by_customer_id' => $customerId ? (int)$customerId : null,
            ':metadata' => $metadata ? json_encode($metadata) : null
        ]);
    }

    public function logCustomerActivity($customerId, $orderId, $type, $title, $description = null, $metadata = null, $adminId = null) {
        if (!$customerId) return false;
        $stmt = $this->db->prepare("
            INSERT INTO customer_activity_logs (customer_id, order_id, activity_type, title, description, metadata, created_by_admin_id)
            VALUES (:customer_id, :order_id, :activity_type, :title, :description, :metadata, :created_by_admin_id)
        ");
        return $stmt->execute([
            ':customer_id' => (int)$customerId,
            ':order_id' => $orderId ? (int)$orderId : null,
            ':activity_type' => $type,
            ':title' => $title,
            ':description' => $description,
            ':metadata' => $metadata ? json_encode($metadata) : null,
            ':created_by_admin_id' => $adminId ? (int)$adminId : null
        ]);
    }

    private function getStatusLogs($orderId) {
        $stmt = $this->db->prepare("SELECT * FROM order_status_logs WHERE order_id = :order_id ORDER BY id ASC");
        $stmt->execute([':order_id' => (int)$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
