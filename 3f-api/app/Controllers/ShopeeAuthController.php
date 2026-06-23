<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Services\ShopeeService;
use App\Models\ShopeeTokenModel;
use App\Models\ShopeeOauthStateModel;
use App\Helpers\AuthMiddleware;
use Exception;

class ShopeeAuthController {
    private $shopeeService;
    private $tokenModel;

    public function __construct() {
        $this->shopeeService = new ShopeeService();
        $this->tokenModel = new ShopeeTokenModel();
    }

    /**
     * GET /api/admin/shopee/connect
     * Initiates the Shopee OAuth flow for admin.
     */
    public function connect() {
        try {
            // Require admin authentication
            $admin = AuthMiddleware::requireAdmin();

            // Generate a random state
            $state = bin2hex(random_bytes(16));

            // Save state to shopee_oauth_states
            $stateModel = new ShopeeOauthStateModel();
            $stateModel->createState($state, $admin['id']);

            // Generate authorization URL
            $authorizeUrl = $this->shopeeService->buildAuthorizeUrl($state);

            Response::json([
                "success" => true,
                "data" => [
                    "authorizeUrl" => $authorizeUrl
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Failed to generate connect URL: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/shopee/callback
     * Receives Shopee's authorization callback containing code, shop_id, and state.
     */
    public function callback() {
        $code = Request::query('code') ?? $_GET['code'] ?? null;
        $shopId = Request::query('shop_id') ?? $_GET['shop_id'] ?? null;
        $state = Request::query('state') ?? $_GET['state'] ?? null;
        $mainAccountId = Request::query('main_account_id') ?? $_GET['main_account_id'] ?? null;

        error_log("Shopee Callback Keys: " . implode(", ", array_keys($_GET)));
        error_log("Shopee Callback check - code exists: " . (!empty($code) ? "yes" : "no"));
        error_log("Shopee Callback check - shop_id exists: " . (!empty($shopId) ? "yes" : "no"));
        error_log("Shopee Callback check - main_account_id exists: " . (!empty($mainAccountId) ? "yes" : "no"));
        error_log("Shopee Callback check - state exists: " . (!empty($state) ? "yes" : "no"));

        // If parameters are missing, return 400 JSON for direct manual access
        if (empty($code) || (empty($shopId) && empty($mainAccountId))) {
            $receivedKeys = implode(", ", array_keys($_GET));
            Response::json([
                "success" => false,
                "message" => "Missing code or shop_id/main_account_id in callback request",
                "received_keys" => $receivedKeys
            ], 400);
            return;
        }

        try {
            // Validate OAuth state ONLY if provided
            if (!empty($state)) {
                $stateModel = new ShopeeOauthStateModel();
                $stateRecord = $stateModel->findState($state);

                if (!$stateRecord) {
                    throw new Exception("Invalid state: " . $state);
                }

                if ($stateRecord['used_at'] !== null) {
                    throw new Exception("State already used: " . $state);
                }

                if (strtotime($stateRecord['expires_at']) < time()) {
                    throw new Exception("State expired: " . $state);
                }

                // Mark state as used
                $stateModel->markAsUsed($state);
            }

            // Exchange code for tokens
            $res = $this->shopeeService->getAccessToken($code, $shopId, $mainAccountId);
            $data = $res['data'];

            // Handle API level error from Shopee response
            if (!empty($data['error'])) {
                throw new Exception("Shopee API Error: " . ($data['message'] ?? $data['error']));
            }

            if (empty($data['access_token']) || empty($data['refresh_token'])) {
                throw new Exception("Failed to get tokens from Shopee. Data: " . json_encode($data));
            }

            $expireIn = (int)($data['expire_in'] ?? 14400); // Usually 4 hours
            $accessTokenExpireAt = date('Y-m-d H:i:s', time() + $expireIn);
            // Refresh token usually lasts 30 days
            $refreshTokenExpireAt = date('Y-m-d H:i:s', time() + 30 * 86400);

            // Determine the ID to save (either shop_id or main_account_id)
            $shopIdToSave = $shopId ? $shopId : $mainAccountId;

            // Fetch shop info to get shop name if possible
            $shopName = null;
            try {
                // For main_account_id we can't fetch shop_info directly without a shop_id.
                // It's safe to skip shop_info fetch if shopId is missing.
                if ($shopId) {
                    $shopInfoRes = $this->shopeeService->request('/api/v2/shop/get_shop_info', 'GET', [], $data['access_token'], $shopId);
                    if (isset($shopInfoRes['data']['response']['shop_name'])) {
                        $shopName = $shopInfoRes['data']['response']['shop_name'];
                    }
                }
            } catch (Exception $e) {
                // Ignore shop info fetching error to prevent blocking callback
                error_log("Shopee shop info fetch failed: " . $e->getMessage());
            }

            $tokenData = [
                'shop_id'                 => (string)$shopIdToSave,
                'access_token'            => $data['access_token'],
                'refresh_token'           => $data['refresh_token'],
                'access_token_expire_at'  => $accessTokenExpireAt,
                'refresh_token_expire_at' => $refreshTokenExpireAt,
                'is_active'               => 1,
                'shop_name'               => $shopName,
                'environment'             => getenv('SHOPEE_ENV') ?: 'sandbox'
            ];

            // Save tokens to database
            $this->tokenModel->upsertToken($tokenData);

            // Redirect back to frontend
            $config = require dirname(__DIR__, 2) . '/config/config.php';
            $frontendUrl = rtrim($config['shopee']['frontend_redirect_url'] ?? 'https://3f-store.vercel.app/admin/3f-club', '/');
            $redirectUrl = $frontendUrl . '?shopee=connected';

            header("Location: " . $redirectUrl);
            exit;

        } catch (Exception $e) {
            // Log server-side
            error_log("Shopee OAuth Callback Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());

            // Redirect to error page
            $config = require dirname(__DIR__, 2) . '/config/config.php';
            $frontendUrl = rtrim($config['shopee']['frontend_redirect_url'] ?? 'https://3f-store.vercel.app/admin/3f-club', '/');
            $redirectUrl = $frontendUrl . '?shopee=error';

            header("Location: " . $redirectUrl);
            exit;
        }
    }

    /**
     * GET /api/admin/shopee/connection-status
     * Checks if the shop is currently connected and returns connection info.
     */
    public function connectionStatus() {
        try {
            // Require admin auth
            AuthMiddleware::requireAdmin();

            $latest = $this->tokenModel->getLatestToken();
            if ($latest) {
                Response::json([
                    "success" => true,
                    "data" => [
                        "connected"      => true,
                        "shopId"         => $latest['shop_id'],
                        "shopName"       => $latest['shop_name'],
                        "environment"    => $latest['environment'] ?? 'sandbox',
                        "tokenExpiredAt" => $latest['access_token_expire_at']
                    ]
                ], 200);
            } else {
                Response::json([
                    "success" => true,
                    "data" => [
                        "connected" => false
                    ]
                ], 200);
            }
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Failed to fetch connection status: " . $e->getMessage()
            ], 500);
        }
    }
}
