<?php
require_once __DIR__ . '/../app/Core/Database.php';

// Load environment variables from .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'*(.*)'*$/", $val, $matches)) {
                $val = $matches[1];
            }
            $val = trim($val);
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

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
