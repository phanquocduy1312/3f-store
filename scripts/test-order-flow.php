<?php
/**
 * CLI Test Script for Ordering, Inventory, and Loyalty Flows
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

// Load env
$envFile = dirname(__DIR__) . '/3f-api/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv("{$parts[0]}={$parts[1]}");
            $_ENV[$parts[0]] = $parts[1];
            $_SERVER[$parts[0]] = $parts[1];
        }
    }
}

// Simple Autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/3f-api/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Services\InventoryService;
use App\Models\CustomerPointTransactionModel;
use App\Models\LoyaltyProductionModel;
use App\Models\LoyaltyPointRuleModel;
use App\Services\LoyaltyPointService;

try {
    $db = Database::getInstance()->getConnection();
    echo "=== 1. Running Migrations ===\n";
    $orderModel = new Order();
    $loyaltyModel = new LoyaltyProductionModel();
    $txModel = new CustomerPointTransactionModel();
    $ruleModel = new LoyaltyPointRuleModel();
    
    // Check tables
    $stmt = $db->query("SHOW TABLES FROM 3f LIKE 'orders'");
    if ($stmt->fetch()) {
        echo "Orders table exists.\n";
    } else {
        echo "ERROR: Orders table not created.\n";
        exit(1);
    }

    echo "=== 2. Resolving Test Product/Variant ===\n";
    // Find a variant with positive stock
    $stmt = $db->query("
        SELECT pv.id AS variant_id, pv.product_id, pv.stock_quantity, pv.reserved_stock, p.name, pv.variant_name, pv.price 
        FROM product_variants pv 
        JOIN products p ON p.id = pv.product_id 
        WHERE pv.stock_quantity > 5 AND pv.is_active = 1 
        LIMIT 1
    ");
    $testItem = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$testItem) {
        echo "No suitable test variant found. Seeding dummy product & variant...\n";
        // Create one for testing
        $db->exec("
            INSERT INTO products (source_platform, source_product_id, name, slug, total_stock, min_price, max_price, is_active)
            VALUES ('test', 'test-p1', 'Test Product', 'test-product', 100, 50000, 50000, 1)
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
        ");
        $prodId = (int)$db->lastInsertId();
        
        $db->exec("
            INSERT INTO product_variants (product_id, source_platform, source_product_id, source_sku_id, variant_name, price, stock_quantity, is_active)
            VALUES ($prodId, 'test', 'test-p1', 'test-sku1', 'Phân loại A', 50000, 10, 1)
            ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
        ");
        $varId = (int)$db->lastInsertId();

        $testItem = [
            'product_id' => $prodId,
            'variant_id' => $varId,
            'stock_quantity' => 10,
            'reserved_stock' => 0,
            'name' => 'Test Product',
            'variant_name' => 'Phân loại A',
            'price' => 50000
        ];
    }

    $productId = (int)$testItem['product_id'];
    $variantId = (int)$testItem['variant_id'];
    $originalStock = (int)$testItem['stock_quantity'];
    $originalReserved = (int)$testItem['reserved_stock'];

    echo "Testing with Product: '{$testItem['name']}' (ID {$productId}), Variant: '{$testItem['variant_name']}' (ID {$variantId})\n";
    echo "Initial Stock: {$originalStock}, Initial Reserved: {$originalReserved}\n";

    echo "=== 3. Creating Test Order ===\n";
    $phone = "0999999999";
    $customerName = "Khách Hàng Test";
    
    // Upsert Customer
    $customerModel = new Customer();
    $customerId = $customerModel->upsertCustomer($customerName, $phone, "test@3f.store", "zalo-test");
    echo "Customer upserted. ID: {$customerId}\n";

    // Setup loyalty profile
    $loyaltyModel->ensureCustomerProfile($phone, $customerName);

    $orderCode = '3F-TEST-' . mt_rand(1000, 9999);
    $orderData = [
        'order_code' => $orderCode,
        'customer_id' => $customerId,
        'receiver_name' => 'Người Nhận Test',
        'phone' => $phone,
        'email' => 'test@3f.store',
        'zalo' => 'zalo-test',
        'province' => 'HCM',
        'district' => 'Quận 1',
        'ward' => 'Phường Bến Nghé',
        'address_line' => '123 Đường Test',
        'note' => 'Ghi chú test',
        'payment_method' => 'bank_transfer',
        'payment_status' => 'pending',
        'order_status' => 'pending',
        'subtotal' => $testItem['price'] * 2,
        'shipping_fee' => 0,
        'discount' => 0,
        'total' => $testItem['price'] * 2
    ];

    $items = [
        [
            'product_id' => $productId,
            'variant_id' => $variantId,
            'sku' => 'test-sku',
            'product_name' => $testItem['name'],
            'variant_name' => $testItem['variant_name'],
            'image_url' => 'test.jpg',
            'price' => $testItem['price'],
            'quantity' => 2
        ]
    ];

    $db->beginTransaction();
    $orderId = $orderModel->createOrder($orderData, $items);
    InventoryService::reserveStock($db, $items, $orderCode);
    $db->commit();
    echo "Order created successfully. Code: {$orderCode}, DB ID: {$orderId}\n";

    // Verify stock reserved
    $stmt = $db->prepare("SELECT stock_quantity, reserved_stock FROM product_variants WHERE id = :id");
    $stmt->execute([':id' => $variantId]);
    $afterCreate = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "After Create - Stock: {$afterCreate['stock_quantity']}, Reserved: {$afterCreate['reserved_stock']}\n";
    if ((int)$afterCreate['reserved_stock'] !== $originalReserved + 2) {
        echo "ERROR: Reserved stock did not increase by 2.\n";
        exit(1);
    }
    echo "SUCCESS: Stock reservation verified.\n";

    echo "=== 4. Testing Status Transition: pending -> confirmed ===\n";
    $orderModel->updateOrderStatus($orderId, 'confirmed', 'Admin xác nhận đơn hàng', 'admin');
    $details = $orderModel->getOrderDetails($orderCode);
    echo "Order Status after confirmed: {$details['order_status']}\n";

    echo "=== 5. Testing Status Transition: confirmed -> packing ===\n";
    $orderModel->updateOrderStatus($orderId, 'packing', 'Đóng gói hàng', 'admin');

    echo "=== 6. Testing Status Transition: packing -> shipping ===\n";
    $orderModel->updateOrderStatus($orderId, 'shipping', 'Giao hàng cho shipper', 'admin');

    echo "=== 7. Testing Status Transition: shipping -> completed & Loyalty Calculation ===\n";
    
    // Simulate what the OrderController does when completing:
    $db->beginTransaction();
    $orderModel->updateOrderStatus($orderId, 'completed', 'Giao hàng thành công', 'admin');
    InventoryService::fulfillStock($db, $details['items'], $orderCode);
    
    // Calculate points
    $preview = LoyaltyPointService::previewPoints((int)$details['total'], $phone, "web_store", false);
    $points = (int)$preview['finalPoints'];
    echo "Calculated points for total {$details['total']}: {$points} points\n";

    $txModel->addTransaction(
        $phone,
        'earn_web_order',
        $points,
        null,
        'order',
        $orderId,
        "Cộng điểm từ đơn web {$orderCode}"
    );
    $loyaltyModel->ensureCustomerProfile($phone, $customerName);
    $orderModel->updateLoyaltyPointsEarned($orderId, $points);
    $db->commit();

    // Verify stock and loyalty transaction
    $stmt->execute([':id' => $variantId]);
    $afterComplete = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "After Complete - Stock: {$afterComplete['stock_quantity']}, Reserved: {$afterComplete['reserved_stock']}\n";
    if ((int)$afterComplete['stock_quantity'] !== $originalStock - 2) {
        echo "ERROR: Stock quantity did not decrease by 2.\n";
        exit(1);
    }
    if ((int)$afterComplete['reserved_stock'] !== $originalReserved) {
        echo "ERROR: Reserved stock did not release.\n";
        exit(1);
    }

    $balance = $txModel->getBalance($phone);
    echo "Customer Loyalty Balance: {$balance} points\n";
    if ($balance < $points) {
        echo "ERROR: Loyalty balance not updated correctly.\n";
        exit(1);
    }
    echo "SUCCESS: Inventory fulfillment and loyalty points verified.\n";

    echo "=== ALL TESTS COMPLETED SUCCESSFULLY ===\n";

} catch (\Throwable $e) {
    echo "ERROR during tests: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    exit(1);
}
