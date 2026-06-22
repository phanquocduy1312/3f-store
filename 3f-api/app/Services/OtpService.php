<?php
namespace App\Services;

use App\Core\Database;
use App\Models\CustomerOtp;
use Exception;

/**
 * OTP service handling rate limiting and delivery abstraction.
 */
class OtpService {
    private $db;
    private $legacyOtpModel;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->legacyOtpModel = new CustomerOtp();

        $appEnv = getenv('APP_ENV') ?: 'development';
        if (in_array(strtolower($appEnv), ['production', 'staging'])) {
            $otpSecret = getenv('OTP_SECRET');
            if ($otpSecret === false || $otpSecret === '') {
                throw new Exception("OTP_SECRET is required on staging/production.");
            }
        }
    }

    /**
     * Select OTP provider dynamically.
     */
    private function selectProvider() {
        $providerName = getenv('OTP_PROVIDER') ?: 'mock';
        $appEnv = getenv('APP_ENV') ?: 'development';
        if (strtolower($appEnv) === 'production' && strtolower($providerName) === 'mock') {
            throw new Exception("Mock OTP provider is not allowed on production.");
        }
        switch (strtolower($providerName)) {
            case 'speedsms':
                return new \App\Services\Otp\SpeedSmsOtpProvider();
            case 'fpt':
            case 'fptsms':
                return new \App\Services\Otp\FptSmsOtpProvider();
            case 'viettel':
            case 'viettelsms':
                return new \App\Services\Otp\ViettelSmsOtpProvider();
            case 'stringee':
                return new \App\Services\Otp\StringeeOtpProvider();
            case 'mock':
            default:
                return new \App\Services\Otp\MockOtpProvider();
        }
    }

    /**
     * Check if OTP can be resent.
     */
    public function canResend($phone, $purpose) {
        $cooldownSeconds = (int)(getenv('OTP_RESEND_COOLDOWN_SECONDS') ?: 60);
        $stmt = $this->db->prepare("
            SELECT created_at FROM otp_requests
            WHERE phone = :phone AND purpose = :purpose
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => $phone, ':purpose' => $purpose]);
        $lastRequest = $stmt->fetch();
        if ($lastRequest) {
            $seconds = time() - strtotime($lastRequest['created_at']);
            if ($seconds < $cooldownSeconds) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check daily send limit.
     */
    private function checkDailyLimit($phone) {
        $dailyLimit = (int)(getenv('OTP_DAILY_LIMIT') ?: 5);
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM otp_requests
            WHERE phone = :phone AND created_at >= DATE(NOW())
        ");
        $stmt->execute([':phone' => $phone]);
        $count = (int)$stmt->fetchColumn();
        return $count < $dailyLimit;
    }

    /**
     * Request OTP with rate limiting.
     */
    public function requestOtp($phone, $purpose, $customerId = null) {
        $phone = trim($phone);
        $appEnv = getenv('APP_ENV') ?: 'development';
        $providerName = getenv('OTP_PROVIDER') ?: 'mock';
        if (strtolower($appEnv) === 'production' && strtolower($providerName) === 'mock') {
            return [
                'success' => false,
                'message' => 'Chưa cấu hình nhà cung cấp OTP.',
            ];
        }

        if (!$this->canResend($phone, $purpose)) {
            return [
                'success' => false,
                'message' => 'Vui lòng đợi 60 giây trước khi gửi lại mã.',
            ];
        }

        if (!$this->checkDailyLimit($phone)) {
            return [
                'success' => false,
                'message' => 'Số điện thoại đã gửi quá số lần cho phép trong ngày.',
            ];
        }

        // Invalidate previous unverified OTPs for same phone + purpose
        $this->db->prepare("
            UPDATE otp_requests SET expires_at = NOW()
            WHERE phone = :phone AND purpose = :purpose AND verified_at IS NULL
        ")->execute([':phone' => $phone, ':purpose' => $purpose]);

        // Generate 6-digit OTP
        $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $provider = $this->selectProvider();
        
        $message = "Ma OTP 3F Store cua ban la: $code. Hieu luc trong 5 phut.";
        $result = $provider->sendOtp($phone, $message);

        // Save to otp_requests
        $expiresMinutes = (int)(getenv('OTP_EXPIRES_MINUTES') ?: 5);
        $expiresAt = date('Y-m-d H:i:s', time() + ($expiresMinutes * 60));

        $otpSecret = getenv('OTP_SECRET');
        if (in_array(strtolower($appEnv), ['production', 'staging'])) {
            if ($otpSecret === false || $otpSecret === '') {
                throw new Exception("OTP_SECRET is required and cannot be empty on staging/production.");
            }
        } else {
            $otpSecret = $otpSecret ?: '';
        }

        $stmt = $this->db->prepare("
            INSERT INTO otp_requests (phone, purpose, otp_hash, provider, expires_at, ip_address, user_agent, metadata_json)
            VALUES (:phone, :purpose, :otp_hash, :provider, :expires_at, :ip_address, :user_agent, :metadata_json)
        ");
        $stmt->execute([
            ':phone' => $phone,
            ':purpose' => $purpose,
            ':otp_hash' => password_hash($code . $otpSecret, PASSWORD_BCRYPT),
            ':provider' => $result->provider,
            ':expires_at' => $expiresAt,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            ':metadata_json' => json_encode(['customer_id' => $customerId])
        ]);

        $this->logSend($phone, $purpose, $result->provider, $result->success ? 'success' : 'failed', $result->errorMessage, $result->rawResponse);

        if (!$result->success) {
            return [
                'success' => false,
                'message' => $result->errorMessage ?: 'Gửi mã OTP thất bại.',
            ];
        }

        $res = [
            'success' => true,
            'message' => 'Mã OTP đã được gửi.',
        ];

        // Only provide devOtp if in development environment
        if (strtolower($appEnv) === 'development') {
            $res['devOtp'] = $code;
        }

        return $res;
    }

    /**
     * Request OTP for email (legacy fallback).
     */
    public function requestEmailOtp($email, $purpose) {
        return $this->legacyOtpModel->createOtp($email, $purpose);
    }

    /**
     * Verify OTP.
     */
    public function verifyOtp($phone, $otp, $purpose) {
        $phone = trim($phone);
        $maxAttempts = (int)(getenv('OTP_MAX_VERIFY_ATTEMPTS') ?: 5);

        $stmt = $this->db->prepare("
            SELECT * FROM otp_requests
            WHERE phone = :phone AND purpose = :purpose
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => $phone, ':purpose' => $purpose]);
        $request = $stmt->fetch();

        if (!$request) {
            return ['success' => false, 'error' => 'Mã OTP không đúng.'];
        }

        if ($request['verified_at'] !== null) {
            return ['success' => false, 'error' => 'Mã OTP đã được sử dụng.'];
        }

        if (strtotime($request['expires_at']) < time()) {
            return ['success' => false, 'error' => 'Mã OTP đã hết hạn.'];
        }

        if ((int)$request['failed_attempts'] >= $maxAttempts) {
            return ['success' => false, 'error' => 'Mã OTP không đúng.'];
        }

        $appEnv = getenv('APP_ENV') ?: 'development';
        $otpSecret = getenv('OTP_SECRET');
        if (in_array(strtolower($appEnv), ['production', 'staging'])) {
            if ($otpSecret === false || $otpSecret === '') {
                throw new Exception("OTP_SECRET is required and cannot be empty on staging/production.");
            }
        } else {
            $otpSecret = $otpSecret ?: '';
        }

        if (!password_verify($otp . $otpSecret, $request['otp_hash'])) {
            $this->db->prepare("UPDATE otp_requests SET failed_attempts = failed_attempts + 1 WHERE id = :id")
                ->execute([':id' => $request['id']]);
            return ['success' => false, 'error' => 'Mã OTP không đúng.'];
        }

        // Success: Mark verified and generate verification token
        $token = bin2hex(random_bytes(32));
        $meta = json_decode($request['metadata_json'] ?: '{}', true);
        $meta['verification_token'] = $token;
        $meta['token_expires_at'] = date('Y-m-d H:i:s', time() + 900); // 15 mins

        $this->db->prepare("
            UPDATE otp_requests 
            SET verified_at = NOW(), metadata_json = :meta 
            WHERE id = :id
        ")->execute([
            ':meta' => json_encode($meta),
            ':id' => $request['id']
        ]);

        return [
            'success' => true,
            'verificationToken' => $token
        ];
    }

    /**
     * Validate a verification token.
     */
    public function validateVerificationToken($phone, $token, $purpose) {
        $phone = trim($phone);
        $stmt = $this->db->prepare("
            SELECT * FROM otp_requests
            WHERE phone = :phone AND purpose = :purpose AND verified_at IS NOT NULL
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => $phone, ':purpose' => $purpose]);
        $request = $stmt->fetch();
        if ($request) {
            $meta = json_decode($request['metadata_json'] ?: '{}', true);
            if (isset($meta['verification_token']) && $meta['verification_token'] === $token) {
                $expiry = isset($meta['token_expires_at']) ? strtotime($meta['token_expires_at']) : 0;
                if ($expiry > time()) {
                    return true;
                }
            }
        }
        return $this->legacyOtpModel->validateVerificationToken($phone, $token, $purpose);
    }

    /**
     * Consume a verification token to make it single-use.
     */
    public function consumeVerificationToken($phone, $token, $purpose) {
        $phone = trim($phone);
        $stmt = $this->db->prepare("
            SELECT * FROM otp_requests
            WHERE phone = :phone AND purpose = :purpose AND verified_at IS NOT NULL
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => $phone, ':purpose' => $purpose]);
        $request = $stmt->fetch();
        if ($request) {
            $meta = json_decode($request['metadata_json'] ?: '{}', true);
            if (isset($meta['verification_token']) && $meta['verification_token'] === $token) {
                unset($meta['verification_token']);
                unset($meta['token_expires_at']);
                $meta['consumed'] = true;
                $meta['consumed_at'] = date('Y-m-d H:i:s');
                
                $this->db->prepare("
                    UPDATE otp_requests 
                    SET metadata_json = :meta 
                    WHERE id = :id
                ")->execute([
                    ':meta' => json_encode($meta),
                    ':id' => $request['id']
                ]);
                return true;
            }
        }
        return false;
    }

    /**
     * Log send attempt.
     */
    public function logSend($phone, $purpose, $provider, $status, $errorMessage = null, $providerResponse = null) {
        $stmt = $this->db->prepare("
            INSERT INTO otp_send_logs (phone, purpose, provider, status, error_message, provider_response, ip_address)
            VALUES (:phone, :purpose, :provider, :status, :error_message, :provider_response, :ip_address)
        ");
        $stmt->execute([
            ':phone' => $phone,
            ':purpose' => $purpose,
            ':provider' => $provider,
            ':status' => $status,
            ':error_message' => $errorMessage,
            ':provider_response' => $providerResponse,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
        ]);
    }
}

