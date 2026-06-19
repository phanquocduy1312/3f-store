<?php

require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../config/config.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database.\n";

    // 1. Create customer_notes table
    $sqlNotes = "
    CREATE TABLE IF NOT EXISTS customer_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        admin_id INT NOT NULL,
        note TEXT NOT NULL,
        visibility ENUM('internal') DEFAULT 'internal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        INDEX idx_customer_notes_customer_id (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlNotes);
    echo "customer_notes table checked/created.\n";

    // 2. Create customer_tags table
    $sqlTags = "
    CREATE TABLE IF NOT EXISTS customer_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(20) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlTags);
    echo "customer_tags table checked/created.\n";

    // 3. Create customer_tag_assignments table
    $sqlAssignments = "
    CREATE TABLE IF NOT EXISTS customer_tag_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        tag_id INT NOT NULL,
        assigned_by_admin_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_customer_tag (customer_id, tag_id),
        INDEX idx_assignments_customer_id (customer_id),
        INDEX idx_assignments_tag_id (tag_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($sqlAssignments);
    echo "customer_tag_assignments table checked/created.\n";

    // 4. Insert default tags if they don't exist
    $defaultTags = [
        ['name' => 'VIP', 'color' => '#f59e0b'],
        ['name' => 'Khách mới', 'color' => '#10b981'],
        ['name' => 'Khách thân thiết', 'color' => '#3b82f6'],
        ['name' => 'Cần chăm sóc', 'color' => '#eab308'],
        ['name' => 'Rủi ro churn', 'color' => '#ef4444'],
        ['name' => 'Hay mua đồ mèo', 'color' => '#8b5cf6'],
        ['name' => 'Hay mua đồ chó', 'color' => '#ec4899']
    ];

    $stmt = $db->prepare("INSERT IGNORE INTO customer_tags (name, color) VALUES (:name, :color)");
    foreach ($defaultTags as $tag) {
        $stmt->execute([':name' => $tag['name'], ':color' => $tag['color']]);
    }
    echo "Default tags seeded.\n";

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
