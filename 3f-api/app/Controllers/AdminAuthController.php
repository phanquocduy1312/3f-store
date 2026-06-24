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

        $permissions = [];
        $roleName = $admin['role'] ?? '';
        if ($roleName === 'dev' || $roleName === 'admin') {
            $permissions = ["dashboard","orders","customers","pet_advisor","club_3f","products","reviews","categories","banners","news","vouchers","analytics","workflows","accounts"];
        } else {
            try {
                $db = \App\Core\Database::getInstance()->getConnection();
                $stmtPerms = $db->prepare("SELECT permissions FROM admin_roles WHERE name = :name LIMIT 1");
                $stmtPerms->execute([':name' => $roleName]);
                $rowPerms = $stmtPerms->fetch(\PDO::FETCH_ASSOC);
                if ($rowPerms) {
                    $permissions = json_decode($rowPerms['permissions'], true) ?: [];
                }
            } catch (\Throwable $e) {}
        }

        Response::json([
            "success" => true,
            "data" => [
                "token" => $token,
                "admin" => [
                    "id" => (int)$admin['id'],
                    "name" => $admin['name'],
                    "email" => $admin['email'],
                    "role" => $admin['role'],
                    "permissions" => $permissions
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
        
        $permissions = [];
        $roleName = $admin['role'] ?? '';
        if ($roleName === 'dev' || $roleName === 'admin') {
            $permissions = ["dashboard","orders","customers","pet_advisor","club_3f","products","reviews","categories","banners","news","vouchers","analytics","workflows","accounts"];
        } else {
            try {
                $db = \App\Core\Database::getInstance()->getConnection();
                $stmtPerms = $db->prepare("SELECT permissions FROM admin_roles WHERE name = :name LIMIT 1");
                $stmtPerms->execute([':name' => $roleName]);
                $rowPerms = $stmtPerms->fetch(\PDO::FETCH_ASSOC);
                if ($rowPerms) {
                    $permissions = json_decode($rowPerms['permissions'], true) ?: [];
                }
            } catch (\Throwable $e) {}
        }

        Response::json([
            "success" => true,
            "data" => [
                "id" => (int)$admin['id'],
                "name" => $admin['name'],
                "email" => $admin['email'],
                "role" => $admin['role'],
                "is_active" => (int)($admin['is_active'] ?? 1),
                "last_login_at" => $admin['last_login_at'] ?? null,
                "created_at" => $admin['created_at'] ?? null,
                "updated_at" => $admin['updated_at'] ?? null,
                "permissions" => $permissions
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

    /**
     * PUT /api/admin/auth/profile
     */
    public function updateProfile() {
        $admin = AuthMiddleware::requireAdmin();
        
        $name = Request::input('name');
        $email = Request::input('email');
        $currentPassword = Request::input('current_password');
        $newPassword = Request::input('new_password');

        if (empty($name) || empty($email)) {
            Response::json(["success" => false, "message" => "Vui lòng nhập đầy đủ tên và email."], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["success" => false, "message" => "Email không hợp lệ."], 400);
        }

        $userModel = new AdminUser();

        // Check if email has changed and check for collision
        if (trim(strtolower($email)) !== trim(strtolower($admin['email']))) {
            $existing = $userModel->findByEmail($email);
            if ($existing) {
                Response::json(["success" => false, "message" => "Email đã được sử dụng bởi một tài khoản khác."], 400);
            }
        }

        // If new password is provided, we must check current password
        if (!empty($newPassword)) {
            if (empty($currentPassword)) {
                Response::json(["success" => false, "message" => "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới."], 400);
            }

            if (strlen($newPassword) < 6) {
                Response::json(["success" => false, "message" => "Mật khẩu mới phải từ 6 ký tự trở lên."], 400);
            }

            // Retrieve password hash directly from database using admin id
            $db = \App\Core\Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT password_hash FROM admin_users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $admin['id']]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
                Response::json(["success" => false, "message" => "Mật khẩu hiện tại không chính xác."], 400);
            }
        }

        // Perform details update
        $userModel->updateProfile($admin['id'], $name, $email);

        // Perform password update if supplied
        if (!empty($newPassword)) {
            $userModel->updatePassword($admin['id'], $newPassword);
        }

        // Write Audit Log
        AuditLog::write($admin['id'], 'update_profile', 'admin_users', $admin['id'], [
            'name' => $name,
            'email' => $email,
            'password_changed' => !empty($newPassword)
        ]);

        // Get updated user data
        $updatedUser = $userModel->findById($admin['id']);

        Response::json([
            "success" => true,
            "message" => "Cập nhật hồ sơ cá nhân thành công.",
            "data" => [
                "admin" => [
                    "id" => (int)$updatedUser['id'],
                    "name" => $updatedUser['name'],
                    "email" => $updatedUser['email'],
                    "role" => $updatedUser['role']
                ]
            ]
        ]);
    }
}
