<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\OtpService;
use App\Services\ValidationService;
use Exception;

class ShopeeGuestController {
    
    /**
     * POST /api/shopee/guest/request-otp
     */
    public function requestOtp() {
        try {
            $input = Request::json();
            $phoneRaw = isset($input['phone']) ? $input['phone'] : '';

            if (empty($phoneRaw)) {
                Response::json(['success' => false, 'message' => 'Số điện thoại không được để trống.'], 400);
            }

            $phone = ValidationService::normalizePhone($phoneRaw);
            if (!ValidationService::isValidPhone($phone)) {
                Response::json(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 400);
            }

            $otpService = new OtpService();
            $result = $otpService->requestOtp($phone, 'shopee_point_guest');

            if (!$result['success']) {
                Response::json(['success' => false, 'message' => $result['message']], 429);
            }

            // In dev mode, OtpService returns devOtp
            $response = [
                'success' => true,
                'message' => $result['message']
            ];
            
            if (isset($result['devOtp'])) {
                $response['devOtp'] = $result['devOtp'];
            }

            Response::json($response);

        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/shopee/guest/verify-otp
     */
    public function verifyOtp() {
        try {
            $input = Request::json();
            $phoneRaw = isset($input['phone']) ? $input['phone'] : '';
            $otp = isset($input['otp']) ? $input['otp'] : '';

            if (empty($phoneRaw) || empty($otp)) {
                Response::json(['success' => false, 'message' => 'Vui lòng nhập số điện thoại và mã xác nhận.'], 400);
            }

            $phone = ValidationService::normalizePhone($phoneRaw);
            
            $otpService = new OtpService();
            $result = $otpService->verifyOtp($phone, $otp, 'shopee_point_guest');

            if (!$result['success']) {
                Response::json(['success' => false, 'message' => $result['error']], 400);
            }

            Response::json([
                'success' => true,
                'data' => [
                    'phone' => $phone,
                    'verificationToken' => $result['verificationToken'],
                    'expiresIn' => 900 // 15 minutes roughly
                ]
            ]);

        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
