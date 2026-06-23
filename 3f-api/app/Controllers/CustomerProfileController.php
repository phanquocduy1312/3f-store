<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Customer;
use App\Models\Order;
use App\Services\OtpService;
use App\Services\ValidationService;
use App\Helpers\AuthMiddleware;
use App\Core\Database;
use PDO;

class CustomerProfileController {
    
    /**
     * GET /api/customer/profile
     */
    public function getProfile() {
        $customer = AuthMiddleware::requireCustomer();
        $db = Database::getInstance()->getConnection();
        
        // Fetch stats
        $totalOrders = 0;
        $processingOrders = 0;
        if (!empty($customer['phone'])) {
            $stmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = ? OR (customer_id IS NULL AND phone = ?)");
            $stmt->execute([$customer['id'], $customer['phone']]);
            $totalOrders = (int)$stmt->fetchColumn();
            
            $stmtProc = $db->prepare("SELECT COUNT(*) FROM orders WHERE (customer_id = ? OR (customer_id IS NULL AND phone = ?)) AND order_status IN ('pending','confirmed','packing','shipping')");
            $stmtProc->execute([$customer['id'], $customer['phone']]);
            $processingOrders = (int)$stmtProc->fetchColumn();
        } else {
            $stmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = ?");
            $stmt->execute([$customer['id']]);
            $totalOrders = (int)$stmt->fetchColumn();
            
            $stmtProc = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = ? AND order_status IN ('pending','confirmed','packing','shipping')");
            $stmtProc->execute([$customer['id']]);
            $processingOrders = (int)$stmtProc->fetchColumn();
        }
        
        $vouchersCount = 0;
        if (!empty($customer['phone'])) {
            $stmtV = $db->prepare("SELECT COUNT(*) FROM voucher_pools WHERE assigned_customer_id = ? AND status = 'assigned'");
            $stmtV->execute([$customer['phone']]);
            $vouchersCount = (int)$stmtV->fetchColumn();
        }
        
        // Calculate profile completion
        $completion = 10; // Base completion
        if (!empty($customer['full_name']) || !empty($customer['name'])) $completion += 20;
        if (!empty($customer['email'])) $completion += 20;
        if (!empty($customer['phone'])) $completion += 20;
        if (!empty($customer['birthday'])) $completion += 15;
        if (!empty($customer['gender'])) $completion += 15;

        Response::json([
            'success' => true,
            'data' => [
                'id' => (int)$customer['id'],
                'fullName' => $customer['full_name'] ?? $customer['name'] ?? '',
                'phone' => $customer['phone'] ?? null,
                'email' => $customer['email'] ?? null,
                'avatarUrl' => $customer['avatar_url'] ?? null,
                'birthday' => $customer['birthday'] ?? null,
                'gender' => $customer['gender'] ?? null,
                'phoneVerifiedAt' => $customer['phone_verified_at'] ?? null,
                'emailVerifiedAt' => $customer['email_verified_at'] ?? null,
                'createdAt' => $customer['created_at'] ?? null,
                'hasPassword' => !empty($customer['password_hash']),
                'stats' => [
                    'totalOrders' => $totalOrders,
                    'processingOrders' => $processingOrders,
                    'availableVouchers' => $vouchersCount,
                    'profileCompletion' => $completion
                ]
            ]
        ]);
    }

