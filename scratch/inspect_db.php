<?php
$envFile = __DIR__ . '/../3f-api/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv(trim($parts[0]) . "=" . trim($parts[1]));
        }
    }
}
$config = require __DIR__ . '/../3f-api/config/config.php';
$dbConfig = $config['database'];
try {
    $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    foreach (['customers', 'customer_addresses'] as $table) {
        echo "--- Columns for $table ---\n";
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$table`");
        while ($col = $columnsStmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  * {$col['Field']} ({$col['Type']}) - Null: {$col['Null']}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
