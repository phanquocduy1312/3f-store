<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\Order;
use App\Models\OrderItem;
use App\Core\Database;
use PDO;

class CustomerOrderController {

    /**
     * GET /api/customer/orders
     */
    public function list() {
        $customer = AuthMiddleware::requireCustomer();
        $status = Request::query('status', '');
        
        $db = Database::getInstance()->getConnection();
        
        // Match by customer_id or phone if verified
        $sql = "SELECT * FROM orders WHERE customer_id = :cid";
        $params = [':cid' => $customer['id']];
        
        if (!empty($customer['phone'])) {
            $sql = "SELECT * FROM orders WHERE customer_id = :cid OR (customer_id IS NULL AND phone = :phone)";
            $params[':phone'] = $customer['phone'];
        }
        
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND order_status = :status";
            $params[':status'] = $status;
        }
        
        $sql .= " ORDER BY id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $itemModel = new OrderItem();
        foreach ($orders as &$order) {
            $order['items'] = $itemModel->getItemsByOrderId((int)$order['id']);
            $order['totalAmount'] = (float)$order['total'];
            $order['discountAmount'] = (float)$order['discount'];
            $order['subtotalAmount'] = (float)$order['subtotal'];
            $order['shippingFee'] = (float)$order['shipping_fee'];
        }
        
        Response::json(['success' => true, 'data' => $orders]);
    }

    /**
     * GET /api/customer/orders/:orderCode
     */
    public function detail() {
        $customer = AuthMiddleware::requireCustomer();
        $orderCode = Request::query('orderCode'); // Dynamic segment from Router
        
        $orderModel = new Order();
        $order = $orderModel->getOrderDetails($orderCode);
        
        if (!$order) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        
        // Enforce ownership
        $isOwner = (int)$order['customer_id'] === (int)$customer['id'] || 
                   (!empty($customer['phone']) && $order['phone'] === $customer['phone']);
                   
        if (!$isOwner) {
            Response::json(['success' => false, 'message' => 'Bạn không có quyền xem đơn hàng này.'], 403);
        }
        
        Response::json(['success' => true, 'data' => $order]);
    }

    /**
     * POST /api/customer/orders/:orderCode/cancel
     */
    public function cancel() {
        $customer = AuthMiddleware::requireCustomer();
        $orderCode = Request::query('orderCode');
        
        $orderModel = new Order();
        $order = $orderModel->getOrderDetails($orderCode);
        
        if (!$order) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        
        // Enforce ownership
        $isOwner = (int)$order['customer_id'] === (int)$customer['id'] || 
                   (!empty($customer['phone']) && $order['phone'] === $customer['phone']);
                   
        if (!$isOwner) {
            Response::json(['success' => false, 'message' => 'Bạn không có quyền hủy đơn hàng này.'], 403);
        }
        
        if ($order['order_status'] !== 'pending') {
            Response::json(['success' => false, 'message' => 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận.'], 400);
        }
        
        try {
            $orderModel->updateOrderStatus((int)$order['id'], 'cancelled', 'Khách hàng yêu cầu hủy đơn.', 'customer');
            Response::json(['success' => true, 'message' => 'Hủy đơn hàng thành công!']);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/customer/orders/:orderCode/reorder
     */
    public function reorder() {
        $customer = AuthMiddleware::requireCustomer();
        $orderCode = Request::query('orderCode');
        
        $orderModel = new Order();
        $order = $orderModel->getOrderDetails($orderCode);
        
        if (!$order) {
            Response::json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Fetch products and verify if they are active/in stock
        $items = (new OrderItem())->getItemsByOrderId((int)$order['id']);
        $validItems = [];
        
        foreach ($items as $item) {
            $stmt = $db->prepare("
                SELECT p.id, p.is_active, v.id AS variant_id, v.stock_quantity, v.is_active AS variant_active
                FROM products p
                LEFT JOIN product_variants v ON p.id = v.product_id AND v.id = ?
                WHERE p.id = ?
            ");
            $stmt->execute([$item['variant_id'], $item['product_id']]);
            $prod = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($prod && (int)$prod['is_active'] === 1) {
                // If variant exists, check if active and in stock
                if ($item['variant_id']) {
                    if ($prod['variant_active'] && (int)$prod['stock_quantity'] > 0) {
                        $validItems[] = [
                            'productId' => (int)$item['product_id'],
                            'variantId' => (int)$item['variant_id'],
                            'quantity' => min((int)$item['quantity'], (int)$prod['stock_quantity'])
                        ];
                    }
                } else {
                    $validItems[] = [
                        'productId' => (int)$item['product_id'],
                        'variantId' => null,
                        'quantity' => (int)$item['quantity']
                    ];
                }
            }
        }
        
        Response::json([
            'success' => true,
            'message' => 'Sao chép sản phẩm thành công!',
            'data' => $validItems
        ]);
    }
}
