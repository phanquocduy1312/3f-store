<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\CustomerWishlist;
use App\Helpers\AuthMiddleware;

class CustomerWishlistController {

    /**
     * GET /api/customer/wishlist
     */
    public function getWishlist() {
        $customer = AuthMiddleware::requireCustomer();
        $wishlistModel = new CustomerWishlist();
        $items = $wishlistModel->getWishlist($customer['id']);

        Response::json([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * POST /api/customer/wishlist/toggle
     */
    public function toggleWishlist() {
        $customer = AuthMiddleware::requireCustomer();
        $productId = (int)Request::input('product_id', 0);

        if ($productId <= 0) {
            Response::json(['success' => false, 'message' => 'Sản phẩm không hợp lệ.'], 400);
        }

        $wishlistModel = new CustomerWishlist();
        $isFavorite = $wishlistModel->toggle($customer['id'], $productId);

        Response::json([
            'success' => true,
            'is_favorite' => $isFavorite,
            'message' => $isFavorite ? 'Đã thêm sản phẩm vào danh sách yêu thích.' : 'Đã xóa sản phẩm khỏi danh sách yêu thích.'
        ]);
    }

    /**
     * POST /api/customer/wishlist/sync
     */
    public function syncWishlist() {
        $customer = AuthMiddleware::requireCustomer();
        $productIds = Request::input('product_ids', []);

        if (!is_array($productIds)) {
            Response::json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 400);
        }

        $wishlistModel = new CustomerWishlist();
        $wishlistModel->sync($customer['id'], $productIds);

        Response::json([
            'success' => true,
            'message' => 'Đồng bộ danh sách yêu thích thành công.'
        ]);
    }

    /**
     * GET /api/run-wishlist-migration
     */
    public function runWishlistMigration() {
        $db = \App\Core\Database::getInstance()->getConnection();
        try {
            $sqlWishlist = "
            CREATE TABLE IF NOT EXISTS customer_wishlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_customer_product (customer_id, product_id),
                INDEX idx_wishlist_customer_id (customer_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $db->exec($sqlWishlist);
            Response::json([
                'success' => true,
                'message' => 'Migration customer_wishlists checked/created successfully!'
            ]);
        } catch (\Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
