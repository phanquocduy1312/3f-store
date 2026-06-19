<?php
require_once __DIR__ . '/../app/Config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check if column exists
    $checkStmt = $db->query("SHOW COLUMNS FROM products LIKE 'ingredients'");
    if ($checkStmt->rowCount() == 0) {
        $db->exec("ALTER TABLE products ADD COLUMN ingredients LONGTEXT NULL AFTER description");
        echo "Column 'ingredients' added successfully.\n";
    } else {
        echo "Column 'ingredients' already exists.\n";
    }

    $checkStmt2 = $db->query("SHOW COLUMNS FROM products LIKE 'feeding_guide'");
    if ($checkStmt2->rowCount() == 0) {
        $db->exec("ALTER TABLE products ADD COLUMN feeding_guide LONGTEXT NULL AFTER ingredients");
        echo "Column 'feeding_guide' added successfully.\n";
    } else {
        echo "Column 'feeding_guide' already exists.\n";
    }

} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
}
