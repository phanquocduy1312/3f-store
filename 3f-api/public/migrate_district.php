<?php
require_once __DIR__ . "/../app/Core/Database.php";
require_once __DIR__ . "/../config/config.php";

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $check = $db->query("SHOW COLUMNS FROM customer_addresses LIKE 'district_code'")->fetch();
    if (!$check) {
        $db->exec("ALTER TABLE customer_addresses ADD COLUMN district_code VARCHAR(50) NULL AFTER province_name, ADD COLUMN district_name VARCHAR(255) NULL AFTER district_code");
        echo "Successfully added district to customer_addresses table.";
    } else {
        echo "Column district_code already exists.";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
