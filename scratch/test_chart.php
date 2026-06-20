<?php
// Load dotenv
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

// Bootstrap framework classes
require_once __DIR__ . '/../3f-api/app/Core/Database.php';
require_once __DIR__ . '/../3f-api/app/Core/Request.php';
require_once __DIR__ . '/../3f-api/app/Core/Response.php';

// Mock AuthMiddleware so it doesn't fail
class AuthMock {
    public static function requireAdmin() {
        return ['id' => 1];
    }
}
class_alias('AuthMock', 'App\Helpers\AuthMiddleware');

require_once __DIR__ . '/../3f-api/app/Controllers/AdminDashboardController.php';

use App\Controllers\AdminDashboardController;

// Create controller and call the method
$_GET['filter'] = 'this_month';
$controller = new AdminDashboardController();

echo "=== TESTING filter=this_month ===\n";
try {
    // We override Response::json to print output
    class ResponseOverride {
        public static function json($data, $status = 200) {
            echo "Status: $status\n";
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }
    }
    class_alias('ResponseOverride', 'App\Core\Response');
    
    $controller->getRevenueChart();
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
