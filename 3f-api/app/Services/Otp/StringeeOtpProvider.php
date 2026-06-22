<?php
namespace App\Services\Otp;

class StringeeOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $sid = getenv('STRINGEE_SID');
        $secret = getenv('STRINGEE_SECRET');
        
        if (empty($sid) || empty($secret)) {
            return new OtpSendResult(false, 'stringee', null, null, 'Chưa cấu hình Stringee OTP.');
        }

        $jwt = $this->generateJwt($sid, $secret);
        $endpoint = getenv('STRINGEE_SMS_ENDPOINT') ?: 'https://api.stringee.com/v1/sms';
        $from = getenv('STRINGEE_FROM') ?: '3F Store';
        $recipient = $this->formatPhone($phone);

        $payload = [
            "sms" => [
                [
                    "from" => $from,
                    "to" => $recipient,
                    "text" => $message
                ]
            ]
        ];

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-STRINGEE-AUTH: ' . $jwt
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            return new OtpSendResult(false, 'stringee', null, null, 'Không thể kết nối đến nhà cung cấp OTP: ' . $error);
        }

        $data = json_decode($response, true);
        if (!$data || !isset($data['smsSent']) || $data['smsSent'] <= 0) {
            $errorMsg = 'Gửi OTP thất bại qua Stringee.';
            if (isset($data['result'][0]['msg'])) {
                $errorMsg .= ' Chi tiết: ' . $data['result'][0]['msg'];
            }
            return new OtpSendResult(false, 'stringee', null, $response, $errorMsg);
        }

        $resultCode = isset($data['result'][0]['r']) ? (int)$data['result'][0]['r'] : -1;
        if ($resultCode !== 0) {
            $errorMsg = 'Gửi OTP thất bại qua Stringee.';
            if (isset($data['result'][0]['msg'])) {
                $errorMsg .= ' Chi tiết: ' . $data['result'][0]['msg'];
            }
            return new OtpSendResult(false, 'stringee', null, $response, $errorMsg);
        }

        return new OtpSendResult(true, 'stringee', 'stringee_msg_' . uniqid(), $response, null);
    }

    private function generateJwt($sid, $secret) {
        $header = [
            "typ" => "JWT",
            "alg" => "HS256",
            "cty" => "stringee-api;v=1"
        ];
        
        $payload = [
            "jti" => $sid . "-" . time(),
            "iss" => $sid,
            "exp" => time() + 3600,
            "rest_api" => true
        ];
        
        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $secret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }

    private function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function formatPhone($phone) {
        $phone = preg_replace('/[^\d]/', '', (string)$phone);
        if (strpos($phone, '0') === 0) {
            $phone = '84' . substr($phone, 1);
        }
        if (strpos($phone, '84') !== 0) {
            $phone = '84' . $phone;
        }
        return $phone;
    }
}
