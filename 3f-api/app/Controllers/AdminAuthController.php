<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\AdminUser;
use App\Models\AdminSession;
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;

class AdminAuthController {
    
    /**
     * POST /api/admin/auth/login
     */
    public function login() {
        $email = Request::input('email');
        $password = Request::input('password');

        if (empty($email) || empty($password)) {
            Response::json(["success" => false, "message" => "Vui lòng điền đầy đủ email và mật khẩu."], 400);
        }

        $userModel = new AdminUser();
        $admin = $userModel->findByEmail($email);

        if (!$admin || (int)$admin['is_active'] !== 1 || !password_verify($password, $admin['password_hash'])) {
            Response::json(["success" => false, "message" => "Email hoặc mật khẩu không chính xác."], 401);
        }

        // Generate session
        $sessionModel = new AdminSession();
        $token = $sessionModel->createSession($admin['id']);

        // Update login timestamp
        $userModel->updateLastLogin($admin['id']);

        // Write Audit Log
        AuditLog::write($admin['id'], 'login', 'admin_users', $admin['id'], [
            'email' => $admin['email']
        ]);

        Response::json([
            "success" => true,
            "data" => [
                "token" => $token,
                "admin" => [
                    "id" => (int)$admin['id'],
                    "name" => $admin['name'],
                    "email" => $admin['email'],
                    "role" => $admin['role']
                ]
            ]
        ]);
    }

    /**
     * POST /api/admin/auth/logout
     */
    public function logout() {
        $admin = AuthMiddleware::requireAdmin();

        // Retrieve Authorization token
        $authHeader = '';
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
            $sessionModel = new AdminSession();
            $sessionModel->revokeToken($token);
        }

        // Write Audit Log
        AuditLog::write($admin['id'], 'logout', 'admin_users', $admin['id']);

        Response::json([
            "success" => true,
            "message" => "Đăng xuất thành công."
        ]);
    }

    /**
     * GET /api/admin/auth/me
     */
    public function me() {
        $admin = AuthMiddleware::requireAdmin();
        Response::json([
            "success" => true,
            "data" => [
                "id" => (int)$admin['id'],
                "name" => $admin['name'],
                "email" => $admin['email'],
                "role" => $admin['role']
            ]
        ]);
    }

    /**
     * POST /api/admin/auth/bootstrap
     */
    public function bootstrap() {
        $userModel = new AdminUser();

        // Only works if table is empty
        if (!$userModel->isEmpty()) {
            Response::json(["success" => false, "message" => "Bootstrap đã bị vô hiệu hóa."], 403);
        }

        $email = Request::input('email');
        $password = Request::input('password');
        $name = Request::input('name');

        if (empty($email) || empty($password) || empty($name)) {
            Response::json(["success" => false, "message" => "Vui lòng nhập đầy đủ tên, email và mật khẩu."], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["success" => false, "message" => "Email không hợp lệ."], 400);
        }

        if (strlen($password) < 6) {
            Response::json(["success" => false, "message" => "Mật khẩu phải từ 6 ký tự trở lên."], 400);
        }

        $adminId = $userModel->createUser($name, $email, $password, 'admin');

        // Write Audit Log
        AuditLog::write($adminId, 'bootstrap_create', 'admin_users', $adminId, [
            'email' => $email,
            'name' => $name
        ]);

        Response::json([
            "success" => true,
            "message" => "Tạo quản trị viên đầu tiên thành công.",
            "data" => [
                "id" => $adminId,
                "name" => $name,
                "email" => $email
            ]
        ]);
    }
}
