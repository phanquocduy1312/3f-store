<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Customer;
use App\Helpers\AuthMiddleware;
use App\Models\AuditLog;

class AdminCustomerController {
    private function ensurePetDeletedAtColumn($db) {
        static $checked = false;
        if ($checked) return;
        $checked = true;

        try {
            $stmt = $db->query("SHOW COLUMNS FROM customer_pets LIKE 'deleted_at'");
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                $db->exec("ALTER TABLE customer_pets ADD COLUMN deleted_at DATETIME NULL");
            }
        } catch (\Throwable $e) {
            error_log("Unable to ensure customer_pets.deleted_at column: " . $e->getMessage());
        }
    }

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
    public function getAddresses() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        if (!$customerModel->findById($id)) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        $addresses = $customerModel->adminGetCustomerAddresses($id);
        Response::json(["success" => true, "data" => $addresses]);
    }

    public function getVouchers() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        if (!$customerModel->findById($id)) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        $vouchers = $customerModel->adminGetCustomerVouchers($id);
        Response::json(["success" => true, "data" => $vouchers]);
    }

    public function getPets() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        if (!$customerModel->findById($id)) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        $pets = $customerModel->adminGetCustomerPets($id);
        Response::json(["success" => true, "data" => $pets]);
    }

    public function getPetAdvisorConsultations() {
        $admin = AuthMiddleware::requireAdmin();
        $page = max(1, (int)Request::input('page', 1));
        $limit = min(100, max(10, (int)Request::input('limit', 20)));
        $offset = ($page - 1) * $limit;
        $q = trim((string)Request::input('q', ''));
        $species = trim((string)Request::input('species', 'all'));

        $db = \App\Core\Database::getInstance()->getConnection();
        $this->ensurePetDeletedAtColumn($db);
        $where = ["cp.ai_result IS NOT NULL", "cp.ai_result <> ''"];
        $params = [];

        if ($q !== '') {
            $where[] = "(cp.name LIKE :q OR cp.breed LIKE :q OR cp.health_notes LIKE :q OR cp.favorite_food LIKE :q OR c.full_name LIKE :q OR c.name LIKE :q OR c.phone LIKE :q OR c.email LIKE :q)";
            $params[':q'] = '%' . $q . '%';
        }

        if (in_array($species, ['cat', 'dog', 'other'], true)) {
            $where[] = "cp.species = :species";
            $params[':species'] = $species;
        }

        $whereSql = implode(' AND ', $where);
        $countStmt = $db->prepare("
            SELECT COUNT(*) AS total, COUNT(DISTINCT cp.customer_id) AS customers
            FROM customer_pets cp
            LEFT JOIN customers c ON c.id = cp.customer_id
            WHERE {$whereSql}
        ");
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $counts = $countStmt->fetch(\PDO::FETCH_ASSOC) ?: ['total' => 0, 'customers' => 0];

        $statsStmt = $db->prepare("
            SELECT cp.species, cp.ai_result
            FROM customer_pets cp
            LEFT JOIN customers c ON c.id = cp.customer_id
            WHERE {$whereSql}
        ");
        foreach ($params as $key => $value) {
            $statsStmt->bindValue($key, $value);
        }
        $statsStmt->execute();
        $speciesStats = ['cat' => 0, 'dog' => 0, 'other' => 0];
        $warningCount = 0;
        $budgetSum = 0;
        $budgetCount = 0;
        while ($row = $statsStmt->fetch(\PDO::FETCH_ASSOC)) {
            $rowSpecies = $row['species'] ?: 'other';
            if (!isset($speciesStats[$rowSpecies])) {
                $rowSpecies = 'other';
            }
            $speciesStats[$rowSpecies]++;

            $parsed = json_decode($row['ai_result'] ?? '', true);
            if (is_array($parsed)) {
                if (!empty($parsed['warning'])) {
                    $warningCount++;
                }
                $budget = $parsed['advisor_inputs']['monthly_budget']
                    ?? $parsed['budget_analysis']['monthly_budget']
                    ?? null;
                if (is_numeric($budget) && (float)$budget > 0) {
                    $budgetSum += (float)$budget;
                    $budgetCount++;
                }
            }
        }

        $stmt = $db->prepare("
            SELECT
                cp.id,
                cp.customer_id,
                cp.name,
                cp.species,
                cp.breed,
                cp.gender,
                cp.birthday,
                cp.weight_kg,
                cp.health_notes,
                cp.allergies,
                cp.favorite_food,
                cp.avatar_url,
                cp.ai_result,
                cp.deleted_at,
                cp.created_at,
                cp.updated_at,
                c.full_name AS customer_full_name,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.status AS customer_status
            FROM customer_pets cp
            LEFT JOIN customers c ON c.id = cp.customer_id
            WHERE {$whereSql}
            ORDER BY cp.created_at DESC, cp.id DESC
            LIMIT :limit OFFSET :offset
        ");
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        Response::json([
            "success" => true,
            "data" => [
                "items" => $stmt->fetchAll(\PDO::FETCH_ASSOC),
                "total" => (int)$counts['total'],
                "customers" => (int)$counts['customers'],
                "stats" => [
                    "species" => $speciesStats,
                    "warningCount" => $warningCount,
                    "averageMonthlyBudget" => $budgetCount > 0 ? (int)round($budgetSum / $budgetCount) : 0
                ],
                "page" => $page,
                "limit" => $limit,
                "totalPages" => max(1, (int)ceil(((int)$counts['total']) / $limit))
            ]
        ]);
    }

    public function getSessions() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $customerModel = new Customer();
        if (!$customerModel->findById($id)) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng."], 404);
        }
        $sessions = $customerModel->adminGetCustomerSessions($id);
        Response::json(["success" => true, "data" => $sessions]);
    }

    // ==========================================
    // PHASE 1.2: CSKH ACTIONS & TOOLS
    // ==========================================

    public function getNotes() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $careModel = new \App\Models\CustomerCareModel();
        Response::json(["success" => true, "data" => $careModel->getNotes($id)]);
    }

    public function createNote() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['note'])) {
            Response::json(["success" => false, "message" => "Nội dung không được để trống"], 400);
        }
        $careModel = new \App\Models\CustomerCareModel();
        $careModel->createNote($id, $admin['id'], $data['note']);
        
        \App\Models\AuditLog::write($admin['id'], 'customer_note_created', 'customer', $id, ['note' => mb_substr($data['note'], 0, 100)]);
        Response::json(["success" => true, "message" => "Đã thêm ghi chú"]);
    }

    public function deleteNote() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $noteId = Request::query('noteId') ?? $_GET['noteId'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        
        $careModel = new \App\Models\CustomerCareModel();
        $note = $careModel->getNoteById($noteId);
        if ($note && $note['customer_id'] == $id) {
            $careModel->deleteNote($noteId);
            \App\Models\AuditLog::write($admin['id'], 'customer_note_deleted', 'customer', $id, ['note_id' => $noteId]);
        }
        Response::json(["success" => true, "message" => "Đã xóa ghi chú"]);
    }

    public function getTags() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $careModel = new \App\Models\CustomerCareModel();
        Response::json([
            "success" => true, 
            "data" => $careModel->getCustomerTags($id),
            "allTags" => $careModel->getAllTags()
        ]);
    }

    public function assignTag() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $tagId = $data['tag_id'] ?? null;
        
        $careModel = new \App\Models\CustomerCareModel();
        
        // If creating a new tag
        if (isset($data['new_tag_name'])) {
            $newTagId = $careModel->createTag($data['new_tag_name'], $data['new_tag_color'] ?? '#3b82f6');
            if ($newTagId) {
                $tagId = $newTagId;
            } else {
                // Find existing
                $all = $careModel->getAllTags();
                foreach ($all as $t) {
                    if (strcasecmp($t['name'], $data['new_tag_name']) === 0) {
                        $tagId = $t['id']; break;
                    }
                }
            }
        }

        if (!$tagId) {
            Response::json(["success" => false, "message" => "Thiếu tag_id"], 400);
        }

        $careModel->assignTag($id, $tagId, $admin['id']);
        \App\Models\AuditLog::write($admin['id'], 'customer_tag_assigned', 'customer', $id, ['tag_id' => $tagId]);
        Response::json(["success" => true, "message" => "Đã gán nhãn"]);
    }

    public function removeTag() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $tagId = Request::query('tagId') ?? $_GET['tagId'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        
        $careModel = new \App\Models\CustomerCareModel();
        $careModel->removeTagAssignment($id, $tagId);
        \App\Models\AuditLog::write($admin['id'], 'customer_tag_removed', 'customer', $id, ['tag_id' => $tagId]);
        Response::json(["success" => true, "message" => "Đã gỡ nhãn"]);
    }

    public function adjustPoints() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        
        $points = (int)($data['points'] ?? 0);
        $reason = $data['reason'] ?? '';
        
        if ($points === 0) {
            Response::json(["success" => false, "message" => "Số điểm điều chỉnh không hợp lệ"], 400);
        }
        if (empty($reason)) {
            Response::json(["success" => false, "message" => "Lý do không được để trống"], 400);
        }

        $customerModel = new Customer();
        $customer = $customerModel->findById($id);
        if (!$customer) {
            Response::json(["success" => false, "message" => "Không tìm thấy khách hàng"], 404);
        }

        if (empty($customer['phone'])) {
            Response::json(["success" => false, "message" => "Khách hàng chưa có số điện thoại. Vui lòng cập nhật số điện thoại trước khi cộng điểm."], 400);
        }

        $ptModel = new \App\Models\CustomerPointTransactionModel();
        $currentBalance = $ptModel->getBalance($customer['phone']);
        
        if ($currentBalance + $points < 0) {
            Response::json(["success" => false, "message" => "Điểm khách hàng không đủ để trừ"], 400);
        }

        $res = $ptModel->addManualAdjustment($id, $customer['phone'], $points, $reason, "Thao tác bởi Admin #" . $admin['id'], $admin['id']);
        
        \App\Models\AuditLog::write($admin['id'], 'customer_points_adjusted', 'customer', $id, [
            'points_change' => $points,
            'reason' => $reason,
            'old_balance' => $res['old_points'],
            'new_balance' => $res['new_points']
        ]);
        
        Response::json(["success" => true, "message" => "Đã điều chỉnh điểm", "data" => $res]);
    }

    public function revokeAllSessions() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        
        $sessionModel = new \App\Models\CustomerSession();
        $count = $sessionModel->revokeAllForCustomer($id);
        
        \App\Models\AuditLog::write($admin['id'], 'customer_sessions_revoked', 'customer', $id, ['revoked_count' => $count]);
        Response::json(["success" => true, "message" => "Đã thu hồi $count phiên đăng nhập"]);
    }

    public function getTimeline() {
        $id = Request::query('id') ?? $_GET['id'] ?? null;
        $admin = AuthMiddleware::requireAdmin();
        
        $careModel = new \App\Models\CustomerCareModel();
        $timeline = $careModel->getTimeline($id);
        Response::json(["success" => true, "data" => $timeline]);
    }

    public function exportCsv() {
        $admin = AuthMiddleware::requireAdmin();
        \App\Models\AuditLog::write($admin['id'], 'customer_export_csv', 'system', null, $_GET);
        
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=customers_' . date('Ymd_His') . '.csv');
        
        // Disable output buffering
        while (ob_get_level()) {
            ob_end_clean();
        }
        
        // Add BOM for Excel UTF-8 support
        echo "\xEF\xBB\xBF";
        
        $customerModel = new Customer();
        $customerModel->adminExportCustomers($_GET);
        exit;
    }
}
