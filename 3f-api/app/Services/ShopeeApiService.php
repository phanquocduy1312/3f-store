<?php
namespace App\Services;

class ShopeeApiService {
    private $env;
    private $partnerId;
    private $partnerKey;
    private $redirectUrl;
    private $baseUrl;

    public function __construct() {
        $config = require dirname(__DIR__, 2) . '/config/config.php';
        $shopeeConfig = $config['shopee'];

        $this->env         = $shopeeConfig['env'];
        $this->partnerId   = $shopeeConfig['partner_id'];
        $this->partnerKey  = $shopeeConfig['partner_key'];
        $this->redirectUrl = $shopeeConfig['redirect_url'];
        $this->baseUrl     = rtrim($shopeeConfig['base_url'], '/');
    }

    /**
     * Generates a Shopee API v2 HMAC-SHA256 signature.
     *
     * @param string $path The API path (e.g. /api/v2/shop/auth_partner)
     * @param int $timestamp Current Unix timestamp
     * @param string|null $accessToken Required for shop-level APIs
     * @param string|int|null $shopId Required for shop-level APIs
     * @return string hex-encoded signature
     */
    public function generateSign($path, $timestamp, $accessToken = null, $shopId = null) {
        $baseStr = $this->partnerId . $path . $timestamp;
        if ($accessToken !== null && $shopId !== null) {
            $baseStr .= $accessToken . $shopId;
        }
        return hash_hmac('sha256', $baseStr, $this->partnerKey);
    }

    /**
     * Generates the Shopee authorization URL for admin shop connection.
     *
     * @return string
     */
    public function generateAuthUrl() {
        $path = '/api/v2/shop/auth_partner';
        $timestamp = time();
        $sign = $this->generateSign($path, $timestamp);

        $params = [
            'partner_id' => (int)$this->partnerId,
            'timestamp'  => $timestamp,
            'sign'       => $sign,
            'redirect'   => $this->redirectUrl
        ];

        $url = $this->baseUrl . $path . '?' . http_build_query($params);

        // Safe debug log for generating authorization URL
        $this->logDebug([
            'action'        => 'generate_auth_url',
            'env'           => $this->env,
            'base_url'      => $this->baseUrl,
            'path'          => $path,
            'partner_id'    => $this->partnerId,
            'timestamp'     => $timestamp,
            'base_string'   => $this->partnerId . $path . $timestamp,
            'sign'          => $sign,
            'request_url'   => $url
        ]);

        return $url;
    }

    /**
     * Exchanges code and shop_id for access and refresh tokens.
     *
     * @param string $code
     * @param string|int $shopId
     * @return array
     */
    public function exchangeCodeForToken($code, $shopId) {
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
     * @param string $refreshToken
     * @param string|int $shopId
     * @return array
     */
    public function refreshAccessToken($refreshToken, $shopId) {
        $path = '/api/v2/auth/access_token/get';
        $body = [
            'refresh_token' => $refreshToken,
            'partner_id'    => (int)$this->partnerId,
            'shop_id'       => (int)$shopId
        ];
        return $this->request($path, 'POST', $body);
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

        // Merge extra query parameters if method is GET and body contains them
        if (strtoupper($method) === 'GET' && is_array($body) && !empty($body)) {
            $queryParams = array_merge($queryParams, $body);
            $body = [];
        }

        $url = $this->baseUrl . $path . '?' . http_build_query($queryParams);

        $baseStr = $this->partnerId . $path . $timestamp;
        if ($accessToken !== null && $shopId !== null) {
            $baseStr .= $accessToken . $shopId;
        }

        $logData = [
            'action'        => 'api_request',
            'env'           => $this->env,
            'base_url'      => $this->baseUrl,
            'path'          => $path,
            'partner_id'    => $this->partnerId,
            'timestamp'     => $timestamp,
            'base_string'   => $baseStr,
            'sign'          => $sign,
            'request_url'   => $url,
            'body'          => $body,
            'response'      => null,
            'curl_error'    => null,
            'http_code'     => null
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        // Disable SSL checks for local testing / sandbox UAT
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
            $logData['curl_error'] = $error;
            $this->logDebug($logData);
            throw new \Exception("Shopee API Curl error: " . $error);
        }

        $responseData = json_decode($response, true);
        $logData['http_code'] = $httpCode;
        $logData['response'] = $responseData ?: $response;
        $this->logDebug($logData);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Shopee API invalid JSON response: " . $response);
        }

        return [
            'status' => $httpCode,
            'data' => $responseData
        ];
    }

    /**
     * Securely logs Shopee API details to storage/logs/shopee.log.
     *
     * @param array $data
     */
    private function logDebug($data) {
        $logDir = dirname(__DIR__, 2) . '/storage/logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0775, true);
        }
        $logFile = $logDir . '/shopee.log';
        $timestamp = date('Y-m-d H:i:s');

        $maskedData = $data;

        // Mask token keys at root level
        if (isset($maskedData['access_token'])) {
            $maskedData['access_token'] = $this->maskToken($maskedData['access_token']);
        }
        if (isset($maskedData['refresh_token'])) {
            $maskedData['refresh_token'] = $this->maskToken($maskedData['refresh_token']);
        }

