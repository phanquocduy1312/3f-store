<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Customer;
use App\Models\CustomerSession;
use App\Services\OtpService;
use App\Services\ValidationService;
use App\Helpers\AuthMiddleware;

/**
 * Customer authentication controller.
 * Handles email/password registration, phone/OTP flows, login, logout, profile.
 */
class CustomerAuthController {

    /**
     * POST /api/customer/auth/register-email
     */
    public function registerEmail() {
        $fullName = trim(Request::input('fullName', ''));
        $email = trim(Request::input('email', ''));
        $password = Request::input('password', '');
        $passwordConfirmation = Request::input('passwordConfirmation', '');
        $acceptTerms = Request::input('acceptTerms', false);

        // Validate
        if (empty($fullName)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập họ tên.'], 400);
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['success' => false, 'message' => 'Email không hợp lệ.'], 400);
        }
        if (strlen($password) < 6) {
            Response::json(['success' => false, 'message' => 'Mật khẩu tối thiểu 6 ký tự.'], 400);
        }
        if ($password !== $passwordConfirmation) {
            Response::json(['success' => false, 'message' => 'Mật khẩu nhập lại không khớp.'], 400);
        }
        if (!$acceptTerms) {
            Response::json(['success' => false, 'message' => 'Bạn cần đồng ý với điều khoản để tiếp tục.'], 400);
        }

        $customerModel = new Customer();

        // Check email uniqueness
        if ($customerModel->findByEmail($email)) {
            Response::json(['success' => false, 'message' => 'Email này đã được sử dụng.'], 400);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $customerId = $customerModel->createByEmail($fullName, $email, $passwordHash);

        // Create session
        $sessionModel = new CustomerSession();
        $token = $sessionModel->createSession($customerId);
        $customerModel->updateLastLogin($customerId);

        Response::json([
            'success' => true,
            'data' => [
                'token' => $token,
                'customer' => $this->formatCustomer($customerModel->findById($customerId)),
            ],
        ]);
    }

    /**
     * POST /api/customer/auth/login-password
     */
    public function loginPassword() {
        $identifier = trim(Request::input('identifier', ''));
        $password = Request::input('password', '');

        if (empty($identifier) || empty($password)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin.'], 400);
        }

        $customerModel = new Customer();

        // Determine if identifier is email or phone
        $customer = null;
        if (strpos($identifier, '@') !== false) {
            $customer = $customerModel->findByEmail($identifier);
        } else {
            $normalized = ValidationService::normalizePhone($identifier);
            if (!empty($normalized)) {
                $customer = $customerModel->findByPhone($normalized);
            }
        }

        if (!$customer || empty($customer['password_hash'])) {
            Response::json(['success' => false, 'message' => 'Email/Số điện thoại hoặc mật khẩu không đúng.'], 401);
        }

        if ($customer['status'] === 'blocked') {
            Response::json(['success' => false, 'message' => 'Tài khoản đã bị khóa.'], 403);
        }

        if (!password_verify($password, $customer['password_hash'])) {
            Response::json(['success' => false, 'message' => 'Email/Số điện thoại hoặc mật khẩu không đúng.'], 401);
        }

        $sessionModel = new CustomerSession();
        $token = $sessionModel->createSession($customer['id']);
        $customerModel->updateLastLogin($customer['id']);

        Response::json([
            'success' => true,
            'data' => [
                'token' => $token,
                'customer' => $this->formatCustomer($customer),
            ],
        ]);
    }

