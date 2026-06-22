<?php
require_once __DIR__ . '/../app/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "TABLE_ROW_COUNTS:\n";
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "$table: $count\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
