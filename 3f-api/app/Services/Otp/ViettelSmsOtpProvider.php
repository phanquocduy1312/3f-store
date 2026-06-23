<?php
namespace App\Services\Otp;

class ViettelSmsOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $appId = getenv('VIETTEL_SMS_APP_ID');
        if (empty($appId)) {
            return new OtpSendResult(false, 'viettel', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
        }
        // Placeholder for future API integration
        return new OtpSendResult(false, 'viettel', null, null, 'Chưa cấu hình nhà cung cấp OTP.');
    }
}
