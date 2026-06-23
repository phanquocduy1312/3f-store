<?php
namespace App\Services\Otp;

class SpeedSmsOtpProvider implements OtpProviderInterface {
    public function sendOtp($phone, $message, $metadata = []) {
        $apiKey = getenv('SPEEDSMS_API_KEY');
        if (empty($apiKey)) {
            return new OtpSendResult(false, 'speedsms', null, null, 'Chưa cấu hình SpeedSMS API key.');
        }

        $recipient = $this->normalizePhone($phone);
        if ($recipient === null) {
            return new OtpSendResult(false, 'speedsms', null, null, $this->errorMessage('105'));
        }

        $endpoint = getenv('SPEEDSMS_API_ENDPOINT') ?: 'https://api.speedsms.vn/index.php/sms/send';
        $smsTypeValue = trim((string)(getenv('SPEEDSMS_SMS_TYPE') ?: ''));
        $smsType = $smsTypeValue === '' ? 2 : (int)$smsTypeValue;
        $sender = trim((string)(getenv('SPEEDSMS_SENDER') ?: ''));

        $senderError = $this->validateSender($smsType, $sender);
        if ($senderError !== null) {
            return new OtpSendResult(false, 'speedsms', null, null, $senderError);
        }

        if ($smsType === 2) {
            $sender = '';
        }

        $query = [
            'access-token' => $apiKey,
            'to' => $recipient,
            'content' => $this->toAscii($message),
            'type' => $smsType,
            'sender' => $sender,
        ];

        $separator = strpos($endpoint, '?') === false ? '?' : '&';
        $url = $endpoint . $separator . http_build_query($query);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
        ]);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            return new OtpSendResult(false, 'speedsms', null, null, 'Không thể kết nối SpeedSMS: ' . $curlError);
        }

        $data = json_decode($response, true);
        if (!is_array($data)) {
            return new OtpSendResult(false, 'speedsms', null, $response, 'SpeedSMS trả về dữ liệu không hợp lệ.');
        }

        $status = isset($data['status']) ? strtolower((string)$data['status']) : '';
        $code = isset($data['code']) ? (string)$data['code'] : '';
        if ($httpCode >= 200 && $httpCode < 300 && $status === 'success' && in_array($code, ['00', '0'], true)) {
            $messageId = null;
            if (isset($data['data']['tranId'])) {
                $messageId = (string)$data['data']['tranId'];
            }
            return new OtpSendResult(true, 'speedsms', $messageId, $response, null);
        }

        $providerMessage = isset($data['message']) ? (string)$data['message'] : null;
        $errorMessage = $this->errorMessage($code, $providerMessage, $smsType);
        return new OtpSendResult(false, 'speedsms', null, $response, $errorMessage);
    }

    private function normalizePhone($phone) {
        $digits = preg_replace('/\D+/', '', (string)$phone);
        if ($digits === '') {
            return null;
        }

        if (strpos($digits, '00') === 0) {
            $digits = substr($digits, 2);
        }

        if (strpos($digits, '0') === 0) {
            $digits = '84' . substr($digits, 1);
        }

        if (strpos($digits, '84') !== 0) {
            $digits = '84' . $digits;
        }

        if (!preg_match('/^84\d{8,10}$/', $digits)) {
            return null;
        }

        return $digits;
    }

    private function toAscii($message) {
        if (!function_exists('iconv')) {
            return preg_replace('/[^\x20-\x7E]/', '', (string)$message);
        }

        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', (string)$message);
        if ($converted === false) {
            return (string)$message;
        }
        return $converted;
    }

    private function validateSender($smsType, $sender) {
        if ($smsType === 2) {
            return null;
        }

        if ($smsType === 3 && $sender === '') {
            return 'Vui lòng cấu hình brandname SpeedSMS đã được duyệt.';
        }

        if ($smsType === 4 && !in_array($sender, ['Verify', 'Notify'], true)) {
            return 'SPEEDSMS_SENDER phải là Verify hoặc Notify khi dùng sms_type=4.';
        }

        if ($smsType === 5) {
            return 'SpeedSMS sms_type=5 không được hỗ trợ cho OTP.';
        }

        if (!in_array($smsType, [2, 3, 4], true)) {
            return 'SPEEDSMS_SMS_TYPE không hợp lệ.';
        }

        return null;
    }

    private function errorMessage($code, $providerMessage = null, $smsType = null) {
        $messages = [
            '007' => 'IP gửi SMS đang bị khóa.',
            '008' => 'Tài khoản SpeedSMS đang bị khóa.',
            '009' => 'Tài khoản SpeedSMS chưa được phép gọi API.',
            '101' => 'Thiếu hoặc sai tham số gửi OTP.',
            '105' => 'Số điện thoại không hợp lệ.',
            '110' => 'Nội dung SMS không được hỗ trợ.',
            '113' => 'Nội dung SMS quá dài.',
            '300' => 'Tài khoản SpeedSMS không đủ số dư để gửi OTP.',
            '500' => 'SpeedSMS đang lỗi hệ thống, vui lòng thử lại sau.',
        ];

        if (isset($messages[$code])) {
            return $messages[$code];
        }

        if ($providerMessage !== null && $providerMessage !== '') {
            if ((int)$smsType === 2 && stripos($providerMessage, 'sender not found') !== false) {
                return 'Tài khoản SpeedSMS chưa gửi được sms_type=2 bằng đầu số random. Vui lòng kiểm tra gói type=2/sender pool với SpeedSMS hoặc dùng sms_type=4 với SPEEDSMS_SENDER=Verify/Notify. Số dư SpeedSMS hiện cũng cần đủ để gửi SMS thật.';
            }
            return 'Gửi OTP thất bại qua SpeedSMS: ' . $providerMessage;
        }

        return 'Gửi OTP thất bại qua SpeedSMS.';
    }
}