        // Mask token keys in body
        if (isset($maskedData['body']) && is_array($maskedData['body'])) {
            if (isset($maskedData['body']['access_token'])) {
                $maskedData['body']['access_token'] = $this->maskToken($maskedData['body']['access_token']);
            }
            if (isset($maskedData['body']['refresh_token'])) {
                $maskedData['body']['refresh_token'] = $this->maskToken($maskedData['body']['refresh_token']);
            }
        }

        // Mask token keys in response
        if (isset($maskedData['response']) && is_array($maskedData['response'])) {
            if (isset($maskedData['response']['access_token'])) {
                $maskedData['response']['access_token'] = $this->maskToken($maskedData['response']['access_token']);
            }
            if (isset($maskedData['response']['refresh_token'])) {
                $maskedData['response']['refresh_token'] = $this->maskToken($maskedData['response']['refresh_token']);
            }
        }

        // Mask in URL query string
        if (isset($maskedData['request_url'])) {
            $maskedData['request_url'] = $this->maskTokensInUrl($maskedData['request_url']);
        }

        $logMessage = sprintf(
            "[%s] %s\n",
            $timestamp,
            json_encode($maskedData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );
        @file_put_contents($logFile, $logMessage, FILE_APPEND);
    }

    /**
     * Helper to mask a token, showing only first and last few characters.
     *
     * @param string $token
     * @return string
     */
    private function maskToken($token) {
        if (empty($token)) return $token;
        $len = strlen($token);
        if ($len <= 8) return str_repeat('*', $len);
        return substr($token, 0, 4) . str_repeat('*', $len - 8) . substr($token, -4);
    }

    /**
     * Helper to mask query string tokens in URL.
     *
     * @param string $url
     * @return string
     */
    private function maskTokensInUrl($url) {
        $parts = parse_url($url);
        if (empty($parts['query'])) {
            return $url;
        }
        parse_str($parts['query'], $query);
        if (isset($query['access_token'])) {
            $query['access_token'] = $this->maskToken($query['access_token']);
        }
        if (isset($query['refresh_token'])) {
            $query['refresh_token'] = $this->maskToken($query['refresh_token']);
        }
        $newQuery = http_build_query($query);
        $scheme = isset($parts['scheme']) ? $parts['scheme'] . '://' : '';
        $host = isset($parts['host']) ? $parts['host'] : '';
        $port = isset($parts['port']) ? ':' . $parts['port'] : '';
        $path = isset($parts['path']) ? $parts['path'] : '';
        return $scheme . $host . $port . $path . '?' . $newQuery;
    }

    /**
     * Retrieves the latest valid token from database, refreshing it if expired or close to expiration.
     *
     * @return array
     * @throws \Exception
     */
    public function getLatestValidToken() {
        $tokenModel = new \App\Models\ShopeeTokenModel();
        $token = $tokenModel->getLatestToken();
        if (!$token) {
            throw new \Exception("No active Shopee token found in database.");
        }

        $expireTimestamp = strtotime($token['access_token_expire_at']);
        if ($expireTimestamp <= time() + 300) {
            $res = $this->refreshAccessToken($token['refresh_token'], $token['shop_id']);
            $data = $res['data'];
            
            if (!empty($data['error'])) {
                throw new \Exception("Failed to refresh Shopee token: " . ($data['message'] ?? $data['error']));
            }
            if (empty($data['access_token']) || empty($data['refresh_token'])) {
                throw new \Exception("Failed to refresh Shopee token: access_token or refresh_token is missing in response.");
            }

            $expireIn = (int)$data['expire_in'];
            $accessTokenExpireAt = date('Y-m-d H:i:s', time() + $expireIn);
            $refreshTokenExpireAt = date('Y-m-d H:i:s', time() + 30 * 86400); // 30 days default

            $updatedData = [
                'shop_id'                 => $token['shop_id'],
                'access_token'            => $data['access_token'],
                'refresh_token'           => $data['refresh_token'],
                'access_token_expire_at'  => $accessTokenExpireAt,
                'refresh_token_expire_at' => $refreshTokenExpireAt,
                'is_active'               => 1
            ];

            $tokenModel->upsertToken($updatedData);
            $token = $tokenModel->findByShopId($token['shop_id']);
        }

        return $token;
    }

    /**
     * Looks up order detail from Shopee API.
     *
     * @param string $orderSn
     * @return array|null
     * @throws \Exception
     */
    public function getOrderDetail($orderSn) {
        $token = $this->getLatestValidToken();
        $path = '/api/v2/order/get_order_detail';
        
        $params = [
            'order_sn_list'            => $orderSn,
            'response_optional_fields' => 'total_amount,order_status,pay_time'
        ];
        
        $res = $this->request($path, 'GET', $params, $token['access_token'], $token['shop_id']);
        
        if (isset($res['status']) && $res['status'] === 200 && isset($res['data']['response']['order_list'])) {
            $orderList = $res['data']['response']['order_list'];
            if (!empty($orderList)) {
                return $orderList[0];
            }
        }
        return null;
    }
}
