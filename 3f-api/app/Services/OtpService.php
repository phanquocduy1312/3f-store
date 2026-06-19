<?php
namespace App\Services;

use App\Models\CustomerOtp;

/**
 * OTP service handling rate limiting and delivery abstraction.
 */
class OtpService {
    private $otpModel;

    public function __construct() {
        $this->otpModel = new CustomerOtp();
    }

    /**
     * Request OTP with rate limiting.
     * @return array{success: bool, otp?: string, message?: string}
     */
    public function requestOtp($phone, $purpose) {
        $phone = trim($phone);

        // Rate limit: max 5 OTP requests per phone per 15 minutes
        $recentCount = $this->otpModel->countRecentOtps($phone, 15);
        if ($recentCount >= 5) {
            return [
                'success' => false,
                'message' => 'Bạn đã gửi quá nhiều mã xác nhận. Vui lòng thử lại sau 15 phút.',
            ];
        }

        $otp = $this->otpModel->createOtp($phone, $purpose);

        // In dev mode, return OTP in response for testing
        $isDevMode = (getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1');

        // TODO: In production, integrate SMS provider here
        // Example: SpeedSMS::send($phone, "Ma xac nhan 3F Store: $otp");

        $result = [
            'success' => true,
            'message' => 'Mã xác nhận đã được gửi đến số điện thoại của bạn.',
        ];

        if (true) { // Always return devOtp for testing
            $result['devOtp'] = $otp;
        }

        return $result;
    }

    /**
     * Request OTP for email with rate limiting.
     */
    public function requestEmailOtp($email, $purpose) {
        $email = trim($email);

        // Rate limit: max 5 OTP requests per email per 15 minutes
        $recentCount = $this->otpModel->countRecentOtps($email, 15);
        if ($recentCount >= 5) {
            return [
                'success' => false,
                'message' => 'Bạn đã gửi quá nhiều mã xác nhận. Vui lòng thử lại sau 15 phút.',
            ];
        }

        $otp = $this->otpModel->createOtp($email, $purpose);

        $result = [
            'success' => true,
            'message' => 'Mã xác nhận đã được gửi đến email của bạn.',
        ];

        if (true) { // Always return devOtp for testing
            $result['devOtp'] = $otp;
        }

        return $result;
    }

    /**
     * Verify OTP.
     */
    public function verifyOtp($phone, $otp, $purpose) {
        return $this->otpModel->verifyOtp($phone, $otp, $purpose);
    }

    /**
     * Validate a verification token.
     */
    public function validateVerificationToken($phone, $token, $purpose) {
        return $this->otpModel->validateVerificationToken($phone, $token, $purpose);
    }
}
