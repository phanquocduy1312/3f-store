<?php
// Load environment variables manually
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv(trim($parts[0]) . "=" . trim($parts[1]));
            $_ENV[trim($parts[0])] = trim($parts[1]);
        }
    }
}

spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    // Create an order for Customer ID 2
    $orderCode = '3F-TEST-99';
    
    // Check if exists
    $stmt = $db->prepare("SELECT id FROM orders WHERE order_code = ?");
    $stmt->execute([$orderCode]);
    if ($stmt->fetch()) {
        $db->exec("DELETE FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_code = '3F-TEST-99')");
        $db->exec("DELETE FROM orders WHERE order_code = '3F-TEST-99'");
    }
    
    // Insert order
    $sql = "INSERT INTO orders (
        order_code, customer_id, receiver_name, phone, email, province, district, ward, address_line, 
        payment_method, payment_status, order_status, subtotal, shipping_fee, discount, total, loyalty_points_earned
    ) VALUES (
        '3F-TEST-99', 2, 'phan quoc duy', '0921808483', 'test@gmail.com', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123 Đồng Khởi',
        'cod', 'unpaid', 'pending', 350000.00, 30000.00, 0.00, 380000.00, 38
    )";
    $db->exec($sql);
    $orderId = $db->lastInsertId();
    
    // Insert order items
    $sqlItem = "INSERT INTO order_items (
        order_id, product_id, variant_id, sku, product_name, variant_name, image_url, price, quantity
    ) VALUES (
        :order_id, 1, 1, 'SKU-001', 'Pate Kucinta Cho Mèo Cưng', 'Vị Cá Ngừ 80g', '/assets/images/dog-food.webp', 35000.00, 10
    )";
    $stmtItem = $db->prepare($sqlItem);
    $stmtItem->execute([':order_id' => $orderId]);
    
    echo "SUCCESS: Test order 3F-TEST-99 created for Customer ID 2!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
