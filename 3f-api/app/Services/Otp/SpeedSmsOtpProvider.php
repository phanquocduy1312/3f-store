<?php
namespace App\Services\Otp;

class SpeedSmsOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $apiKey = getenv('SPEEDSMS_API_KEY');
        if (empty($apiKey)) {
            return new OtpSendResult(false, 'speedsms', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
        }
        // Placeholder for future API integration
        return new OtpSendResult(false, 'speedsms', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
    }
}
