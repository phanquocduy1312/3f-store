<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\AuditLog;
use PDO;

class AdminRoleController {
    
    /**
     * GET /api/admin/roles
     */
    public function list() {
        AuthMiddleware::requirePermission('accounts');
        
        $db = \App\Core\Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM admin_roles ORDER BY id ASC");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($roles as &$role) {
            $role['permissions'] = json_decode($role['permissions'], true) ?: [];
        }
        
        Response::json([
            "success" => true,
            "data" => $roles
        ]);
    }
    
    /**
     * POST /api/admin/roles
     */
    public function create() {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $name = trim(strtolower(Request::input('name')));
        $displayName = trim(Request::input('display_name'));
        $permissions = Request::input('permissions');
        
        if (empty($name) || empty($displayName)) {
            Response::json(["success" => false, "message" => "Vui lòng nhập tên vai trò và tên hiển thị."], 400);
        }
        
        if (!preg_match('/^[a-z0-9_]+$/', $name)) {
            Response::json(["success" => false, "message" => "Tên vai trò chỉ được chứa chữ cái thường, số và dấu gạch dưới."], 400);
        }
        
        if (!is_array($permissions)) {
            $permissions = [];
        }
        
        $db = \App\Core\Database::getInstance()->getConnection();
        
        $stmtCheck = $db->prepare("SELECT id FROM admin_roles WHERE name = :name LIMIT 1");
        $stmtCheck->execute([':name' => $name]);
        if ($stmtCheck->fetch()) {
            Response::json(["success" => false, "message" => "Vai trò này đã tồn tại."], 400);
        }
        
        $stmtInsert = $db->prepare("
            INSERT INTO admin_roles (name, display_name, permissions)
            VALUES (:name, :display_name, :permissions)
        ");
        $stmtInsert->execute([
            ':name' => $name,
            ':display_name' => $displayName,
            ':permissions' => json_encode(array_values($permissions))
        ]);
        
        $roleId = (int)$db->lastInsertId();
        
        AuditLog::write($admin['id'], 'create_role', 'admin_roles', $roleId, [
            'name' => $name,
            'display_name' => $displayName,
            'permissions' => $permissions
        ]);
        
        Response::json([
            "success" => true,
            "message" => "Thêm vai trò mới thành công."
        ]);
    }
    
    /**
     * PUT /api/admin/roles/:id
     */
    public function update($id) {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $displayName = trim(Request::input('display_name'));
        $permissions = Request::input('permissions');
        
        if (empty($displayName)) {
            Response::json(["success" => false, "message" => "Tên hiển thị không được để trống."], 400);
        }
        
        if (!is_array($permissions)) {
            $permissions = [];
        }
        
        $db = \App\Core\Database::getInstance()->getConnection();
        
        $stmtCheck = $db->prepare("SELECT * FROM admin_roles WHERE id = :id LIMIT 1");
        $stmtCheck->execute([':id' => (int)$id]);
        $role = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        if (!$role) {
            Response::json(["success" => false, "message" => "Không tìm thấy vai trò."], 404);
        }
        
        if ($role['name'] === 'dev' || $role['name'] === 'admin') {
            Response::json(["success" => false, "message" => "Không thể sửa đổi vai trò hệ thống này."], 400);
        }
        
        $stmtUpdate = $db->prepare("
            UPDATE admin_roles
            SET display_name = :display_name, permissions = :permissions, updated_at = NOW()
            WHERE id = :id
        ");
        $stmtUpdate->execute([
            ':display_name' => $displayName,
            ':permissions' => json_encode(array_values($permissions)),
            ':id' => (int)$id
        ]);
        
        AuditLog::write($admin['id'], 'update_role', 'admin_roles', $id, [
            'name' => $role['name'],
            'display_name' => $displayName,
            'permissions' => $permissions
        ]);
        
        Response::json([
            "success" => true,
            "message" => "Cập nhật vai trò thành công."
        ]);
    }
    
    /**
     * DELETE /api/admin/roles/:id
     */
    public function delete($id) {
        $admin = AuthMiddleware::requirePermission('accounts');
        
        $db = \App\Core\Database::getInstance()->getConnection();
        
        $stmtCheck = $db->prepare("SELECT * FROM admin_roles WHERE id = :id LIMIT 1");
        $stmtCheck->execute([':id' => (int)$id]);
        $role = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        if (!$role) {
            Response::json(["success" => false, "message" => "Không tìm thấy vai trò."], 404);
        }
        
        $systemRoles = ['dev', 'super_admin', 'manager', 'editor', 'cskh', 'admin'];
        if (in_array($role['name'], $systemRoles, true)) {
            Response::json(["success" => false, "message" => "Không thể xóa vai trò mặc định của hệ thống."], 400);
        }
        
        $stmtUsers = $db->prepare("SELECT COUNT(*) as count FROM admin_users WHERE role = :role");
        $stmtUsers->execute([':role' => $role['name']]);
        $userCount = (int)$stmtUsers->fetch(PDO::FETCH_ASSOC)['count'];
        if ($userCount > 0) {
            Response::json(["success" => false, "message" => "Không thể xóa vai trò này vì đang có {$userCount} tài khoản nhân viên sử dụng."], 400);
        }
        
        $stmtDelete = $db->prepare("DELETE FROM admin_roles WHERE id = :id");
        $stmtDelete->execute([':id' => (int)$id]);
        
        AuditLog::write($admin['id'], 'delete_role', 'admin_roles', $id, [
            'name' => $role['name']
        ]);
        
        Response::json([
            "success" => true,
            "message" => "Xóa vai trò thành công."
        ]);
    }
}
