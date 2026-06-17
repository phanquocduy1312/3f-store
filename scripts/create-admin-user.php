<?php
/**
 * CLI Tool to Create Admin User
 * Usage: php scripts/create-admin-user.php <name> <email> <password>
 */

if ($argc < 4) {
    echo "Usage: php scripts/create-admin-user.php <name> <email> <password>\n";
    exit(1);
}

$name = trim($argv[1]);
$email = trim($argv[2]);
$password = trim($argv[3]);

if (empty($name) || empty($email) || empty($password)) {
    echo "ERROR: Name, email and password cannot be empty.\n";
    exit(1);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "ERROR: Email is invalid.\n";
    exit(1);
}

// Load env
$envFile = dirname(__DIR__) . '/3f-api/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv("{$parts[0]}={$parts[1]}");
            $_ENV[$parts[0]] = $parts[1];
            $_SERVER[$parts[0]] = $parts[1];
        }
    }
}

// Simple Autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/3f-api/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;
use App\Models\AdminUser;
use App\Models\AuditLog;

try {
    $db = Database::getInstance()->getConnection();
    $userModel = new AdminUser();

    // Check if email already exists
    $existing = $userModel->findByEmail($email);
    if ($existing) {
        echo "ERROR: Admin user with email '{$email}' already exists.\n";
        exit(1);
    }

    $adminId = $userModel->createUser($name, $email, $password, 'admin');
    
    // Write Audit Log
    AuditLog::write($adminId, 'cli_create', 'admin_users', $adminId, [
        'email' => $email,
        'name' => $name
    ]);

    echo "SUCCESS: Admin user '{$name}' ({$email}) created successfully. ID: {$adminId}\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
