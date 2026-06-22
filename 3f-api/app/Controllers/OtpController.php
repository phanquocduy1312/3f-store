<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\OtpService;
use App\Services\ValidationService;
use App\Helpers\AuthMiddleware;
use Exception;

class OtpController {

    /**
     * POST /api/customer/otp/send
     */
    public function send() {
        try {
            $input = Request::json();
            $phoneRaw = $input['phone'] ?? '';
            $purpose = $input['purpose'] ?? 'register_phone';

            if (empty($phoneRaw)) {
                Response::json(['success' => false, 'message' => 'Số điện thoại không được để trống.'], 400);
            }

            $phone = ValidationService::normalizePhone($phoneRaw);
            if (!ValidationService::isValidPhone($phone)) {
                Response::json(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 400);
            }

            $customerId = null;
            try {
                $customer = AuthMiddleware::getCurrentCustomer();
                if ($customer) {
                    $customerId = $customer['id'];
                }
            } catch (Exception $e) {}

            $otpService = new OtpService();
            $result = $otpService->requestOtp($phone, $purpose, $customerId);

            if (!$result['success']) {
                Response::json(['success' => false, 'message' => $result['message']], 429);
            }

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
     * POST /api/customer/otp/verify
     */
    public function verify() {
        try {
            $input = Request::json();
            $phoneRaw = $input['phone'] ?? '';
            $purpose = $input['purpose'] ?? 'register_phone';
            $code = $input['code'] ?? $input['otp'] ?? '';

            if (empty($phoneRaw) || empty($code)) {
                Response::json(['success' => false, 'message' => 'Vui lòng nhập số điện thoại và mã OTP.'], 400);
            }

            $phone = ValidationService::normalizePhone($phoneRaw);
            $otpService = new OtpService();
            $result = $otpService->verifyOtp($phone, $code, $purpose);

            if (!$result['success']) {
                Response::json(['success' => false, 'message' => $result['error']], 400);
            }

            // If registering or changing phone, update phone verification flag on customer record
            if ($purpose === 'register_phone' || $purpose === 'change_phone') {
                try {
                    $db = \App\Core\Database::getInstance()->getConnection();
                    $stmt = $db->prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1");
                    $stmt->execute([$phone]);
                    $customer = $stmt->fetch();
                    if ($customer) {
                        $stmtUpdate = $db->prepare("UPDATE customers SET is_phone_verified = 1, phone_verified_at = NOW() WHERE id = ?");
                        $stmtUpdate->execute([$customer['id']]);
                    }
                } catch (Exception $ex) {
                    error_log("Failed to update customer verification status: " . $ex->getMessage());
                }
            }

            Response::json([
                'success' => true,
                'message' => 'Xác thực OTP thành công.',
                'data' => [
                    'phone' => $phone,
                    'verificationToken' => $result['verificationToken'] ?? null,
                    'expiresIn' => 900
                ]
            ]);

        } catch (Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
