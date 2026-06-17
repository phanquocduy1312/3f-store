<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class OrderItem {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function insertItem($orderId, $productId, $variantId, $sku, $productName, $variantName, $imageUrl, $price, $quantity) {
        $stmt = $this->db->prepare("
            INSERT INTO order_items (
                order_id, product_id, variant_id, sku, 
                product_name, variant_name, image_url, price, quantity
            ) VALUES (
                :order_id, :product_id, :variant_id, :sku, 
                :product_name, :variant_name, :image_url, :price, :quantity
            )
        ");
        return $stmt->execute([
            ':order_id' => (int)$orderId,
            ':product_id' => (int)$productId,
            ':variant_id' => $variantId ? (int)$variantId : null,
            ':sku' => $sku ? trim($sku) : null,
            ':product_name' => trim($productName),
            ':variant_name' => $variantName ? trim($variantName) : null,
            ':image_url' => $imageUrl ? trim($imageUrl) : null,
            ':price' => (float)$price,
            ':quantity' => (int)$quantity
        ]);
    }

    public function getItemsByOrderId($orderId) {
        $stmt = $this->db->prepare("SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id ASC");
        $stmt->execute([':order_id' => (int)$orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