    /**
     * POST /api/customer/auth/request-otp
     */
    public function requestOtp() {
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));
        $purpose = Request::input('purpose', 'login');

        if (!ValidationService::isValidVietnamPhone($phone)) {
            Response::json(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 400);
        }

        $validPurposes = ['login', 'register', 'reset_password', 'link_phone'];
        if (!in_array($purpose, $validPurposes)) {
            Response::json(['success' => false, 'message' => 'Mục đích không hợp lệ.'], 400);
        }

        // For register purpose, check if phone already exists
        if ($purpose === 'register') {
            $customerModel = new Customer();
            if ($customerModel->findByPhone($phone)) {
                Response::json([
                    'success' => false,
                    'message' => 'Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.',
                    'code' => 'PHONE_EXISTS',
                ], 400);
            }
        }

        $otpService = new OtpService();
        $result = $otpService->requestOtp($phone, $purpose);

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
     * POST /api/customer/auth/verify-otp
     */
    public function verifyOtp() {
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));
        $otp = trim(Request::input('otp', ''));
        $purpose = Request::input('purpose', 'login');

        if (empty($phone) || empty($otp)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin.'], 400);
        }

        $otpService = new OtpService();
        $result = $otpService->verifyOtp($phone, $otp, $purpose);

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['error']], 400);
        }

        // For login purpose, auto-login if customer exists
        if ($purpose === 'login') {
            $customerModel = new Customer();
            $customer = $customerModel->findByPhone($phone);
            if ($customer) {
                if ($customer['status'] === 'blocked') {
                    Response::json(['success' => false, 'message' => 'Tài khoản đã bị khóa.'], 403);
                }
                $sessionModel = new CustomerSession();
                $token = $sessionModel->createSession($customer['id']);
                $customerModel->updateLastLogin($customer['id']);
                Response::json([
                    'success' => true,
                    'action' => 'logged_in',
                    'data' => [
                        'token' => $token,
                        'customer' => $this->formatCustomer($customer),
                    ],
                ]);
            } else {
                // Phone not registered, need to complete registration
                Response::json([
                    'success' => true,
                    'action' => 'need_register',
                    'verificationToken' => $result['verificationToken'],
                    'message' => 'Số điện thoại chưa có tài khoản. Vui lòng hoàn tất đăng ký.',
                ]);
            }
        }

        // For register/link_phone purpose, return verification token
        Response::json([
            'success' => true,
            'action' => 'verified',
            'verificationToken' => $result['verificationToken'],
        ]);
    }

    /**
     * POST /api/customer/auth/complete-phone-register
     */
    public function completePhoneRegister() {
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));
        $verificationToken = trim(Request::input('verificationToken', ''));
        $fullName = trim(Request::input('fullName', ''));
        $email = trim(Request::input('email', ''));
        $password = Request::input('password', '');
        $passwordConfirmation = Request::input('passwordConfirmation', '');
        $acceptTerms = Request::input('acceptTerms', false);

        if (empty($fullName)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập họ tên.'], 400);
        }
        if (!$acceptTerms) {
            Response::json(['success' => false, 'message' => 'Bạn cần đồng ý với điều khoản để tiếp tục.'], 400);
        }

        // Validate verification token
        $otpService = new OtpService();
        if (!$otpService->validateVerificationToken($phone, $verificationToken, 'register')) {
            // Also check login purpose (for users redirected from OTP login)
            if (!$otpService->validateVerificationToken($phone, $verificationToken, 'login')) {
                Response::json(['success' => false, 'message' => 'Mã xác nhận đã hết hạn. Vui lòng thử lại.'], 400);
            }
        }

        // Optional password
        $passwordHash = null;
        if (!empty($password)) {
            if (strlen($password) < 6) {
                Response::json(['success' => false, 'message' => 'Mật khẩu tối thiểu 6 ký tự.'], 400);
            }
            if ($password !== $passwordConfirmation) {
                Response::json(['success' => false, 'message' => 'Mật khẩu nhập lại không khớp.'], 400);
            }
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        }

        // Optional email
        $emailValue = null;
        if (!empty($email)) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::json(['success' => false, 'message' => 'Email không hợp lệ.'], 400);
            }
            $customerModel = new Customer();
            if ($customerModel->findByEmail($email)) {
                Response::json(['success' => false, 'message' => 'Email này đã được sử dụng.'], 400);
            }
            $emailValue = $email;
        }

        $customerModel = new Customer();
        if ($customerModel->findByPhone($phone)) {
            Response::json(['success' => false, 'message' => 'Số điện thoại này đã có tài khoản.'], 400);
        }

        $customerId = $customerModel->createByPhone($phone, $fullName, $emailValue, $passwordHash);

        $sessionModel = new CustomerSession();
        $token = $sessionModel->createSession($customerId);
        $customerModel->updateLastLogin($customerId);

        Response::json([
            'success' => true,
            'data' => [
                'token' => $token,
                'customer' => $this->formatCustomer($customerModel->findById($customerId)),
            ],
        ]);
    }

    /**
     * GET /api/customer/auth/me
     */
    public function me() {
        $customer = AuthMiddleware::requireCustomer();
        Response::json([
            'success' => true,
            'data' => $this->formatCustomer($customer),
        ]);
    }

    /**
     * POST /api/customer/auth/logout
     */
    public function logout() {
        $token = AuthMiddleware::extractBearerToken();
        if ($token) {
            $sessionModel = new CustomerSession();
            $sessionModel->revokeToken($token);
        }
        Response::json(['success' => true, 'message' => 'Đăng xuất thành công.']);
    }

    /**
     * POST /api/customer/auth/add-phone
     */
    public function addPhone() {
        $customer = AuthMiddleware::requireCustomer();
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));

        if (!ValidationService::isValidVietnamPhone($phone)) {
            Response::json(['success' => false, 'message' => 'Số điện thoại không hợp lệ.'], 400);
        }

        if (!empty($customer['phone'])) {
            Response::json(['success' => false, 'message' => 'Tài khoản đã có số điện thoại.'], 400);
        }

        // Check if phone already belongs to another customer
        $customerModel = new Customer();
        $existing = $customerModel->findByPhone($phone);
        if ($existing && (int)$existing['id'] !== (int)$customer['id']) {
            Response::json(['success' => false, 'message' => 'Số điện thoại này đã thuộc tài khoản khác.'], 400);
        }

        // Send OTP
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
     * POST /api/customer/auth/verify-add-phone
     */
    public function verifyAddPhone() {
        $customer = AuthMiddleware::requireCustomer();
        $phone = ValidationService::normalizePhone(Request::input('phone', ''));
        $otp = trim(Request::input('otp', ''));

        $otpService = new OtpService();
        $result = $otpService->verifyOtp($phone, $otp, 'link_phone');

        if (!$result['success']) {
            Response::json(['success' => false, 'message' => $result['error']], 400);
        }

        $customerModel = new Customer();
        $existing = $customerModel->findByPhone($phone);
        if ($existing && (int)$existing['id'] !== (int)$customer['id']) {
            Response::json(['success' => false, 'message' => 'Số điện thoại này đã thuộc tài khoản khác.'], 400);
        }

        $customerModel->updatePhone($customer['id'], $phone);

        $updatedCustomer = $customerModel->findById($customer['id']);
        Response::json([
            'success' => true,
            'message' => 'Liên kết số điện thoại thành công!',
            'data' => $this->formatCustomer($updatedCustomer),
        ]);
    }

    // ─── Helpers ───

    private function formatCustomer($customer) {
        if (!$customer) return null;
        return [
            'id' => (int)$customer['id'],
            'fullName' => $customer['full_name'] ?? $customer['name'] ?? '',
            'email' => $customer['email'] ?? null,
            'phone' => $customer['phone'] ?? null,
            'status' => $customer['status'] ?? 'active',
            'avatarUrl' => $customer['avatar_url'] ?? null,
            'phoneVerified' => !empty($customer['phone_verified_at']),
            'emailVerified' => !empty($customer['email_verified_at']),
        ];
    }
}