    /**
     * PATCH /api/customer/profile
     */
    public function patchProfile() {
        $customer = AuthMiddleware::requireCustomer();
        $fullName = trim(Request::input('fullName', ''));
        $email = trim(Request::input('email', ''));
        $birthday = trim(Request::input('birthday', ''));
        $gender = trim(Request::input('gender', ''));
        $avatarUrl = trim(Request::input('avatarUrl', ''));

        if (empty($fullName)) {
            Response::json(['success' => false, 'message' => 'Họ và tên là bắt buộc.'], 400);
        }
        
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['success' => false, 'message' => 'Email không hợp lệ.'], 400);
        }

        if (!empty($birthday) && strtotime($birthday) > time()) {
            Response::json(['success' => false, 'message' => 'Ngày sinh không thể ở tương lai.'], 400);
        }

        $db = Database::getInstance()->getConnection();
        
        // Check email unique
        if (!empty($email)) {
            $stmt = $db->prepare("SELECT id FROM customers WHERE email = ? AND id != ?");
            $stmt->execute([$email, $customer['id']]);
            if ($stmt->fetch()) {
                Response::json(['success' => false, 'message' => 'Email này đã được sử dụng bởi tài khoản khác.'], 400);
            }
        }

        $stmtUpdate = $db->prepare("
            UPDATE customers 
            SET full_name = ?, name = ?, email = ?, birthday = ?, gender = ?, avatar_url = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmtUpdate->execute([
            $fullName,
            $fullName,
            !empty($email) ? $email : null,
            !empty($birthday) ? $birthday : null,
            !empty($gender) ? $gender : null,
            !empty($avatarUrl) ? $avatarUrl : null,
            $customer['id']
        ]);

        Response::json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công!'
        ]);
    }

    /**
     * POST /api/customer/profile/request-phone-change
     */
    public function requestPhoneChange() {
        $customer = AuthMiddleware::requireCustomer();
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));

        if (!ValidationService::isValidVietnamPhone($phone)) {
            Response::json(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 400);
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id FROM customers WHERE phone = ? AND id != ?");
        $stmt->execute([$phone, $customer['id']]);
        if ($stmt->fetch()) {
            Response::json(['success' => false, 'message' => 'Số điện thoại này đã được sử dụng bởi tài khoản khác.'], 400);
        }

        $otpService = new OtpService();
        $result = $otpService->requestOtp($phone, 'link_phone');

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['message']], 429);
        }

        $response = ['success' => true, 'message' => $result['message']];
        if (isset($result['devOtp'])) {
            $response['devOtp'] = $result['devOtp'];
        }
        Response::json($response);
    }

    /**
     * POST /api/customer/profile/verify-phone-change
     */
    public function verifyPhoneChange() {
        $customer = AuthMiddleware::requireCustomer();
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));
        $otp = trim(Request::input('otp', ''));

        if (empty($phone) || empty($otp)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin.'], 400);
        }

        $otpService = new OtpService();
        $result = $otpService->verifyOtp($phone, $otp, 'link_phone');

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['error']], 400);
        }

        $db = Database::getInstance()->getConnection();
        $oldPhone = $customer['phone'];

        $db->beginTransaction();
        try {
            // Update customer phone
            $stmt = $db->prepare("UPDATE customers SET phone = ?, phone_verified_at = NOW(), updated_at = NOW() WHERE id = ?");
            $stmt->execute([$phone, $customer['id']]);

            // Sync loyalty profiles and transactions if old phone exists
            if (!empty($oldPhone)) {
                $stmtSync = $db->prepare("UPDATE customer_loyalty_profiles SET customer_id = ?, phone = ? WHERE customer_id = ?");
                $stmtSync->execute([$phone, $phone, $oldPhone]);

                $stmtTx = $db->prepare("UPDATE customer_point_transactions SET customer_phone = ? WHERE customer_phone = ?");
                $stmtTx->execute([$phone, $oldPhone]);

                $stmtRed = $db->prepare("UPDATE loyalty_reward_redemptions SET customer_phone = ? WHERE customer_phone = ?");
                $stmtRed->execute([$phone, $oldPhone]);

                $stmtV = $db->prepare("UPDATE voucher_pools SET assigned_customer_id = ? WHERE assigned_customer_id = ?");
                $stmtV->execute([$phone, $oldPhone]);

                $stmtReq = $db->prepare("UPDATE shopee_point_requests SET phone = ? WHERE phone = ?");
                $stmtReq->execute([$phone, $oldPhone]);

                $stmtC = $db->prepare("UPDATE coupon_usages SET customer_phone = ? WHERE customer_phone = ?");
                $stmtC->execute([$phone, $oldPhone]);
            }

            $db->commit();
            Response::json([
                'success' => true,
                'message' => 'Đổi số điện thoại thành công!'
            ]);
        } catch (\Exception $e) {
            $db->rollBack();
            Response::json(['success' => false, 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/customer/profile/request-email-verification
     */
    public function requestEmailVerification() {
        $customer = AuthMiddleware::requireCustomer();
        $email = trim(Request::input('email', ''));

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['success' => false, 'message' => 'Email không hợp lệ.'], 400);
        }

        // Must be current email
        if ($email !== $customer['email']) {
            Response::json(['success' => false, 'message' => 'Email không khớp với hồ sơ.'], 400);
        }

        $otpService = new OtpService();
        $result = $otpService->requestEmailOtp($email, 'verify_email');

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['message']], 429);
        }

        $response = ['success' => true, 'message' => $result['message']];
        if (isset($result['devOtp'])) {
            $response['devOtp'] = $result['devOtp'];
        }
        Response::json($response);
    }

    /**
     * POST /api/customer/profile/verify-email
     */
    public function verifyEmail() {
        $customer = AuthMiddleware::requireCustomer();
        $email = trim(Request::input('email', ''));
        $otp = trim(Request::input('otp', ''));

        if (empty($email) || empty($otp)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin.'], 400);
        }

        if ($email !== $customer['email']) {
            Response::json(['success' => false, 'message' => 'Email không khớp với hồ sơ.'], 400);
        }

        $otpService = new OtpService();
        $result = $otpService->verifyOtp($email, $otp, 'verify_email');

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['error']], 400);
        }

        $db = Database::getInstance()->getConnection();

        try {
            $stmt = $db->prepare("UPDATE customers SET email_verified_at = NOW(), updated_at = NOW() WHERE id = ?");
            $stmt->execute([$customer['id']]);

            Response::json([
                'success' => true,
                'message' => 'Xác thực Email thành công!'
            ]);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/customer/profile/upload-avatar
     */
    public function uploadAvatar() {
        $customer = AuthMiddleware::requireCustomer();
        if (!isset($_FILES['avatar'])) {
            Response::json(['success' => false, 'message' => 'Vui lòng chọn một file ảnh.'], 400);
        }

        try {
            $upload = \App\Services\UploadService::uploadAvatarImage($_FILES['avatar']);
            $db = Database::getInstance()->getConnection();
            
            // Save to database
            $stmt = $db->prepare("UPDATE customers SET avatar_url = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$upload['image_url'], $customer['id']]);

            Response::json([
                'success' => true,
                'message' => 'Cập nhật ảnh đại diện thành công!',
                'avatarUrl' => $upload['image_url']
            ]);
        } catch (\Exception $e) {
            Response::json(['success' => false, 'message' => 'Lỗi upload: ' . $e->getMessage()], 400);
        }
    }
}
