<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\Coupon;
use Exception;

class CouponController {
    /**
     * POST /api/coupons/validate
     */
    public function validate() {
        try {
            $input = Request::json();
            $code = isset($input['code']) ? trim((string)$input['code']) : '';
            $subtotal = isset($input['subtotal']) ? (float)$input['subtotal'] : 0.00;
            $customerPhone = isset($input['customerPhone']) ? trim((string)$input['customerPhone']) : null;

            if ($code === '') {
                Response::json(["success" => false, "message" => "Mã giảm giá không được để trống."], 400);
            }

            if ($subtotal <= 0.00) {
                Response::json(["success" => false, "message" => "Giá trị đơn hàng không hợp lệ."], 400);
            }

            $res = (new Coupon())->validateCoupon($code, $subtotal, $customerPhone);
            if (!$res['success']) {
                Response::json(["success" => false, "message" => $res['message']], 400);
            }

            Response::json(["success" => true, "data" => $res['data']], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Lỗi kiểm tra mã giảm giá: " . $e->getMessage()
            ], 500);
        }
    }

    public function featured() {
        $limit = (int)Request::query('limit', 12);
        Response::json(["success" => true, "data" => (new Coupon())->listPublicCoupons('home', $limit)], 200);
    }

    public function cartSuggestions() {
        $limit = (int)Request::query('limit', 8);
        Response::json(["success" => true, "data" => (new Coupon())->listPublicCoupons('cart', $limit)], 200);
    }

    public function aiAdvisor() {
        $items = (new Coupon())->listPublicCoupons('ai', 1);
        Response::json(["success" => true, "data" => $items ? $items[0] : null], 200);
    }

    public function track() {
        try {
            $input = Request::json();
            $eventType = isset($input['eventType']) ? (string)$input['eventType'] : '';
            $code = isset($input['code']) ? (string)$input['code'] : '';
            $couponId = isset($input['couponId']) ? (int)$input['couponId'] : null;
            $customerPhone = isset($input['customerPhone']) ? (string)$input['customerPhone'] : null;
            (new Coupon())->trackEvent($couponId, $code, $eventType, $customerPhone, $input['metadata'] ?? []);
            Response::json(["success" => true], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function adminList() {
        AuthMiddleware::requireAdmin();
        $filters = [
            'q' => Request::query('q', ''),
            'isActive' => Request::query('isActive', 'all'),
            'placement' => Request::query('placement', ''),
        ];
        $page = max(1, (int)Request::query('page', 1));
        $perPage = max(1, min(50, (int)Request::query('perPage', 10)));
        $couponModel = new Coupon();
        $pageData = $couponModel->paginateCoupons($filters, $page, $perPage);

        Response::json([
            "success" => true,
            "data" => $pageData['items'],
            "meta" => $pageData['meta'],
            "stats" => $couponModel->stats(),
        ], 200);
    }

    public function adminDetail() {
        AuthMiddleware::requireAdmin();
        $id = (int)Request::query('id', 0);
        $coupon = (new Coupon())->getCouponById($id);
        if (!$coupon) {
            Response::json(["success" => false, "message" => "Voucher không tồn tại."], 404);
        }
        Response::json(["success" => true, "data" => $coupon], 200);
    }

    public function adminSave() {
        AuthMiddleware::requireAdmin();
        try {
            $input = Request::json();
            $id = (new Coupon())->saveCoupon($input);
            Response::json(["success" => true, "id" => $id, "message" => "Đã lưu voucher."], 200);
        } catch (\Exception $e) {
            $decoded = json_decode($e->getMessage(), true);
            if (is_array($decoded) && isset($decoded['errors'])) {
                Response::json([
                    "success" => false,
                    "message" => $decoded['message'] ?? "Dữ liệu voucher không hợp lệ.",
                    "errors" => $decoded['errors']
                ], 400);
            } else {
                Response::json(["success" => false, "message" => $e->getMessage()], 400);
            }
        }
    }

    public function adminToggleActive() {
        AuthMiddleware::requireAdmin();
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $isActive = !empty($input['isActive']) ? 1 : 0;
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "id không hợp lệ."], 400);
        }
        (new Coupon())->toggleActive($id, $isActive);
        Response::json(["success" => true, "message" => "Đã cập nhật trạng thái voucher."], 200);
    }

    public function adminDelete() {
        AuthMiddleware::requireAdmin();
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : (int)Request::query('id', 0);
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "id không hợp lệ."], 400);
        }
        (new Coupon())->deleteCoupon($id);
        Response::json(["success" => true, "message" => "Đã xóa voucher."], 200);
    }

    public function adminStats() {
        AuthMiddleware::requireAdmin();
        Response::json(["success" => true, "data" => (new Coupon())->stats()], 200);
    }
}
