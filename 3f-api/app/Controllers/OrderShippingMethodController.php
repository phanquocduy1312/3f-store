<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\OrderShippingMethod;
use App\Helpers\AuthMiddleware;
use Exception;

class OrderShippingMethodController {
    public function publicList() {
        try {
            $model = new OrderShippingMethod();
            Response::json([
                'success' => true,
                'data' => $model->listAll(true),
            ], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function adminList() {
        try {
            AuthMiddleware::requireAdmin();
            $model = new OrderShippingMethod();
            Response::json([
                'success' => true,
                'data' => $model->listAll(false),
            ], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function adminSave() {
        try {
            AuthMiddleware::requireAdmin();
            $payload = Request::json();
            $model = new OrderShippingMethod();
            $saved = $model->save($payload);
            Response::json([
                'success' => true,
                'message' => 'Lưu phương thức giao hàng thành công.',
                'data' => $saved,
            ], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function adminToggle() {
        try {
            AuthMiddleware::requireAdmin();
            $payload = Request::json();
            $id = (int)($payload['id'] ?? 0);
            $isActive = (bool)($payload['isActive'] ?? $payload['is_active'] ?? false);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'Thiếu ID phương thức giao hàng.'], 400);
            }

            $model = new OrderShippingMethod();
            $saved = $model->setActive($id, $isActive);
            Response::json([
                'success' => true,
                'message' => $isActive ? 'Đã bật phương thức giao hàng.' : 'Đã tắt phương thức giao hàng.',
                'data' => $saved,
            ], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function adminDelete() {
        try {
            AuthMiddleware::requireAdmin();
            $id = (int)Request::query('id', 0);
            if ($id <= 0) {
                Response::json(['success' => false, 'message' => 'Thiếu ID phương thức giao hàng.'], 400);
            }

            $model = new OrderShippingMethod();
            $model->delete($id);
            Response::json(['success' => true, 'message' => 'Đã xóa phương thức giao hàng.'], 200);
        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
