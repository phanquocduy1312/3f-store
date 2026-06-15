<?php
/**
 * Mini MVC PHP Pure Backend - Entry Point
 */

// Prevent raw PHP HTML errors from leaking into JSON response
ini_set('display_errors', '0');
error_reporting(E_ALL);

set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new \ErrorException($message, 0, $severity, $file, $line);
});

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
            if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'(.*)'$/", $val, $matches)) {
                $val = $matches[1];
            }
            $val = trim($val);
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// 1. Load CORS
require_once dirname(__DIR__) . '/app/Helpers/cors.php';

// 2. Simple Autoloader mapping App\... namespace to app/... directory
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Router;
use App\Core\Response;
use App\Controllers\ShopeeOrderScanController;
use App\Controllers\ShopeePointRequestController;
use App\Controllers\CustomerPointController;
use App\Controllers\ShopeeAuthController;

try {
    // 3. Initialize Router
    $router = new Router();

    // 4. Register Routes
    $router->post("/api/shopee/order-scan", [ShopeeOrderScanController::class, "scan"]);
    $router->post("/api/shopee/requests", [ShopeePointRequestController::class, "create"]);
    $router->get("/api/admin/shopee/requests", [ShopeePointRequestController::class, "list"]);
    $router->get("/api/admin/shopee/requests/detail", [ShopeePointRequestController::class, "detail"]);
    $router->post("/api/admin/shopee/requests/approve", [ShopeePointRequestController::class, "approve"]);
    $router->post("/api/admin/shopee/requests/reject", [ShopeePointRequestController::class, "reject"]);
    $router->get("/api/customer/points", [CustomerPointController::class, "points"]);

    // Shopee OAuth Sandbox Routes
    $router->get("/api/admin/shopee/auth-url", [ShopeeAuthController::class, "getAuthUrl"]);
    $router->get("/api/shopee/callback", [ShopeeAuthController::class, "callback"]);
    $router->get("/api/admin/shopee/connection-status", [ShopeeAuthController::class, "connectionStatus"]);

    // 5. Dispatch Request
    $router->dispatch();

} catch (\Throwable $e) {
    // Fallback JSON error boundary to prevent leaking raw PHP logs
    Response::json([
        "success" => false,
        "message" => "Internal Server Error: " . $e->getMessage()
    ], 500);
}
