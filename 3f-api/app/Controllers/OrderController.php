<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\InventoryService;
use App\Services\LoyaltyPointService;
use App\Models\CustomerPointTransactionModel;
use App\Models\LoyaltyProductionModel;
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;
use Exception;
use PDO;

class OrderController {
    /**
     * POST /api/orders/create
     */
    public function create() {
        try {
            $input = Request::json();

            // Validate Customer Info
            $customerInfo = $input['customer'] ?? [];
            $customerName = trim($customerInfo['name'] ?? '');
            $customerPhone = trim($customerInfo['phone'] ?? '');
            $customerEmail = trim($customerInfo['email'] ?? '');
            $customerZalo = trim($customerInfo['zalo'] ?? '');

            if ($customerName === '' || $customerPhone === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin khách hàng (tên và số điện thoại là bắt buộc)."], 400);
            }

            // Validate Shipping Address
            $shippingInfo = $input['shipping'] ?? [];
            $receiverName = trim($shippingInfo['receiverName'] ?? '');
            $receiverPhone = trim($shippingInfo['phone'] ?? '');
            $province = trim($shippingInfo['province'] ?? '');
            $district = trim($shippingInfo['district'] ?? '');
            $ward = trim($shippingInfo['ward'] ?? '');
            $addressLine = trim($shippingInfo['addressLine'] ?? '');
            $shippingNote = trim($shippingInfo['note'] ?? '');

            if ($receiverName === '' || $receiverPhone === '' || $addressLine === '') {
                Response::json(["success" => false, "message" => "Thiếu thông tin nhận hàng (tên người nhận, điện thoại và địa chỉ cụ thể là bắt buộc)."], 400);
            }

            // Validate Items
            $inputItems = $input['items'] ?? [];
            if (empty($inputItems) || !is_array($inputItems)) {
                Response::json(["success" => false, "message" => "Giỏ hàng không được để trống."], 400);
            }

            // Validate Payment Method
            $paymentMethod = trim($input['paymentMethod'] ?? 'cod');
            if ($paymentMethod === 'vietqr') {
                $paymentMethod = 'bank_transfer';
            }

            if (!in_array($paymentMethod, ['cod', 'bank_transfer'], true)) {
                Response::json(["success" => false, "message" => "Phương thức thanh toán không hợp lệ."], 400);
            }

            $db = \App\Core\Database::getInstance()->getConnection();

            // Resolve items from database to compute real totals (don't trust client price)
            $resolvedItems = [];
            $subtotal = 0.00;

            foreach ($inputItems as $item) {
                $productId = isset($item['productId']) ? (int)$item['productId'] : 0;
                $variantId = isset($item['variantId']) ? (int)$item['variantId'] : 0;
                $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;

                if ($productId <= 0 || $quantity <= 0) {
                    Response::json(["success" => false, "message" => "Sản phẩm hoặc số lượng không hợp lệ."], 400);
                }

                // Check Product Existence
                $stmtProd = $db->prepare("SELECT id, name, main_image_url, has_variants FROM products WHERE id = :id AND is_active = 1");
                $stmtProd->execute([':id' => $productId]);
                $product = $stmtProd->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    Response::json(["success" => false, "message" => "Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng bán (ID {$productId})."], 404);
                }

                $productName = $product['name'];
                $variantName = null;
                $sku = null;
                $price = 0.00;
                $imageUrl = $product['main_image_url'];

                if ($product['has_variants'] || $variantId > 0) {
                    if ($variantId <= 0) {
                        Response::json(["success" => false, "message" => "Sản phẩm '{$productName}' yêu cầu chọn phân loại sản phẩm."], 400);
                    }

                    // Fetch Variant details
                    $stmtVar = $db->prepare("
                        SELECT id, sku, variant_name, price, image_url, stock_quantity, reserved_stock 
                        FROM product_variants 
                        WHERE id = :id AND product_id = :product_id AND is_active = 1
                    ");
                    $stmtVar->execute([':id' => $variantId, ':product_id' => $productId]);
                    $variant = $stmtVar->fetch(PDO::FETCH_ASSOC);

                    if (!$variant) {
                        Response::json(["success" => false, "message" => "Phân loại sản phẩm không hợp lệ cho '{$productName}'."], 400);
                    }

                    $variantName = $variant['variant_name'];
                    $sku = $variant['sku'];
                    $price = (float)$variant['price'];
                    if (!empty($variant['image_url'])) {
                        $imageUrl = $variant['image_url'];
                    }

                    // Check stock
                    $available = $variant['stock_quantity'] - $variant['reserved_stock'];
                    if ($available < $quantity) {
                        Response::json(["success" => false, "message" => "Phân loại '{$variantName}' của '{$productName}' đã hết hàng hoặc không đủ tồn kho."], 400);
                    }
                } else {
                    // Non-variant product. Fetch price and stock from products table
                    $stmtProdDetail = $db->prepare("SELECT min_price, total_stock, reserved_stock, sku FROM products WHERE id = :id");
                    $stmtProdDetail->execute([':id' => $productId]);
                    $prodDetail = $stmtProdDetail->fetch(PDO::FETCH_ASSOC);

                    $price = (float)$prodDetail['min_price'];
                    $sku = $prodDetail['sku'] ?? null;

                    $available = $prodDetail['total_stock'] - $prodDetail['reserved_stock'];
                    if ($available < $quantity) {
                        Response::json(["success" => false, "message" => "Sản phẩm '{$productName}' không đủ tồn kho."], 400);
                    }
                }

                $resolvedItems[] = [
                    'product_id' => $productId,
                    'variant_id' => $variantId ?: null,
                    'sku' => $sku,
                    'product_name' => $productName,
                    'variant_name' => $variantName,
                    'image_url' => $imageUrl,
                    'price' => $price,
                    'quantity' => $quantity
                ];

                $subtotal += ($price * $quantity);
            }

            // Pricing totals
            $shippingFee = 0.00; // standard MVP
            $discount = 0.00;    // standard MVP
            $total = $subtotal + $shippingFee - $discount;

            // Generate Order Code
            $orderCode = '3F-' . str_pad(mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);

            // Upsert Customer
            $customerModel = new Customer();
            $customerId = $customerModel->upsertCustomer($customerName, $customerPhone, $customerEmail, $customerZalo);

            // Upsert Loyalty Profile
            $loyaltyModel = new LoyaltyProductionModel();
            $loyaltyModel->ensureCustomerProfile($customerPhone, $customerName);

            // Order Data payload
            $orderData = [
                'order_code' => $orderCode,
                'customer_id' => $customerId,
                'receiver_name' => $receiverName,
                'phone' => $receiverPhone,
                'email' => $customerEmail,
                'zalo' => $customerZalo,
                'province' => $province,
                'district' => $district,
                'ward' => $ward,
                'address_line' => $addressLine,
                'note' => $shippingNote,
                'payment_method' => $paymentMethod,
                'payment_status' => 'unpaid',
                'order_status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'total' => $total
            ];

            // 3. Save order and atomically reserve stock in a transaction
            $orderModel = new Order();
            
            // Wait, createOrder handles transaction itself. But since we need to reserve stock, let's execute reserveStock inside createOrder or explicitly run a transaction coordinate block!
            // Let's use the DB connection to coordinate:
            $db->beginTransaction();
            try {
                // Save order meta & items (createOrder writes logs too)
                $orderId = $orderModel->createOrder($orderData, $resolvedItems);

                // Reserve inventory stock
                InventoryService::reserveStock($db, $resolvedItems, $orderCode);

                $db->commit();
            } catch (Exception $txEx) {
                $db->rollBack();
                throw $txEx;
            }

            // Fetch final details
            $details = $orderModel->getOrderDetails($orderCode);

            Response::json(["success" => true, "data" => $details], 201);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Tạo đơn hàng thất bại: " . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/orders/detail
     */
    public function detail() {
        try {
            $orderCode = trim((string)Request::query('orderCode'));
            if ($orderCode === '') {
                Response::json(["success" => false, "message" => "Thiếu mã đơn hàng."], 400);
            }

            $orderModel = new Order();
            $details = $orderModel->getOrderDetails($orderCode);

            if (!$details) {
                Response::json(["success" => false, "message" => "Không tìm thấy đơn hàng."], 404);
            }

            Response::json(["success" => true, "data" => $details], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi lấy chi tiết đơn hàng: " . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/orders/check
     */
    public function check() {
        try {
            $phone = trim((string)Request::query('phone'));
            $orderCode = trim((string)Request::query('orderCode'));

            if ($phone === '') {
                Response::json(["success" => false, "message" => "Thiếu số điện thoại kiểm tra."], 400);
            }

            $orderModel = new Order();
            if ($orderCode !== '') {
                $details = $orderModel->getOrderDetails($orderCode);
                if ($details && $details['phone'] === $phone) {
                    Response::json(["success" => true, "data" => [$details]], 200);
                } else {
                    Response::json(["success" => true, "data" => []], 200);
                }
            } else {
                $orders = $orderModel->getOrdersByPhone($phone);
                Response::json(["success" => true, "data" => $orders], 200);
            }
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi kiểm tra đơn hàng: " . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/orders
     */
    public function adminList() {
        try {
            $filters = [
                'q' => Request::query('q'),
                'order_status' => Request::query('order_status'),
                'payment_status' => Request::query('payment_status'),
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 20)
            ];

            $orderModel = new Order();
            $data = $orderModel->listOrders($filters);

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi lấy danh sách đơn hàng admin: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/orders/update-status
     */
    public function adminUpdateStatus() {
        try {
            $input = Request::json();
            $orderId = isset($input['orderId']) ? (int)$input['orderId'] : 0;
            $newStatus = trim($input['newStatus'] ?? '');
            $note = trim($input['note'] ?? '');

            if ($orderId <= 0 || $newStatus === '') {
                Response::json(["success" => false, "message" => "Thiếu ID đơn hàng hoặc trạng thái mới."], 400);
            }

            $db = \App\Core\Database::getInstance()->getConnection();
            $orderModel = new Order();

            $db->beginTransaction();
            try {
                // Fetch details under lock
                $order = $orderModel->getOrderDetailsById($orderId);
                if (!$order) {
                    throw new Exception("Không tìm thấy đơn hàng.");
                }

                $currentStatus = $order['order_status'];

                // Update status in orders table (validates transitions internally)
                $orderModel->updateOrderStatus($orderId, $newStatus, $note, 'admin');

                // Stock Adjustment Logic
                if ($newStatus === 'cancelled') {
                    // Release reserved stock
                    InventoryService::releaseStock($db, $order['items'], $order['order_code']);
                } elseif ($newStatus === 'completed') {
                    // Fulfill reserved stock
                    InventoryService::fulfillStock($db, $order['items'], $order['order_code']);

                    // Calculate and Award Loyalty Points
                    $phone = $order['phone'];
                    
                    // Check if already awarded
                    $stmtCheck = $db->prepare("
                        SELECT id FROM customer_point_transactions 
                        WHERE customer_phone = :phone 
                          AND type = 'earn_web_order' 
                          AND reference_type = 'order' 
                          AND reference_id = :order_id
                    ");
                    $stmtCheck->execute([
                        ':phone' => $phone,
                        ':order_id' => $orderId
                    ]);
                    $exists = $stmtCheck->fetch();

                    if (!$exists) {
                        // Calculate points via LoyaltyPointService
                        $preview = LoyaltyPointService::previewPoints((int)$order['total'], $phone, "web_store", false);
                        $points = (int)$preview['finalPoints'];

                        if ($points > 0) {
                            $txModel = new CustomerPointTransactionModel();
                            $txModel->addTransaction(
                                $phone,
                                'earn_web_order',
                                $points,
                                null,
                                'order',
                                $orderId,
                                "Cộng điểm từ đơn web {$order['order_code']}"
                            );

                            // Update balance/profile
                            $loyaltyModel = new LoyaltyProductionModel();
                            $loyaltyModel->ensureCustomerProfile($phone, $order['receiver_name']);

                            // Save to orders table
                            $orderModel->updateLoyaltyPointsEarned($orderId, $points);
                        }
                    }

                    // Auto mark paid for COD on completion
                    if ($order['payment_method'] === 'cod' && $order['payment_status'] !== 'paid') {
                        $orderModel->updatePaymentStatus($orderId, 'paid', 'Thanh toán COD khi hoàn tất đơn', 'system');
                    }
                }

                $db->commit();

                // Write Audit Log
                $currentAdmin = AuthMiddleware::getCurrentAdmin();
                $adminId = $currentAdmin ? $currentAdmin['id'] : null;
                AuditLog::write($adminId, 'update_order_status', 'orders', $orderId, [
                    'order_code' => $order['order_code'],
                    'from_status' => $currentStatus,
                    'to_status' => $newStatus,
                    'note' => $note
                ]);

                Response::json(["success" => true, "message" => "Cập nhật trạng thái đơn hàng thành công."], 200);

            } catch (Exception $txEx) {
                $db->rollBack();
                throw $txEx;
            }

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi cập nhật trạng thái đơn hàng: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/orders/mark-paid
     */
    public function adminMarkPaid() {
        try {
            $input = Request::json();
            $orderId = isset($input['orderId']) ? (int)$input['orderId'] : 0;
            $note = trim($input['note'] ?? '');

            if ($orderId <= 0) {
                Response::json(["success" => false, "message" => "Thiếu ID đơn hàng."], 400);
            }

            $orderModel = new Order();
            $orderModel->updatePaymentStatus($orderId, 'paid', $note, 'admin');

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'mark_order_paid', 'orders', $orderId, [
                'note' => $note
            ]);

            Response::json(["success" => true, "message" => "Đánh dấu đã thanh toán thành công."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi cập nhật thanh toán đơn hàng: " . $e->getMessage()], 500);
        }
    }
}
