<?php
namespace App\Models;

use App\Core\Database;
use PDO;

/**
 * Customer Wishlist Model.
 */
class CustomerWishlist {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all wishlist products for a customer.
     */
    public function getWishlist($customerId) {
        $stmt = $this->db->prepare("
            SELECT p.id, p.name, p.slug, p.brand, p.pet_type, p.product_type,
                   p.main_image_url as image, p.min_price as minPrice, p.max_price as maxPrice,
                   p.sold_count as sold, p.rating_average as rating, p.review_count as reviews,
                   (SELECT MIN(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS minOriginalPrice,
                   (SELECT MAX(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS maxOriginalPrice
            FROM customer_wishlists cw
            JOIN products p ON cw.product_id = p.id
            WHERE cw.customer_id = :customer_id
            ORDER BY cw.created_at DESC
        ");
        $stmt->execute([':customer_id' => $customerId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['price'] = number_format($item['minPrice'], 0, ',', '.') . 'đ';
            $item['oldPrice'] = isset($item['maxOriginalPrice']) && $item['maxOriginalPrice'] !== null ? number_format($item['maxOriginalPrice'], 0, ',', '.') . 'đ' : null;
        }

        return $items;
    }

    /**
     * Check if a product is in a customer's wishlist.
     */
    public function isFavorite($customerId, $productId) {
        $stmt = $this->db->prepare("
            SELECT id FROM customer_wishlists 
            WHERE customer_id = :customer_id AND product_id = :product_id
        ");
        $stmt->execute([
            ':customer_id' => $customerId,
            ':product_id' => $productId
        ]);
        return $stmt->fetch() ? true : false;
    }

    /**
     * Toggle a product in the customer's wishlist.
     * Returns true if added, false if removed.
     */
    public function toggle($customerId, $productId) {
        if ($this->isFavorite($customerId, $productId)) {
            $stmt = $this->db->prepare("
                DELETE FROM customer_wishlists 
                WHERE customer_id = :customer_id AND product_id = :product_id
            ");
            $stmt->execute([
                ':customer_id' => $customerId,
                ':product_id' => $productId
            ]);
            return false;
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO customer_wishlists (customer_id, product_id) 
                VALUES (:customer_id, :product_id)
            ");
            $stmt->execute([
                ':customer_id' => $customerId,
                ':product_id' => $productId
            ]);
            return true;
        }
    }

    /**
     * Sync local guest wishlist to customer's database.
     */
    public function sync($customerId, array $productIds) {
        if (empty($productIds)) {
            return;
        }

        $stmt = $this->db->prepare("
            INSERT IGNORE INTO customer_wishlists (customer_id, product_id) 
            VALUES (:customer_id, :product_id)
        ");

        foreach ($productIds as $productId) {
            $stmt->execute([
                ':customer_id' => $customerId,
                ':product_id' => (int)$productId
            ]);
        }
    }
}
