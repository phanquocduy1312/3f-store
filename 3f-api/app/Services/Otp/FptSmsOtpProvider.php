<?php
namespace App\Services\Otp;

class FptSmsOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $clientSecret = getenv('FPT_SMS_CLIENT_SECRET');
        if (empty($clientSecret)) {
            return new OtpSendResult(false, 'fpt', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
        }
        // Placeholder for future API integration
        return new OtpSendResult(false, 'fpt', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
    }
}
