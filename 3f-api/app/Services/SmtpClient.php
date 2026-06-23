<?php
namespace App\Services;

/**
 * Pure PHP SMTP client using stream sockets, implementing STARTTLS, authentication, and UTF-8 encoding.
 */
class SmtpClient {

    /**
     * Send email via SMTP socket.
     * @param string $to
     * @param string $subject
     * @param string $htmlMessage
     * @return bool
     * @throws \Exception
     */
    public static function send($to, $subject, $htmlMessage) {
        $host = getenv('SMTP_HOST') ?: '';
        $port = (int)(getenv('SMTP_PORT') ?: 587);
        $username = getenv('SMTP_USERNAME') ?: '';
        $password = getenv('SMTP_PASSWORD') ?: '';
        $encryption = strtolower(getenv('SMTP_ENCRYPTION') ?: 'tls');
        $from = getenv('MAIL_FROM_ADDRESS') ?: $username;
        $fromName = getenv('MAIL_FROM_NAME') ?: '3F Store';

        // Connect
        $context = stream_context_create();
        $remote = $host;
        if ($encryption === 'ssl') {
            $remote = 'ssl://' . $host;
        }
        
        $socket = @stream_socket_client($remote . ':' . $port, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) {
            throw new \Exception("Không thể kết nối tới SMTP server {$host}:{$port}. Lỗi: {$errstr} ({$errno})");
        }

        $readResponse = function($socket) {
            $data = '';
            while ($str = fgets($socket, 515)) {
                $data .= $str;
                if (substr($str, 3, 1) === ' ') {
                    break;
                }
            }
            return $data;
        };

        $writeCommand = function($socket, $cmd) use ($readResponse) {
            fputs($socket, $cmd . "\r\n");
            return $readResponse($socket);
        };

        // Read greeting
        $readResponse($socket);

        // HELO/EHLO
        $writeCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));

        // STARTTLS if TLS
        if ($encryption === 'tls') {
            $res = $writeCommand($socket, "STARTTLS");
            if (strpos($res, '220') === false) {
                fclose($socket);
                throw new \Exception("SMTP server không hỗ trợ STARTTLS: " . $res);
            }
            
            // Enable crypto
            $crypto_method = STREAM_CRYPTO_METHOD_TLS_CLIENT;
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
                $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            }
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
                $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
            }
            
            if (!@stream_socket_enable_crypto($socket, true, $crypto_method)) {
                fclose($socket);
                throw new \Exception("Bắt tay TLS thất bại khi kết nối SMTP server.");
            }
            
            // Resend EHLO after TLS negotiation
            $writeCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
        }

        // AUTH
        $res = $writeCommand($socket, "AUTH LOGIN");
        if (strpos($res, '334') === false) {
            fclose($socket);
            throw new \Exception("SMTP server không hỗ trợ AUTH LOGIN: " . $res);
        }

        $res = $writeCommand($socket, base64_encode($username));
        if (strpos($res, '334') === false) {
            fclose($socket);
            throw new \Exception("Username SMTP bị từ chối: " . $res);
        }

        $res = $writeCommand($socket, base64_encode($password));
        if (strpos($res, '235') === false) {
            fclose($socket);
            throw new \Exception("Mật khẩu SMTP bị từ chối: " . $res);
        }

        // MAIL FROM
        $writeCommand($socket, "MAIL FROM:<" . $from . ">");
        
        // RCPT TO
        $res = $writeCommand($socket, "RCPT TO:<" . $to . ">");
        if (strpos($res, '250') === false && strpos($res, '251') === false) {
            fclose($socket);
            throw new \Exception("Địa chỉ email nhận bị từ chối: " . $res);
        }

        // DATA
        $writeCommand($socket, "DATA");

        // Headers & Message
        $headers = [
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <" . $from . ">",
            "To: <" . $to . ">",
            "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
            "Date: " . date('r'),
            "Message-ID: <" . md5(uniqid(microtime())) . "@" . ($host) . ">",
            "Auto-Submitted: auto-generated",
            "X-Mailer: PHP/" . phpversion()
        ];
        
        $body = implode("\r\n", $headers) . "\r\n\r\n" . $htmlMessage . "\r\n.";
        $res = $writeCommand($socket, $body);
        if (strpos($res, '250') === false) {
            fclose($socket);
            throw new \Exception("Gửi nội dung email thất bại: " . $res);
        }

        // QUIT
        $writeCommand($socket, "QUIT");
        fclose($socket);

        return true;
    }
}
