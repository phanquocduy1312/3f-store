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
use App\Controllers\ShopeeVerifyController;
use App\Controllers\LoyaltyController;
use App\Controllers\ProductController;

try {
    // 0. Pre-instantiate models to run database migrations outside of transactions
    new \App\Models\ShopeePointRequest();
    new \App\Models\LoyaltyPointRuleModel();
    new \App\Models\LoyaltyRewardModel();
    new \App\Models\LoyaltyRewardRedemptionModel();
    new \App\Models\CustomerPointTransactionModel();
    new \App\Models\LoyaltyProductionModel();
    new \App\Models\Product();

    // 3. Initialize Router
    $router = new Router();

    // 4. Register Routes
    $router->post("/api/shopee/order-scan", [ShopeeOrderScanController::class, "scan"]);
    $router->post("/api/shopee/requests", [ShopeePointRequestController::class, "create"]);
    $router->get("/api/admin/shopee/requests", [ShopeePointRequestController::class, "list"]);
    $router->get("/api/admin/shopee/requests/detail", [ShopeePointRequestController::class, "detail"]);
    $router->post("/api/admin/shopee/requests/approve", [ShopeePointRequestController::class, "approve"]);
    $router->post("/api/admin/shopee/requests/reject", [ShopeePointRequestController::class, "reject"]);
    $router->post("/api/admin/shopee/requests/verify", [ShopeeVerifyController::class, "verify"]);
    $router->post("/api/admin/shopee/requests/verify-bulk", [ShopeeVerifyController::class, "verifyBulk"]);
    $router->get("/api/customer/points", [CustomerPointController::class, "points"]);

    // Product Catalog Routes
    $router->get("/api/products", [ProductController::class, "list"]);
    $router->get("/api/products/detail", [ProductController::class, "detail"]);
    $router->get("/api/product-categories", [ProductController::class, "categories"]);
    $router->get("/api/admin/products", [ProductController::class, "adminList"]);
    $router->get("/api/admin/products/detail", [ProductController::class, "adminDetail"]);
    $router->post("/api/admin/products/save", [ProductController::class, "adminSave"]);
    $router->post("/api/admin/products/toggle-active", [ProductController::class, "adminToggleActive"]);

    // Shopee OAuth Sandbox Routes
    $router->get("/api/admin/shopee/auth-url", [ShopeeAuthController::class, "getAuthUrl"]);
    $router->get("/api/shopee/callback", [ShopeeAuthController::class, "callback"]);
    $router->get("/api/admin/shopee/connection-status", [ShopeeAuthController::class, "connectionStatus"]);

    // Loyalty Rule Config Routes
    $router->get("/api/admin/loyalty/point-rules", [LoyaltyController::class, "list"]);
    $router->post("/api/admin/loyalty/point-rules", [LoyaltyController::class, "create"]);
    $router->post("/api/admin/loyalty/point-rules/update", [LoyaltyController::class, "update"]);
    $router->post("/api/admin/loyalty/point-rules/deactivate", [LoyaltyController::class, "deactivate"]);
    $router->post("/api/admin/loyalty/calculate-preview", [LoyaltyController::class, "calculatePreview"]);

    // Loyalty Rewards & Redemptions Routes
    $router->get("/api/admin/loyalty/rewards", [LoyaltyController::class, "listRewards"]);
    $router->get("/api/admin/loyalty/rewards/detail", [LoyaltyController::class, "rewardDetail"]);
    $router->post("/api/admin/loyalty/rewards", [LoyaltyController::class, "createReward"]);
    $router->post("/api/admin/loyalty/rewards/upload-image", [LoyaltyController::class, "uploadRewardImage"]);
    $router->post("/api/admin/loyalty/rewards/update", [LoyaltyController::class, "updateReward"]);
    $router->post("/api/admin/loyalty/rewards/deactivate", [LoyaltyController::class, "deactivateReward"]);
    $router->post("/api/admin/loyalty/rewards/toggle-active", [LoyaltyController::class, "toggleRewardActive"]);
    $router->post("/api/admin/loyalty/rewards/import-vouchers", [LoyaltyController::class, "importRewardVouchers"]);
    $router->get("/api/admin/loyalty/rewards/vouchers", [LoyaltyController::class, "listRewardVouchers"]);
    $router->get("/api/loyalty/rewards", [LoyaltyController::class, "listActiveRewards"]);
    $router->post("/api/loyalty/rewards/redeem", [LoyaltyController::class, "redeem"]);
    $router->get("/api/admin/loyalty/redemptions", [LoyaltyController::class, "listRedemptions"]);
    $router->post("/api/admin/loyalty/redemptions/approve", [LoyaltyController::class, "approveRedemption"]);
    $router->post("/api/admin/loyalty/redemptions/reject", [LoyaltyController::class, "rejectRedemption"]);
    $router->post("/api/admin/loyalty/redemptions/fulfill", [LoyaltyController::class, "fulfillRedemption"]);
    $router->get("/api/admin/loyalty/transactions", [LoyaltyController::class, "listTransactionsAdmin"]);
    $router->get("/api/loyalty/transactions", [LoyaltyController::class, "listTransactionsClient"]);
    $router->get("/api/admin/loyalty/voucher-pool", [LoyaltyController::class, "listVoucherPool"]);
    $router->post("/api/admin/loyalty/voucher-pool/import", [LoyaltyController::class, "importVoucherPool"]);
    $router->get("/api/admin/loyalty/tiers", [LoyaltyController::class, "listTiers"]);
    $router->post("/api/admin/loyalty/tiers/save", [LoyaltyController::class, "saveTier"]);
    $router->post("/api/admin/loyalty/tiers/active", [LoyaltyController::class, "setTierActive"]);
    $router->get("/api/admin/loyalty/tiers/preview", [LoyaltyController::class, "previewTier"]);
    $router->get("/api/admin/loyalty/campaigns", [LoyaltyController::class, "listCampaigns"]);
    $router->post("/api/admin/loyalty/campaigns/save", [LoyaltyController::class, "saveCampaign"]);
    $router->post("/api/admin/loyalty/campaigns/active", [LoyaltyController::class, "setCampaignActive"]);
    $router->post("/api/admin/loyalty/preview-points", [LoyaltyController::class, "previewPointsProduction"]);
    $router->get("/api/admin/loyalty/analytics", [LoyaltyController::class, "analytics"]);
    $router->get("/api/admin/customers/loyalty", [LoyaltyController::class, "customerLoyaltyProfile"]);
    $router->get("/api/customer/tier", [LoyaltyController::class, "customerTier"]);
    $router->get("/api/customer/rewards/history", [LoyaltyController::class, "customerRewardHistory"]);

    // 5. Dispatch Request
    $router->dispatch();

} catch (\Throwable $e) {
    // Fallback JSON error boundary to prevent leaking raw PHP logs
    Response::json([
        "success" => false,
        "message" => "Internal Server Error: " . $e->getMessage()
    ], 500);
}
