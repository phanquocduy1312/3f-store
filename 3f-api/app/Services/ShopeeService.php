<?php
namespace App\Services;

class ShopeeService {
    private $env;
    private $partnerId;
    private $partnerKey;
    private $redirectUrl;
    private $baseUrl;

    public function __construct() {
        $config = require dirname(__DIR__, 2) . '/config/config.php';
        $shopeeConfig = $config['shopee'];

        $this->env         = $shopeeConfig['env'];
        $this->partnerId   = (int)$shopeeConfig['partner_id'];
        $this->partnerKey  = $shopeeConfig['partner_key'];
        $this->redirectUrl = $shopeeConfig['redirect_url'];
        $this->baseUrl     = rtrim($shopeeConfig['base_url'], '/');
    }

    /**
     * Generates a Shopee API v2 HMAC-SHA256 signature.
     *
     * @param string $path
     * @param int $timestamp
     * @param string|null $accessToken
     * @param string|int|null $shopId
     * @return string
     */
    public function generateSign($path, $timestamp, $accessToken = null, $shopId = null) {
        $baseStr = $this->partnerId . $path . $timestamp;
        if ($accessToken !== null && $shopId !== null) {
            $baseStr .= $accessToken . $shopId;
        }
        return hash_hmac('sha256', $baseStr, $this->partnerKey);
    }

    /**
     * Builds the authorization URL using provided state.
     *
     * @param string $state
     * @return string
     */
    public function buildAuthorizeUrl($state) {
        $path = '/api/v2/shop/auth_partner';
        $timestamp = time();
        $sign = $this->generateSign($path, $timestamp);

        $params = [
            'partner_id' => (int)$this->partnerId,
            'timestamp'  => $timestamp,
            'sign'       => $sign,
            'redirect'   => $this->redirectUrl,
            'state'      => $state
        ];

        return $this->baseUrl . $path . '?' . http_build_query($params);
    }

    /**
     * Exchanges code and shop_id for access and refresh tokens.
     *
     * @param string $code
     * @param string|int $shopId
     * @return array
     */
    public function getAccessToken($code, $shopId) {
        $path = '/api/v2/auth/token/get';
        $body = [
            'code'       => $code,
            'partner_id' => (int)$this->partnerId,
            'shop_id'    => (int)$shopId
        ];
        return $this->request($path, 'POST', $body);
    }

    /**
     * Refreshes the Shopee access token.
     *
     * @param string|int $shopId
     * @return array The updated token array
     * @throws \Exception
     */
    public function refreshAccessToken($shopId) {
        $tokenModel = new \App\Models\ShopeeTokenModel();
        $token = $tokenModel->findByShopId($shopId);
        if (!$token) {
            throw new \Exception("No Shopee token found for shop_id: " . $shopId);
        }

        $path = '/api/v2/auth/access_token/get';
        $body = [
            'refresh_token' => $token['refresh_token'],
            'partner_id'    => (int)$this->partnerId,
            'shop_id'       => (int)$shopId
        ];
        
        $res = $this->request($path, 'POST', $body);
        $data = $res['data'];
        
        if (!empty($data['error'])) {
            throw new \Exception("Shopee API refresh error: " . ($data['message'] ?? $data['error']));
        }
        if (empty($data['access_token']) || empty($data['refresh_token'])) {
            throw new \Exception("Failed to refresh Shopee token: missing tokens in API response.");
        }

        $expireIn = (int)$data['expire_in'];
        $accessTokenExpireAt = date('Y-m-d H:i:s', time() + $expireIn);
        $refreshTokenExpireAt = date('Y-m-d H:i:s', time() + 30 * 86400); // 30 days default

        $updatedData = [
            'shop_id'                 => (string)$shopId,
            'access_token'            => $data['access_token'],
            'refresh_token'           => $data['refresh_token'],
            'access_token_expire_at'  => $accessTokenExpireAt,
            'refresh_token_expire_at' => $refreshTokenExpireAt,
            'is_active'               => 1
        ];

        $tokenModel->upsertToken($updatedData);
        return $updatedData;
    }

    /**
     * Retrieves shop info.
     *
     * @param string|int $shopId
     * @return array
     */
    public function getShopInfo($shopId) {
        $token = $this->getValidToken($shopId);
        $path = '/api/v2/shop/get_shop_info';
        
        return $this->request($path, 'GET', [], $token['access_token'], $shopId);
    }

    /**
     * Retrieves order details.
     *
     * @param string|int $shopId
     * @param string $orderSn
     * @return array
     */
    public function getOrderDetail($shopId, $orderSn) {
        $token = $this->getValidToken($shopId);
        $path = '/api/v2/order/get_order_detail';
        
        $params = [
            'order_sn_list'            => $orderSn,
            'response_optional_fields' => 'total_amount,order_status,pay_time'
        ];
        
        return $this->request($path, 'GET', $params, $token['access_token'], $shopId);
    }

    /**
     * Helper to get a valid token, refreshing if expiring in less than 5 minutes.
     *
     * @param string|int $shopId
     * @return array
     * @throws \Exception
     */
    private function getValidToken($shopId) {
        $tokenModel = new \App\Models\ShopeeTokenModel();
        $token = $tokenModel->findByShopId($shopId);
        if (!$token) {
            throw new \Exception("No active Shopee token found for shop_id: " . $shopId);
        }

        $expireTimestamp = strtotime($token['access_token_expire_at']);
        if ($expireTimestamp <= time() + 300) {
            $this->refreshAccessToken($shopId);
            return $tokenModel->findByShopId($shopId);
        }

        return $token;
    }

    /**
     * Performs a request to the Shopee Open Platform API.
     *
     * @param string $path
     * @param string $method
     * @param array $body
     * @param string|null $accessToken
     * @param string|int|null $shopId
     * @return array
     * @throws \Exception
     */
    public function request($path, $method, $body = [], $accessToken = null, $shopId = null) {
        $timestamp = time();
        $sign = $this->generateSign($path, $timestamp, $accessToken, $shopId);

        $queryParams = [
            'partner_id' => (int)$this->partnerId,
            'timestamp'  => $timestamp,
            'sign'       => $sign
        ];

        if ($accessToken !== null) {
            $queryParams['access_token'] = $accessToken;
        }
        if ($shopId !== null) {
            $queryParams['shop_id'] = (int)$shopId;
        }

        if (strtoupper($method) === 'GET' && is_array($body) && !empty($body)) {
            $queryParams = array_merge($queryParams, $body);
            $body = [];
        }

        $url = $this->baseUrl . $path . '?' . http_build_query($queryParams);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $headers = ['Content-Type: application/json'];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if (!empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \Exception("Shopee API Curl error: " . $error);
        }

        $responseData = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Shopee API invalid JSON response: " . $response);
        }

        return [
            'status' => $httpCode,
            'data' => $responseData
        ];
    }
}
