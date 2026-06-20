<?php
require_once __DIR__ . '/../3f-api/app/Core/Database.php';

use App\Core\Database;

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT id, name, min_price, max_price FROM products WHERE slug LIKE '%s2pet-v2%' LIMIT 1");
$stmt->execute();
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    echo "Product not found\n";
    exit;
}

echo "Product ID: " . $product['id'] . "\n";
echo "Product Name: " . $product['name'] . "\n";
echo "Product Min Price: " . $product['min_price'] . "\n";
echo "Product Max Price: " . $product['max_price'] . "\n";

$stmtVariants = $db->prepare("SELECT id, sku, variant_name, price, original_price FROM product_variants WHERE product_id = :product_id");
$stmtVariants->execute([':product_id' => $product['id']]);
$variants = $stmtVariants->fetchAll(PDO::FETCH_ASSOC);

echo "\nVariants:\n";
foreach ($variants as $v) {
    echo "ID: " . $v['id'] . " | SKU: " . $v['sku'] . " | Name: " . $v['variant_name'] . " | Price: " . $v['price'] . " | Original Price: " . ($v['original_price'] ?? 'NULL') . "\n";
}
