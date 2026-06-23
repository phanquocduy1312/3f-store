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
        $phone = Request::input('phone', null);

        // Validate
        if (empty($fullName)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập họ tên.'], 400);
        }
        if (strlen($fullName) > 191) {
            Response::json(['success' => false, 'message' => 'Họ tên tối đa 191 ký tự.'], 400);
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

        // Normalize email
        $email = strtolower(trim($email));

        $db = \App\Core\Database::getInstance()->getConnection();
        $this->ensurePendingRegistrationsTable($db);

        // Cleanup expired records
        $db->exec("DELETE FROM pending_registrations WHERE expires_at < NOW()");

        $customerModel = new Customer();

        // Check if email already exists in customers
        if ($customerModel->findByEmail($email)) {
            Response::json(['success' => false, 'message' => 'Email này đã được đăng ký.'], 400);
        }

        $today = date('Y-m-d');
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 60 minutes
        
        // Check if exists in pending_registrations
        $stmtPending = $db->prepare("SELECT * FROM pending_registrations WHERE email = ? LIMIT 1");
        $stmtPending->execute([$email]);
        $pending = $stmtPending->fetch(\PDO::FETCH_ASSOC);

        $rawToken = bin2hex(random_bytes(32));
        $tokenHash = $this->hashToken($rawToken);

        $emailService = new \App\Services\EmailService();

        if ($pending) {
            // Check cooldown
            $lastSent = strtotime($pending['last_sent_at'] ?? '1970-01-01 00:00:00');
            $secondsElapsed = time() - $lastSent;
            $cooldown = (int)(getenv('EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS') ?: 60);
            if ($secondsElapsed < $cooldown) {
                Response::json([
                    'success' => false,
                    'message' => 'Vui lòng chờ trước khi gửi lại email xác thực.'
                ], 429);
            }

            // Check daily limit
            $dailyCount = (int)$pending['daily_send_count'];
            $dailyDate = $pending['daily_send_date'];
            $limit = (int)(getenv('EMAIL_VERIFICATION_DAILY_LIMIT') ?: 5);

            if ($dailyDate === $today) {
                if ($dailyCount >= $limit) {
                    Response::json([
                        'success' => false,
                        'message' => 'Bạn đã vượt quá số lần gửi email xác thực trong ngày.'
                    ], 429);
                }
                $newDailyCount = $dailyCount + 1;
            } else {
                $newDailyCount = 1;
            }

            // Update pending record
            $stmtUpdate = $db->prepare("
                UPDATE pending_registrations 
                SET token_hash = ?, 
                    expires_at = ?, 
                    last_sent_at = NOW(), 
                    resend_count = resend_count + 1, 
                    daily_send_date = ?, 
                    daily_send_count = ?, 
                    updated_at = NOW(),
                    ip_address = ?,
                    user_agent = ?
                WHERE id = ?
            ");
            $stmtUpdate->execute([
                $tokenHash, 
                $expiresAt, 
                $today, 
                $newDailyCount, 
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $pending['id']
            ]);
        } else {
            // Hash password
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            // Create new pending record
            $stmtInsert = $db->prepare("
                INSERT INTO pending_registrations (
                    email, full_name, phone, password_hash, token_hash, expires_at, 
                    last_sent_at, resend_count, daily_send_date, daily_send_count, 
                    ip_address, user_agent, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 
                    NOW(), 1, ?, 1, 
                    ?, ?, NOW()
                )
            ");
            $stmtInsert->execute([
                $email, 
                $fullName, 
                $phone, 
                $passwordHash, 
                $tokenHash, 
                $expiresAt, 
                $today,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        }

        // Send email
        $mailResult = $emailService->sendVerificationEmail($email, $fullName, $rawToken);

        if (!$mailResult['success']) {
            Response::json([
                'success' => false,
                'message' => 'Không thể gửi email xác thực: ' . ($mailResult['error'] ?? 'Lỗi SMTP.')
            ], 500);
        }

        if (!empty($mailResult['logged'])) {
            Response::json([
                'success' => true,
                'message' => 'Email xác thực đã được tạo ở môi trường development.',
                'devVerifyUrl' => $mailResult['verifyUrl']
            ]);
        }

        Response::json([
            'success' => true,
            'message' => '3F Store đã gửi email xác thực. Vui lòng kiểm tra hộp thư để hoàn tất đăng ký.'
        ]);
    }

    /**
     * POST /api/customer/auth/verify-registration
     */
    public function verifyRegistration() {
        $email = trim(Request::input('email', ''));
        $token = trim(Request::input('token', ''));

        if (empty($email) || empty($token)) {
            Response::json(['success' => false, 'message' => 'Thiếu thông tin email hoặc token xác thực.'], 400);
        }

        $email = strtolower(trim($email));
        $tokenHash = $this->hashToken($token);

        $db = \App\Core\Database::getInstance()->getConnection();
        $this->ensurePendingRegistrationsTable($db);

        // Cleanup expired records
        $db->exec("DELETE FROM pending_registrations WHERE expires_at < NOW()");

        // Find pending record
        $stmt = $db->prepare("SELECT * FROM pending_registrations WHERE email = ? AND token_hash = ? LIMIT 1");
        $stmt->execute([$email, $tokenHash]);
        $pending = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$pending) {
            Response::json(['success' => false, 'message' => 'Link xác thực không hợp lệ hoặc đã được sử dụng.'], 400);
        }

        // Check if expired
        if (strtotime($pending['expires_at']) < time()) {
            $stmtDel = $db->prepare("DELETE FROM pending_registrations WHERE id = ?");
            $stmtDel->execute([$pending['id']]);
            Response::json([
                'success' => false,
                'message' => 'Link xác thực đã hết hạn. Vui lòng đăng ký lại hoặc gửi lại email xác thực.'
            ], 400);
        }

        $customerModel = new Customer();
        // Double check email does not exist in customers
        if ($customerModel->findByEmail($email)) {
            $stmtDel = $db->prepare("DELETE FROM pending_registrations WHERE id = ?");
            $stmtDel->execute([$pending['id']]);
            Response::json(['success' => false, 'message' => 'Email này đã được đăng ký.'], 400);
        }

        $db->beginTransaction();
        try {
            // Create customer
            $stmtInsert = $db->prepare("
                INSERT INTO customers (
                    full_name, name, email, phone, password_hash, status, email_verified_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
            ");
            $stmtInsert->execute([
                $pending['full_name'],
                $pending['full_name'],
                $pending['email'],
                $pending['phone'] ?: null,
                $pending['password_hash'],
            ]);
            $customerId = $db->lastInsertId();

            // Delete pending record
            $stmtDel = $db->prepare("DELETE FROM pending_registrations WHERE id = ?");
            $stmtDel->execute([$pending['id']]);

            // Create session
            $sessionModel = new CustomerSession();
            $sessionToken = $sessionModel->createSession($customerId);
            $customerModel->updateLastLogin($customerId);

            $db->commit();

            Response::json([
                'success' => true,
                'message' => 'Xác thực email thành công.',
                'data' => [
                    'token' => $sessionToken,
                    'customer' => $this->formatCustomer($customerModel->findById($customerId)),
                ]
            ]);
        } catch (\Exception $e) {
            $db->rollBack();
            Response::json(['success' => false, 'message' => 'Đã xảy ra lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/customer/auth/resend-registration-verification
     */
    public function resendRegistrationVerification() {
        $email = trim(Request::input('email', ''));
        if (empty($email)) {
            Response::json(['success' => false, 'message' => 'Vui lòng nhập địa chỉ email.'], 400);
        }

        $email = strtolower(trim($email));

        $commonMessage = 'Nếu email hợp lệ, 3F Store sẽ gửi hướng dẫn xác thực.';

        $customerModel = new Customer();
        // If email already verified/registered in customers, return generic message for security
        if ($customerModel->findByEmail($email)) {
            Response::json(['success' => true, 'message' => $commonMessage]);
        }

        $db = \App\Core\Database::getInstance()->getConnection();
        $this->ensurePendingRegistrationsTable($db);

        // Cleanup expired records
        $db->exec("DELETE FROM pending_registrations WHERE expires_at < NOW()");

        // Find pending record
        $stmt = $db->prepare("SELECT * FROM pending_registrations WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $pending = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$pending) {
            Response::json(['success' => true, 'message' => $commonMessage]);
        }

        // Check cooldown
        $lastSent = strtotime($pending['last_sent_at'] ?? '1970-01-01 00:00:00');
        $secondsElapsed = time() - $lastSent;
        $cooldown = (int)(getenv('EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS') ?: 60);
        if ($secondsElapsed < $cooldown) {
            Response::json([
                'success' => false,
                'message' => 'Vui lòng chờ trước khi gửi lại email xác thực.'
            ], 429);
        }

        // Check daily limit
        $today = date('Y-m-d');
        $dailyCount = (int)$pending['daily_send_count'];
        $dailyDate = $pending['daily_send_date'];
        $limit = (int)(getenv('EMAIL_VERIFICATION_DAILY_LIMIT') ?: 5);

        if ($dailyDate === $today) {
            if ($dailyCount >= $limit) {
                Response::json([
                    'success' => false,
                    'message' => 'Bạn đã vượt quá số lần gửi email xác thực trong ngày.'
                ], 429);
            }
            $newDailyCount = $dailyCount + 1;
        } else {
            $newDailyCount = 1;
        }

        $rawToken = bin2hex(random_bytes(32));
        $tokenHash = $this->hashToken($rawToken);
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 60 minutes

        // Update pending record with new token
        $stmtUpdate = $db->prepare("
            UPDATE pending_registrations 
            SET token_hash = ?, 
                expires_at = ?, 
                last_sent_at = NOW(), 
                resend_count = resend_count + 1, 
                daily_send_date = ?, 
                daily_send_count = ?, 
                updated_at = NOW(),
                ip_address = ?,
                user_agent = ?
            WHERE id = ?
        ");
        $stmtUpdate->execute([
            $tokenHash, 
            $expiresAt, 
            $today, 
            $newDailyCount, 
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $pending['id']
        ]);

        $emailService = new \App\Services\EmailService();
        $mailResult = $emailService->sendVerificationEmail($email, $pending['full_name'], $rawToken);

        if (!$mailResult['success']) {
            Response::json([
                'success' => false,
                'message' => 'Không thể gửi email xác thực: ' . ($mailResult['error'] ?? 'Lỗi SMTP.')
            ], 500);
        }

        if (!empty($mailResult['logged'])) {
            Response::json([
                'success' => true,
                'message' => 'Email xác thực đã được tạo ở môi trường development.',
                'devVerifyUrl' => $mailResult['verifyUrl']
            ]);
        }

        Response::json([
            'success' => true,
            'message' => '3F Store đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.'
        ]);
    }

    private function hashToken($rawToken) {
        $secret = getenv('OTP_SECRET') ?: getenv('EMAIL_SECRET') ?: getenv('APP_KEY') ?: '3f_email_verification_secret_key_2026';
        return hash_hmac('sha256', $rawToken, $secret);
    }

    private function ensurePendingRegistrationsTable($db) {
        static $checked = false;
        if ($checked) return;
        $checked = true;
        try {
            // Check driver type, only run on mysql
            if ($db->getAttribute(\PDO::ATTR_DRIVER_NAME) !== 'mysql') {
                return;
            }
            $stmt = $db->query("SHOW TABLES LIKE 'pending_registrations'");
            if (!$stmt->fetch()) {
                $db->exec("CREATE TABLE pending_registrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(191) NOT NULL,
                    full_name VARCHAR(191) NOT NULL,
                    phone VARCHAR(30) NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    token_hash VARCHAR(255) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    last_sent_at DATETIME NULL,
                    resend_count INT NOT NULL DEFAULT 0,
                    daily_send_date DATE NULL,
                    daily_send_count INT NOT NULL DEFAULT 0,
                    ip_address VARCHAR(64) NULL,
                    user_agent TEXT NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NULL,
                    UNIQUE KEY uniq_pending_email (email),
                    INDEX idx_pending_token_hash (token_hash),
                    INDEX idx_pending_expires_at (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
            }
        } catch (\Throwable $e) {
            error_log("Unable to ensure pending_registrations table: " . $e->getMessage());
        }
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
