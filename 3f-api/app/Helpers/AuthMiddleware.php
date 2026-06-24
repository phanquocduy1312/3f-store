<?php
namespace App\Helpers;

use App\Core\Request;
use App\Core\Response;
use App\Models\AdminSession;
use App\Models\AdminUser;
use App\Models\CustomerSession;
use App\Models\Customer;

class AuthMiddleware {
    private static $currentAdmin = null;
    private static $currentCustomer = null;

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

        // Dynamic path-to-permission mapping check
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $path = parse_url($uri, PHP_URL_PATH);
        
        $requiredPerm = null;
        if (strpos($path, '/api/admin/orders') === 0) {
            $requiredPerm = 'orders';
        } elseif (strpos($path, '/api/admin/customers') === 0) {
            $requiredPerm = 'customers';
        } elseif (strpos($path, '/api/admin/pet-advisor') === 0) {
            $requiredPerm = 'pet_advisor';
        } elseif (strpos($path, '/api/admin/3f-club') === 0 || strpos($path, '/api/admin/loyalty') === 0) {
            $requiredPerm = 'club_3f';
        } elseif (strpos($path, '/api/admin/products') === 0) {
            $requiredPerm = 'products';
        } elseif (strpos($path, '/api/admin/product-reviews') === 0) {
            $requiredPerm = 'reviews';
        } elseif (strpos($path, '/api/admin/categories') === 0) {
            $requiredPerm = 'categories';
        } elseif (strpos($path, '/api/admin/banners') === 0) {
            $requiredPerm = 'banners';
        } elseif (strpos($path, '/api/admin/blog-posts') === 0) {
            $requiredPerm = 'news';
        } elseif (strpos($path, '/api/admin/vouchers') === 0) {
            $requiredPerm = 'vouchers';
        } elseif (strpos($path, '/api/admin/analytics') === 0) {
            $requiredPerm = 'analytics';
        } elseif (strpos($path, '/api/admin/workflows') === 0 || strpos($path, '/api/admin/order-shipping-methods') === 0) {
            $requiredPerm = 'orders';
        } elseif (strpos($path, '/api/admin/accounts') === 0 || strpos($path, '/api/admin/roles') === 0) {
            $requiredPerm = 'accounts';
        }
        
        if ($requiredPerm !== null && !self::hasPermission($admin, $requiredPerm)) {
            Response::json([
                "success" => false,
                "message" => "Bạn không có quyền thực hiện hành động này (" . $requiredPerm . ")."
            ], 403);
        }

        return $admin;
    }

    /**
     * Get currently authenticated admin user, if any.
     */
    public static function getCurrentAdmin() {
        return self::$currentAdmin;
    }

    /**
     * Extract Bearer token from request headers.
     */
    public static function extractBearerToken() {
        $headers = self::getHeaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }
        if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        // Fallback to X-Customer-Token
        $customToken = $headers['X-Customer-Token'] ?? $headers['x-customer-token'] ?? '';
        if (!empty($customToken)) return trim($customToken);
        if (isset($_SERVER['HTTP_X_CUSTOMER_TOKEN'])) return trim($_SERVER['HTTP_X_CUSTOMER_TOKEN']);

        return null;
    }

    /**
     * Enforce customer authentication.
     */
    public static function requireCustomer() {
        if (self::$currentCustomer !== null) {
            return self::$currentCustomer;
        }

        $token = self::extractBearerToken();

        if (empty($token)) {
            Response::json(['success' => false, 'message' => 'Vui lòng đăng nhập.'], 401);
        }

        $sessionModel = new CustomerSession();
        $customerId = $sessionModel->validateToken($token);

        if (!$customerId) {
            Response::json(['success' => false, 'message' => 'Phiên đăng nhập đã hết hạn.'], 401);
        }

        $customerModel = new Customer();
        $customer = $customerModel->findById($customerId);

        if (!$customer) {
            Response::json(['success' => false, 'message' => 'Tài khoản không tồn tại.'], 401);
        }

        if ($customer['status'] === 'blocked') {
            Response::json(['success' => false, 'message' => 'Tài khoản đã bị khóa.'], 403);
        }

        self::$currentCustomer = $customer;
        return $customer;
    }

    /**
     * Get currently authenticated customer, if any.
     */
    public static function getCurrentCustomer() {
        return self::$currentCustomer;
    }

    /**
     * Optionally get customer if token present, or null.
     */
    public static function getCustomerOptional() {
        $token = self::extractBearerToken();
        if (empty($token)) return null;

        try {
            $sessionModel = new CustomerSession();
            $customerId = $sessionModel->validateToken($token);
            if (!$customerId) return null;

            $customerModel = new Customer();
            return $customerModel->findById($customerId);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Check if current admin user has a specific permission.
     */
    public static function hasPermission($admin, $permission) {
        $role = $admin['role'] ?? 'staff';

        // dev and admin get everything
        if ($role === 'dev' || $role === 'admin') {
            return true;
        }

        // Query permissions from database
        try {
            $db = \App\Core\Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT permissions FROM admin_roles WHERE name = :name LIMIT 1");
            $stmt->execute([':name' => $role]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($row) {
                $perms = json_decode($row['permissions'], true);
                if (is_array($perms)) {
                    return in_array($permission, $perms, true);
                }
            }
        } catch (\Throwable $e) {
            // Fallback to hardcoded defaults in case database query fails
        }

        $rolePermissions = [
            'super_admin' => ["dashboard","orders","customers","pet_advisor","club_3f","products","reviews","categories","banners","news","vouchers","analytics","accounts"],
            'manager' => ["dashboard","orders","customers","pet_advisor","club_3f","products","reviews","categories","banners","news","vouchers","analytics"],
            'editor' => ["dashboard","products","reviews","categories","banners","news","vouchers"],
            'cskh' => ["dashboard","orders","customers","pet_advisor","products","reviews"]
        ];

        $perms = $rolePermissions[$role] ?? [];
        return in_array($permission, $perms, true);
    }

    /**
     * Enforce permission check.
     */
    public static function requirePermission($permission) {
        $admin = self::requireAdmin();
        if (!self::hasPermission($admin, $permission)) {
            Response::json([
                "success" => false,
                "message" => "Bạn không có quyền thực hiện hành động này (" . $permission . ")."
            ], 403);
        }
        return $admin;
    }
}

