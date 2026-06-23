<?php
namespace App\Services\Otp;

interface OtpProviderInterface {
    /**
     * Send an OTP code via SMS.
     * 
     * @param string $phone Customer phone number
     * @param string $message Message body containing OTP
     * @param array $metadata Extra metadata
     * @return OtpSendResult
     */
    public function sendOtp($phone, $message, $metadata = []);
}
