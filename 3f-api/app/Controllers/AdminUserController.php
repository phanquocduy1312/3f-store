<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\AdminUser;
use App\Helpers\AuthMiddleware;
use App\Models\AuditLog;

class AdminUserController {
    public function list() {
        AuthMiddleware::requirePermission('accounts');
        
        $page = (int)Request::input('page', 1);
        $limit = (int)Request::input('limit', 10);
        $search = Request::input('search', null);
        
        $userModel = new AdminUser();
        $result = $userModel->getPaginatedList($page, $limit, $search);
        
        Response::json([
            "success" => true,
            "data" => $result
        ]);
    }
    
    public function create() {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $name = Request::input('name');
        $email = Request::input('email');
        $password = Request::input('password');
        $role = Request::input('role', 'manager');
        
        if (empty($name) || empty($email) || empty($password)) {
            Response::json(["success" => false, "message" => "Vui lòng điền đủ thông tin."], 400);
        }
        
        $userModel = new AdminUser();
        if ($userModel->findByEmail($email)) {
            Response::json(["success" => false, "message" => "Email đã tồn tại trong hệ thống."], 400);
        }
        
        $id = $userModel->createUser($name, $email, $password, $role);
        
        AuditLog::write($admin['id'], 'create_admin_user', 'admin_users', $id, ['email' => $email, 'role' => $role]);
        
        Response::json(["success" => true, "message" => "Tạo tài khoản thành công."]);
    }
    
    public function update($id) {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $role = Request::input('role');
        $isActive = Request::input('is_active');
        $password = Request::input('password');
        
        $userModel = new AdminUser();
        $target = $userModel->findById($id);
        if (!$target) {
            Response::json(["success" => false, "message" => "Không tìm thấy người dùng."], 404);
        }
        
        if ($role !== null) {
            $userModel->updateRole($id, $role);
        }
        if ($isActive !== null) {
            // Prevent disabling oneself
            if ((int)$id === (int)$admin['id'] && (int)$isActive === 0) {
                Response::json(["success" => false, "message" => "Không thể tự khóa tài khoản của mình."], 400);
            } else {
                $userModel->updateStatus($id, $isActive);
            }
        }
        if ($password) {
            $userModel->updatePassword($id, $password);
        }
        
        AuditLog::write($admin['id'], 'update_admin_user', 'admin_users', $id, [
            'role' => $role,
            'is_active' => $isActive,
            'password_changed' => !empty($password)
        ]);
        
        Response::json(["success" => true, "message" => "Cập nhật tài khoản thành công."]);
    }

    public function delete($id) {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $userModel = new AdminUser();
        $target = $userModel->findById($id);
        if (!$target) {
            Response::json(["success" => false, "message" => "Không tìm thấy người dùng."], 404);
        }
        
        if ((int)$id === (int)$admin['id']) {
            Response::json(["success" => false, "message" => "Không thể tự xóa tài khoản của chính mình."], 400);
        }
        
        $db = \App\Core\Database::getInstance()->getConnection();
        
        // Delete user's active sessions first
        $stmtSessions = $db->prepare("DELETE FROM admin_sessions WHERE admin_user_id = :id");
        $stmtSessions->execute([':id' => (int)$id]);
        
        // Delete the admin user record
        $stmtUser = $db->prepare("DELETE FROM admin_users WHERE id = :id");
        $stmtUser->execute([':id' => (int)$id]);
        
        AuditLog::write($admin['id'], 'delete_admin_user', 'admin_users', $id, [
            'email' => $target['email'],
            'name' => $target['name']
        ]);
        
        Response::json(["success" => true, "message" => "Xóa tài khoản nhân viên thành công."]);
    }
}
