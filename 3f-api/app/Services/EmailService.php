<?php
namespace App\Services;

/**
 * Service to handle sending verification emails via SMTP or logging in development.
 */
class EmailService {

    /**
     * Send email verification link.
     * @param string $email
     * @param string $fullName
     * @param string $rawToken
     * @return array{success: bool, logged: bool, verifyUrl: string, error?: string}
     */
    public function sendVerificationEmail($email, $fullName, $rawToken) {
        $frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:5173';
        $verifyUrl = rtrim($frontendUrl, '/') . '/verify-registration?email=' . urlencode($email) . '&token=' . urlencode($rawToken);
        
        $subject = "Xác thực tài khoản 3F Store";
        
        $htmlMessage = "
        <html>
        <head>
            <title>Xác thực tài khoản 3F Store</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px; }
                .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .logo { font-size: 24px; font-weight: 900; color: #0057E7; margin-bottom: 20px; }
                h2 { color: #0f172a; margin-top: 0; }
                p { line-height: 1.6; font-size: 15px; color: #475569; }
                .btn { display: inline-block; background-color: #0057E7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 9999px; margin: 20px 0; text-align: center; }
                .btn:hover { background-color: #0044b3; }
                .footer { font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            </style>
        </head>
        <body>
            <div class='card'>
                <div class='logo'>3F Store</div>
                <h2>Chào bạn {$fullName},</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại 3F Store - Cửa hàng thú cưng chuyên chó/mèo hàng đầu.</p>
                <p>Vui lòng nhấn vào nút dưới đây để kích thực tài khoản của bạn. Liên kết này chỉ có hiệu lực trong vòng 60 phút:</p>
                <div style='text-align: center;'>
                    <a href='{$verifyUrl}' class='btn'>Xác thực tài khoản</a>
                </div>
                <p>Nếu nút bấm trên không hoạt động, bạn có thể sao chép liên kết dưới đây dán vào thanh địa chỉ trình duyệt:</p>
                <p style='word-break: break-all; font-size: 13px; color: #0057E7;'>{$verifyUrl}</p>
                <p style='font-size: 13px; color: #64748b; font-style: italic;'>Nếu bạn không thực hiện yêu cầu đăng ký này, vui lòng bỏ qua email.</p>
                <div class='footer'>
                    Đây là email tự động từ hệ thống của 3F Store. Vui lòng không trả lời trực tiếp email này.
                </div>
            </div>
        </body>
        </html>
        ";

        $appEnv = strtolower(getenv('APP_ENV') ?: 'development');
        
        $host = getenv('SMTP_HOST') ?: '';
        $username = getenv('SMTP_USERNAME') ?: '';
        $password = getenv('SMTP_PASSWORD') ?: '';

        // Check if SMTP is missing
        $isSmtpConfigured = !empty($host) && !empty($username) && !empty($password);

        if (!$isSmtpConfigured) {
            if ($appEnv === 'development') {
                $this->logMail($email, $subject, $verifyUrl);
                return [
                    'success' => true,
                    'logged' => true,
                    'verifyUrl' => $verifyUrl
                ];
            } else {
                return [
                    'success' => false,
                    'logged' => false,
                    'verifyUrl' => $verifyUrl,
                    'error' => 'Hệ thống chưa cấu hình SMTP để gửi email xác thực.'
                ];
            }
        }

        try {
            SmtpClient::send($email, $subject, $htmlMessage);
            return [
                'success' => true,
                'logged' => false,
                'verifyUrl' => $verifyUrl
            ];
        } catch (\Exception $e) {
            if ($appEnv === 'development') {
                $this->logMail($email, $subject, $verifyUrl);
                return [
                    'success' => true,
                    'logged' => true,
                    'verifyUrl' => $verifyUrl,
                    'error' => $e->getMessage()
                ];
            }
            return [
                'success' => false,
                'logged' => false,
                'verifyUrl' => $verifyUrl,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Log email details to file.
     */
    private function logMail($email, $subject, $verifyUrl) {
        $logDir = dirname(dirname(__DIR__)) . '/storage/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        $logFile = $logDir . '/email.log';
        $logContent = "[" . date('Y-m-d H:i:s') . "] To: {$email}\n";
        $logContent .= "Subject: {$subject}\n";
        $logContent .= "Verify URL: {$verifyUrl}\n";
        $logContent .= str_repeat('=', 80) . "\n";
        file_put_contents($logFile, $logContent, FILE_APPEND);
    }

}
