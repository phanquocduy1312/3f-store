<?php

require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../config/config.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database.\n";

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
    echo "customer_wishlists table checked/created.\n";

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
