<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\Customer;
use App\Models\CustomerSession;
use App\Core\Database;
use PDO;

class CustomerSecurityController {
    
    public function __construct() {
        // Migration moved to CustomerSession.php
    }

    /**
     * POST /api/customer/security/change-password
     */
    public function changePassword() {
        $customer = AuthMiddleware::requireCustomer();
        $currentPassword = Request::input('currentPassword', '');
        $newPassword = Request::input('newPassword', '');
        $newPasswordConfirmation = Request::input('newPasswordConfirmation', '');

        $db = Database::getInstance()->getConnection();

        // If password hash exists, require current password
        if (!empty($customer['password_hash'])) {
            if (empty($currentPassword)) {
                Response::json(['success' => false, 'message' => 'Mật khẩu hiện tại là bắt buộc.'], 400);
            }
            if (!password_verify($currentPassword, $customer['password_hash'])) {
                Response::json(['success' => false, 'message' => 'Mật khẩu hiện tại không chính xác.'], 400);
            }
        }

        if (strlen($newPassword) < 6) {
            Response::json(['success' => false, 'message' => 'Mật khẩu mới phải từ 6 ký tự.'], 400);
        }

        if ($newPassword !== $newPasswordConfirmation) {
            Response::json(['success' => false, 'message' => 'Xác nhận mật khẩu mới không khớp.'], 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE customers SET password_hash = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newHash, $customer['id']]);

        Response::json(['success' => true, 'message' => 'Đổi mật khẩu thành công!']);
    }

    /**
     * GET /api/customer/security/sessions
     */
    public function sessions() {
        $customer = AuthMiddleware::requireCustomer();
        $currentToken = AuthMiddleware::extractBearerToken();
        $currentTokenHash = hash('sha256', $currentToken);

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT * FROM customer_sessions 
            WHERE customer_id = ? AND revoked_at IS NULL AND expires_at > NOW()
            ORDER BY id DESC
        ");
        $stmt->execute([$customer['id']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $mapped = array_map(function($row) use ($currentTokenHash) {
            return [
                'id' => (int)$row['id'],
                'ipAddress' => $row['ip_address'] ?: 'Unknown IP',
                'userAgent' => $row['user_agent'] ?: 'Unknown Browser',
                'createdAt' => $row['created_at'],
                'expiresAt' => $row['expires_at'],
                'isCurrent' => $row['token_hash'] === $currentTokenHash
            ];
        }, $rows);

        Response::json(['success' => true, 'data' => $mapped]);
    }

    /**
     * DELETE /api/customer/security/sessions/:id
     */
    public function revokeSession() {
        $customer = AuthMiddleware::requireCustomer();
        $id = (int)Request::query('id');

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE customer_sessions SET revoked_at = NOW() WHERE id = ? AND customer_id = ?");
        $stmt->execute([$id, $customer['id']]);

        Response::json(['success' => true, 'message' => 'Hủy phiên đăng nhập thành công!']);
    }

    /**
     * POST /api/customer/security/logout-all
     */
    public function logoutAll() {
        $customer = AuthMiddleware::requireCustomer();

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE customer_sessions SET revoked_at = NOW() WHERE customer_id = ?");
        $stmt->execute([$customer['id']]);

        Response::json(['success' => true, 'message' => 'Đã đăng xuất khỏi tất cả thiết bị.']);
    }
}
