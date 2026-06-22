<?php
// Load environment variables manually
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv(trim($parts[0]) . "=" . trim($parts[1]));
            $_ENV[trim($parts[0])] = trim($parts[1]);
        }
    }
}

spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "=== COLUMNS OF customer_addresses ===\n";
    $columns = $db->query("SHOW COLUMNS FROM customer_addresses")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $c) {
        echo "Field: {$c['Field']} | Type: {$c['Type']} | Null: {$c['Null']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
