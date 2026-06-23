<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Helpers\AuthMiddleware;
use App\Models\AdminNotification;
use Exception;

class AdminNotificationController {
    /**
     * GET /api/admin/notifications
     */
    public function list() {
        try {
            AuthMiddleware::requireAdmin();
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $model = new AdminNotification();
            $data = $model->listNotifications($limit);
            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/notifications/unread-count
     */
    public function unreadCount() {
        try {
            AuthMiddleware::requireAdmin();
            $model = new AdminNotification();
            $count = $model->getUnreadCount();
            Response::json(["success" => true, "count" => $count], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/notifications/mark-read
     */
    public function markRead() {
        try {
            AuthMiddleware::requireAdmin();
            $input = Request::json();
            $id = isset($input['id']) ? $input['id'] : null;

            $model = new AdminNotification();
            if ($id !== null && $id !== '') {
                $model->markRead((int)$id);
            } else {
                $model->markAllRead();
            }
            Response::json(["success" => true, "message" => "Đã đánh dấu đã đọc."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/notifications/delete
     */
    public function delete() {
        try {
            AuthMiddleware::requireAdmin();
            $input = Request::json();
            $id = isset($input['id']) ? $input['id'] : null;

            if ($id === null || $id === '') {
                Response::json(["success" => false, "message" => "Thiếu ID thông báo."], 400);
            }

            $model = new AdminNotification();
            $model->deleteNotification((int)$id);
            Response::json(["success" => true, "message" => "Đã xóa thông báo."], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
