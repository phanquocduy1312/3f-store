<?php
require_once __DIR__ . '/index.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database successfully.\n<br>";

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
    echo "customer_wishlists table checked/created.\n<br>";

    $sqlBanners = "
    CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        placement VARCHAR(50) NOT NULL,
        title VARCHAR(255) NULL,
        subtitle VARCHAR(255) NULL,
        image_url VARCHAR(500) NOT NULL,
        link_url VARCHAR(500) NULL,
        button_text VARCHAR(100) NULL,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        start_at DATETIME NULL,
        end_at DATETIME NULL,
        impression_count INT DEFAULT 0,
        click_count INT DEFAULT 0,
        created_by_admin_id INT NULL,
        updated_by_admin_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL,
        deleted_at DATETIME NULL,
        INDEX idx_placement_active (placement, is_active),
        INDEX idx_schedule (start_at, end_at),
        INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlBanners);
    echo "banners table checked/created.\n<br>";

    // blog_posts table migration
    $sqlBlogPosts = "
    CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT NULL,
        content LONGTEXT NOT NULL,
        thumbnail_url VARCHAR(500) NULL,
        author VARCHAR(100) DEFAULT 'Admin',
        published_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_slug (slug),
        INDEX idx_published_at (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlBlogPosts);
    echo "blog_posts table checked/created.\n<br>";

    // Seed default banners if empty
    $count = $db->query("SELECT COUNT(*) FROM banners WHERE deleted_at IS NULL")->fetchColumn();
    if ($count == 0) {
        $db->exec("
            INSERT INTO banners (placement, image_url, link_url, is_active, sort_order) VALUES
            ('home_hero_slider', '/assets/images/banner-1.webp', '/products', 1, 1),
            ('home_hero_slider', '/assets/images/banner-2.webp', '/products', 1, 2),
            ('home_hero_slider', '/assets/images/banner-3.webp', '/products', 1, 3)
        ");
        echo "Default banners seeded.\n<br>";
    }
    echo "Migration completed successfully.\n<br>";

} catch (\PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n<br>";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n<br>";
}
