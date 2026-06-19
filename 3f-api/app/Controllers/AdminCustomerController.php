<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Customer;
use App\Helpers\AuthMiddleware;
use App\Models\AuditLog;

class AdminCustomerController {
    public function list() {
        $admin = AuthMiddleware::requireAdmin();
        
        $filters = [
            'page' => Request::input('page', 1),
            'limit' => Request::input('limit', 10),
            'q' => Request::input('q'),
            'status' => Request::input('status', 'all'),
            'phoneVerified' => Request::input('phoneVerified', 'all'),
            'hasOrders' => Request::input('hasOrders', 'all'),
            'tier' => Request::input('tier', 'all')
        ];
        
        $customerModel = new Customer();
        $result = $customerModel->adminPaginateCustomers($filters);
        
        Response::json([
            "success" => true,
            "data" => $result
        ]);
    }
    
    public function getDetail() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        
        $customerModel = new Customer();
        $customer = $customerModel->adminGetCustomerDetail($id);
        
        if (!$customer) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        
        Response::json([
            "success" => true,
            "data" => $customer
        ]);
    }

    public function updateStatus() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $status = Request::input('status');
        $reason = Request::input('reason', '');
        
        if (!in_array($status, ['active', 'blocked'])) {
            Response::json(["success" => false, "message" => "Trạng thái không hợp lệ."], 400);
        }
        
        if ($status === 'blocked' && empty(trim($reason))) {
            Response::json(["success" => false, "message" => "Vui lòng nhập lý do khóa tài khoản."], 400);
        }
        
        $customerModel = new Customer();
        $customer = $customerModel->findById($id);
        
        if (!$customer) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        
        $success = $customerModel->adminUpdateStatus($id, $status, $reason, $admin['id']);
        
        if ($success) {
            AuditLog::write($admin['id'], $status === 'blocked' ? 'customer_block' : 'customer_unblock', 'customers', $id, [
                'old_status' => $customer['status'],
                'new_status' => $status,
                'reason' => $reason
            ]);
        }
        
        Response::json([
            "success" => true,
            "message" => "Cập nhật trạng thái thành công."
        ]);
    }
    
    public function getOrders() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        $orders = $customerModel->adminGetCustomerOrders($id);
        Response::json(["success" => true, "data" => $orders]);
    }

    public function getPoints() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        $customer = $customerModel->findById($id);
        if (!$customer) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        
        $points = [];
        if (!empty($customer['phone'])) {
            $points = $customerModel->adminGetCustomerPoints($customer['phone']);
        }
        
        Response::json(["success" => true, "data" => $points]);
    }
}
