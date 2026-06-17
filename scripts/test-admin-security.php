<?php
/**
 * CLI Test Script for Admin Security & Hardening
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

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
use App\Models\AdminSession;
use App\Models\AuditLog;

try {
    $db = Database::getInstance()->getConnection();
    echo "=== 1. Checking Admin Tables ===\n";
    $userModel = new AdminUser();
    $sessionModel = new AdminSession();
    $auditModel = new AuditLog();

    $tables = ['admin_users', 'admin_sessions', 'admin_audit_logs'];
    foreach ($tables as $tbl) {
        $stmt = $db->query("SHOW TABLES FROM 3f LIKE '{$tbl}'");
        if ($stmt->fetch()) {
            echo "Table '{$tbl}' exists.\n";
        } else {
            echo "ERROR: Table '{$tbl}' does not exist.\n";
            exit(1);
        }
    }

    echo "=== 2. Cleaning previous test users ===\n";
    $db->exec("DELETE FROM admin_users WHERE email LIKE '%@test-admin.vn'");
    
    // Ensure table is empty for bootstrap test
    $stmtCount = $db->query("SELECT COUNT(*) as cnt FROM admin_users");
    $rowCount = $stmtCount->fetch();
    $totalUsers = (int)$rowCount['cnt'];

    echo "=== 3. Testing Admin Bootstrap ===\n";
    if ($totalUsers === 0) {
        // Run bootstrap
        echo "Database has 0 admins. Seeding first admin via model...\n";
        $adminId = $userModel->createUser("Test Admin", "admin@test-admin.vn", "password123");
        echo "Bootstrap Admin created. ID: {$adminId}\n";

        // Attempting to bootstrap again (should lock itself or not allow duplicate email)
        try {
            $userModel->createUser("Another Admin", "admin@test-admin.vn", "newpassword");
            echo "ERROR: Duplicate email allowed.\n";
            exit(1);
        } catch (\Throwable $e) {
            echo "SUCCESS: Duplicate email blocked as expected.\n";
        }
    } else {
        echo "Database already has users. Skipping empty bootstrap test.\n";
        $adminId = $userModel->createUser("Test Admin", "admin-" . mt_rand(1000, 9999) . "@test-admin.vn", "password123");
        echo "Created transient test admin. ID: {$adminId}\n";
    }

    // Fetch the user
    $admin = $userModel->findById($adminId);
    if (!$admin) {
        echo "ERROR: Failed to fetch admin by ID.\n";
        exit(1);
    }
    echo "Fetched Admin: Name='{$admin['name']}', Email='{$admin['email']}'\n";

    echo "=== 4. Testing Password Verification ===\n";
    $email = $admin['email'];
    $adminRecord = $userModel->findByEmail($email);
    
    if (!$adminRecord) {
        echo "ERROR: Failed to find admin by email.\n";
        exit(1);
    }

    $passCorrect = password_verify("password123", $adminRecord['password_hash']);
    $passIncorrect = password_verify("wrongpassword", $adminRecord['password_hash']);

    if ($passCorrect && !$passIncorrect) {
        echo "SUCCESS: Password verification works correctly.\n";
    } else {
        echo "ERROR: Password verification failed.\n";
        exit(1);
    }

    echo "=== 5. Testing Session Creation & Validation ===\n";
    $token = $sessionModel->createSession($adminId);
    echo "Created session token: {$token}\n";

    $validUserId = $sessionModel->validateToken($token);
    echo "Validated Token User ID: " . ($validUserId ?: 'null') . "\n";
    if ($validUserId !== $adminId) {
        echo "ERROR: Token validation failed.\n";
        exit(1);
    }
    echo "SUCCESS: Session token validated successfully.\n";

    // Validate a fake token
    $invalidUserId = $sessionModel->validateToken("fake_token_here");
    if ($invalidUserId !== null) {
        echo "ERROR: Fake token validation succeeded.\n";
        exit(1);
    }
    echo "SUCCESS: Fake token rejected correctly.\n";

    echo "=== 6. Testing Session Revocation ===\n";
    $sessionModel->revokeToken($token);
    $revokedUserId = $sessionModel->validateToken($token);
    if ($revokedUserId !== null) {
        echo "ERROR: Revoked token still validated successfully.\n";
        exit(1);
    }
    echo "SUCCESS: Revoked token rejected correctly.\n";

    echo "=== 7. Testing Audit Logging ===\n";
    $action = "test_run_security_check";
    AuditLog::write($adminId, $action, "admin_users", $adminId, ["status" => "success", "agent" => "cli-test"]);

    // Query back audit logs
    $stmtAudit = $db->prepare("SELECT * FROM admin_audit_logs WHERE action = :action ORDER BY id DESC LIMIT 1");
    $stmtAudit->execute([':action' => $action]);
    $log = $stmtAudit->fetch(PDO::FETCH_ASSOC);

    if ($log) {
        echo "Fetched Audit Log ID: {$log['id']}\n";
        echo "Log metadata: {$log['metadata_json']}\n";
        $meta = json_decode($log['metadata_json'], true);
        if ($meta['status'] === 'success') {
            echo "SUCCESS: Audit log written and verified correctly.\n";
        } else {
            echo "ERROR: Audit log metadata mismatch.\n";
            exit(1);
        }
    } else {
        echo "ERROR: Audit log not found in database.\n";
        exit(1);
    }

    // Clean up test data
    $db->exec("DELETE FROM admin_users WHERE email LIKE '%@test-admin.vn'");
    echo "=== ALL ADMIN SECURITY TESTS PASSED SUCCESSFULLY ===\n";

} catch (\Throwable $e) {
    echo "ERROR during tests: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
