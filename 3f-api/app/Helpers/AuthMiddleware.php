<?php
namespace App\Helpers;

use App\Core\Request;
use App\Core\Response;
use App\Models\AdminSession;
use App\Models\AdminUser;

class AuthMiddleware {
    private static $currentAdmin = null;

    /**
     * Robust helper to retrieve all HTTP headers.
     */
    private static function getHeaders() {
        if (function_exists('getallheaders')) {
            return getallheaders();
        }
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (strpos($name, 'HTTP_') === 0) {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            } elseif ($name === 'CONTENT_TYPE') {
                $headers['Content-Type'] = $value;
            } elseif ($name === 'CONTENT_LENGTH') {
                $headers['Content-Length'] = $value;
            }
        }
        return $headers;
    }

    /**
     * Enforce admin authentication.
     */
    public static function requireAdmin() {
        if (self::$currentAdmin !== null) {
            return self::$currentAdmin;
        }

        $headers = self::getHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        $source = 'headers';
        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            $source = 'server_http_authorization';
        }
        if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            $source = 'server_redirect_http_authorization';
        }

        $token = '';
        if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
        }

        // Fallback to X-Admin-Token header if Authorization is stripped by Apache/Nginx
        if (empty($token)) {
            $customToken = $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? '';
            if (!empty($customToken)) {
                $token = trim($customToken);
                $source = 'x-admin-token';
            } elseif (isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
                $token = trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
                $source = 'server_x_admin_token';
            }
        }

        // Prepare diagnostic debug logs
        $logDir = dirname(__DIR__, 2) . '/storage/logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0775, true);
        }
        $logFile = $logDir . '/auth_debug.log';
        $logData = [
            'time' => date('Y-m-d H:i:s'),
            'uri' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? '',
            'has_auth_header' => !empty($authHeader),
            'auth_header_source' => $source,
            'token_length' => strlen($token),
            'token_preview' => !empty($token) ? substr($token, 0, 6) . '...' : 'empty',
            'getallheaders_keys' => array_keys($headers),
            'server_keys' => array_keys($_SERVER),
            'status' => 'pending'
        ];

        if (empty($token)) {
            $logData['status'] = 'no_token';
            @file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);
            Response::json([
                "success" => false, 
                "message" => "Unauthorized: Token missing", 
                "debug" => $logData
            ], 401);
        }

        $sessionModel = new AdminSession();
        $adminUserId = $sessionModel->validateToken($token);

        if (!$adminUserId) {
            $logData['status'] = 'invalid_session_or_expired';
            @file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);
            Response::json([
                "success" => false, 
                "message" => "Unauthorized: Invalid or expired token", 
                "debug" => $logData
            ], 401);
        }

        $userModel = new AdminUser();
        $admin = $userModel->findById($adminUserId);

        if (!$admin) {
            $logData['status'] = 'user_not_found';
            @file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);
            Response::json([
                "success" => false, 
                "message" => "Unauthorized: User not found", 
                "debug" => $logData
            ], 401);
        }

        $logData['status'] = 'success';
        $logData['user_id'] = $adminUserId;
        @file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);

        self::$currentAdmin = $admin;
        return $admin;
    }

    /**
     * Get currently authenticated admin user, if any.
     */
    public static function getCurrentAdmin() {
        return self::$currentAdmin;
    }
}
