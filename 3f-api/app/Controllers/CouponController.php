<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
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

            $couponModel = new Coupon();
            $res = $couponModel->validateCoupon($code, $subtotal, $customerPhone);

            if (!$res['success']) {
                Response::json(["success" => false, "message" => $res['message']], 400);
            }

            Response::json([
                "success" => true,
                "data" => $res['data']
            ], 200);

        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => "Lỗi kiểm tra mã giảm giá: " . $e->getMessage()
            ], 500);
        }
    }
}
