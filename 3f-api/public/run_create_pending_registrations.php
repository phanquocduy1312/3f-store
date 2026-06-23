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
    
    // Drop table if exists to make it clean
    $db->exec("DROP TABLE IF EXISTS pending_registrations");
    
    $sql = "CREATE TABLE IF NOT EXISTS pending_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        full_name VARCHAR(191) NOT NULL,
        phone VARCHAR(30) NULL,
        password_hash VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        last_sent_at DATETIME NULL,
        resend_count INT NOT NULL DEFAULT 0,
        daily_send_date DATE NULL,
        daily_send_count INT NOT NULL DEFAULT 0,
        ip_address VARCHAR(64) NULL,
        user_agent TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL,
        UNIQUE KEY uniq_pending_email (email),
        INDEX idx_pending_token_hash (token_hash),
        INDEX idx_pending_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "SUCCESS: Created pending_registrations table!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
