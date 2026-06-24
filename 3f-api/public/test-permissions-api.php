<?php
require_once __DIR__ . '/../app/Core/Database.php';

// Load environment variables from .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
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

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance()->getConnection();
    
    if ($action === 'setup') {
        // Clean up any old test data first
        $db->exec("DELETE FROM admin_sessions WHERE admin_user_id IN (SELECT id FROM admin_users WHERE email = 'test_restricted@3fstore.vn')");
        $db->exec("DELETE FROM admin_users WHERE email = 'test_restricted@3fstore.vn'");
        $db->exec("DELETE FROM admin_roles WHERE name = 'test_restricted_role'");

        // 1. Create a custom test role with ONLY 'dashboard' and 'orders' permission
        $stmtRole = $db->prepare("INSERT INTO admin_roles (name, display_name, permissions) VALUES ('test_restricted_role', 'Test Restricted Role', :perms)");
        $stmtRole->execute([':perms' => json_encode(['dashboard', 'orders'])]);
        $roleId = $db->lastInsertId();

        // 2. Create a test user with this custom role
        $hash = password_hash('password123', PASSWORD_DEFAULT);
        $stmtUser = $db->prepare("INSERT INTO admin_users (name, email, password_hash, role, is_active) VALUES ('Restricted Tester', 'test_restricted@3fstore.vn', :hash, 'test_restricted_role', 1)");
        $stmtUser->execute([':hash' => $hash]);
        $userId = $db->lastInsertId();

        echo json_encode([
            "success" => true,
            "message" => "Database setup complete. Created test user ID $userId with role ID $roleId",
            "credentials" => [
                "email" => "test_restricted@3fstore.vn",
                "password" => "password123"
            ]
        ], JSON_PRETTY_PRINT);
        exit;
    } elseif ($action === 'cleanup') {
        $db->exec("DELETE FROM admin_sessions WHERE admin_user_id IN (SELECT id FROM admin_users WHERE email = 'test_restricted@3fstore.vn')");
        $db->exec("DELETE FROM admin_users WHERE email = 'test_restricted@3fstore.vn'");
        $db->exec("DELETE FROM admin_roles WHERE name = 'test_restricted_role'");

        echo json_encode([
            "success" => true,
            "message" => "Database cleanup complete. Deleted test user and role."
        ], JSON_PRETTY_PRINT);
        exit;
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid action. Use ?action=setup or ?action=cleanup"
        ], JSON_PRETTY_PRINT);
        exit;
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
