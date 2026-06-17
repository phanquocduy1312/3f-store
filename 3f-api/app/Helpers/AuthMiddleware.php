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

        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::json(["success" => false, "message" => "Unauthorized"], 401);
        }

        $token = trim($matches[1]);
        $sessionModel = new AdminSession();
        $adminUserId = $sessionModel->validateToken($token);

        if (!$adminUserId) {
            Response::json(["success" => false, "message" => "Unauthorized"], 401);
        }

        $userModel = new AdminUser();
        $admin = $userModel->findById($adminUserId);

        if (!$admin) {
            Response::json(["success" => false, "message" => "Unauthorized"], 401);
        }

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
