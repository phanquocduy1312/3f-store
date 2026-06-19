<?php
require_once __DIR__ . "/../app/Core/Database.php";
require_once __DIR__ . "/../config/config.php";

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    // Add shipping_method if it doesn't exist
    $check = $db->query("SHOW COLUMNS FROM orders LIKE 'shipping_method'")->fetch();
    if (!$check) {
        $db->exec("ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(50) NOT NULL DEFAULT 'express' AFTER payment_method");
        echo "Successfully added shipping_method to orders table.";
    } else {
        echo "Column shipping_method already exists.";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
