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
        $code = Request::query('code');
        $shopId = Request::query('shop_id');
        $state = Request::query('state');

        // If parameters are missing, return 400 JSON for direct manual access
        if (empty($code) || empty($shopId) || empty($state)) {
            Response::json([
                "success" => false,
                "message" => "Missing code, shop_id, or state in callback request"
            ], 400);
            return;
        }

        try {
            // Validate OAuth state
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

            // Exchange code for tokens
            $res = $this->shopeeService->getAccessToken($code, $shopId);
            $data = $res['data'];

            // Handle API level error from Shopee response
            if (!empty($data['error'])) {
                throw new Exception("Shopee API Error: " . ($data['message'] ?? $data['error']));
            }

            if (empty($data['access_token']) || empty($data['refresh_token'])) {
                throw new Exception("Failed to retrieve access token from Shopee response");
            }

            // Fetch shop info to get shop name if possible
            $shopName = null;
            try {
                $shopInfoRes = $this->shopeeService->request('/api/v2/shop/get_shop_info', 'GET', [], $data['access_token'], $shopId);
                if (isset($shopInfoRes['data']['response']['shop_name'])) {
                    $shopName = $shopInfoRes['data']['response']['shop_name'];
                }
            } catch (Exception $e) {
                // Ignore shop info fetching error to prevent blocking callback
                error_log("Shopee shop info fetch failed: " . $e->getMessage());
            }

            $expireIn = (int)$data['expire_in'];
            $accessTokenExpireAt = date('Y-m-d H:i:s', time() + $expireIn);
            $refreshTokenExpireAt = date('Y-m-d H:i:s', time() + 30 * 86400); // 30 days default

            // Save tokens to database
            $this->tokenModel->upsertToken([
                'shop_id'                 => $shopId,
                'shop_name'               => $shopName,
                'access_token'            => $data['access_token'],
                'refresh_token'           => $data['refresh_token'],
                'access_token_expire_at'  => $accessTokenExpireAt,
                'refresh_token_expire_at' => $refreshTokenExpireAt,
                'is_active'               => 1
            ]);

            // Redirect back to frontend
            $config = require dirname(__DIR__, 2) . '/config/config.php';
            $publicUrl = rtrim($config['app']['public_url'], '/');
            $redirectUrl = $publicUrl . '/admin/3f-club?shopee=connected';

            header("Location: " . $redirectUrl);
            exit;

        } catch (Exception $e) {
            // Log server-side
            error_log("Shopee OAuth Callback Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());

            // Redirect to error page
            $config = require dirname(__DIR__, 2) . '/config/config.php';
            $publicUrl = rtrim($config['app']['public_url'], '/');
            $redirectUrl = $publicUrl . '/admin/3f-club?shopee=error';

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
