<?php
namespace App\Services\Otp;

class MockOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $appEnv = getenv('APP_ENV') ?: 'development';
        if (strtolower($appEnv) === 'production') {
            throw new \Exception("Mock OTP provider is not allowed on production.");
        }
        if (strtolower($appEnv) === 'development') {
            error_log("[MockOtpProvider] SMS to $phone: $message");
        }
        return new OtpSendResult(
            true,
            'mock',
            'mock_msg_' . uniqid(),
            json_encode(['status' => 'mock_sent', 'phone' => $phone]),
            null
        );
    }
}
