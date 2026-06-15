<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Services\ShopeeApiService;
use App\Models\ShopeeTokenModel;
use Exception;

class ShopeeAuthController {
    private $shopeeService;
    private $tokenModel;

    public function __construct() {
        $this->shopeeService = new ShopeeApiService();
        $this->tokenModel = new ShopeeTokenModel();
    }

    /**
     * GET /api/admin/shopee/auth-url
     * Generates a Shopee authorization link for admin.
     */
    public function getAuthUrl() {
        try {
            $url = $this->shopeeService->generateAuthUrl();
            Response::json([
                "success" => true,
                "data" => [
                    "url" => $url
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Failed to generate authorization URL: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/shopee/callback
     * Receives Shopee's authorization callback containing code and shop_id.
     */
    public function callback() {
        $code = Request::query('code');
        $shopId = Request::query('shop_id');

        if (empty($code) || empty($shopId)) {
            Response::json([
                "success" => false,
                "message" => "Missing code or shop_id in callback request"
            ], 400);
            return;
        }

        try {
            // Exchange code for tokens
            $res = $this->shopeeService->exchangeCodeForToken($code, $shopId);
            $data = $res['data'];

            // Handle API level error from Shopee response
            if (!empty($data['error'])) {
                Response::json([
                    "success" => false,
                    "message" => "Shopee API Error: " . ($data['message'] ?? $data['error'])
                ], 400);
                return;
            }

            if (empty($data['access_token']) || empty($data['refresh_token'])) {
                Response::json([
                    "success" => false,
                    "message" => "Failed to retrieve access token from Shopee response"
                ], 400);
                return;
            }

            // Save tokens to database
            $config = require dirname(__DIR__, 2) . '/config/config.php';
            $partnerId = $config['shopee']['partner_id'];
            $expireIn = (int)$data['expire_in'];
            $tokenExpiredAt = date('Y-m-d H:i:s', time() + $expireIn);

            $this->tokenModel->upsertToken([
                'shop_id'          => $shopId,
                'partner_id'       => $partnerId,
                'access_token'     => $data['access_token'],
                'refresh_token'    => $data['refresh_token'],
                'expire_in'        => $expireIn,
                'token_expired_at' => $tokenExpiredAt
            ]);

            Response::json([
                "success" => true,
                "message" => "Shopee shop connected successfully",
                "data" => [
                    "shopId"         => $shopId,
                    "tokenExpiredAt" => $tokenExpiredAt
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Callback handling failed: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/shopee/connection-status
     * Checks if the shop is currently connected and returns connection info.
     */
    public function connectionStatus() {
        try {
            $latest = $this->tokenModel->getLatestToken();
            if ($latest) {
                Response::json([
                    "success" => true,
                    "data" => [
                        "connected"      => true,
                        "shopId"         => $latest['shop_id'],
                        "tokenExpiredAt" => $latest['token_expired_at']
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
