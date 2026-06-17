<?php
namespace App\Models;

use App\Core\Database;
use PDO;

/**
 * Customer OTP model for phone verification.
 */
class CustomerOtp {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a new OTP for a phone number.
     * @return string Raw 6-digit OTP code
     */
    public function createOtp($phone, $purpose) {
        $phone = trim($phone);
        // Invalidate previous unused OTPs for same phone + purpose
        $this->db->prepare("
            UPDATE customer_otps SET verified_at = NOW()
            WHERE phone = :phone AND purpose = :purpose AND verified_at IS NULL
        ")->execute([':phone' => $phone, ':purpose' => $purpose]);

        // Generate 6-digit OTP
        $otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $otpHash = hash('sha256', $otp);
        $expiresAt = date('Y-m-d H:i:s', time() + 300); // 5 minutes

        $stmt = $this->db->prepare("
            INSERT INTO customer_otps (phone, otp_hash, purpose, expires_at)
            VALUES (:phone, :otp_hash, :purpose, :expires_at)
        ");
        $stmt->execute([
            ':phone' => $phone,
            ':otp_hash' => $otpHash,
            ':purpose' => $purpose,
            ':expires_at' => $expiresAt,
        ]);
        return $otp;
    }

    /**
     * Verify an OTP. Returns verification token on success, null on failure.
     * @return array{success: bool, error?: string, verificationToken?: string}
     */
    public function verifyOtp($phone, $otp, $purpose) {
        $phone = trim($phone);
        $otpHash = hash('sha256', $otp);

        // Find latest matching OTP
        $stmt = $this->db->prepare("
            SELECT id, otp_hash, attempts, max_attempts, expires_at, verified_at
            FROM customer_otps
            WHERE phone = :phone AND purpose = :purpose AND verified_at IS NULL
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => $phone, ':purpose' => $purpose]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            return ['success' => false, 'error' => 'Mã xác nhận không đúng.'];
        }

        // Check expiry
        if (strtotime($record['expires_at']) < time()) {
            return ['success' => false, 'error' => 'Mã xác nhận đã hết hạn.'];
        }

        // Check max attempts
        if ((int)$record['attempts'] >= (int)$record['max_attempts']) {
            return ['success' => false, 'error' => 'Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.'];
        }

        // Increment attempts
        $this->db->prepare("UPDATE customer_otps SET attempts = attempts + 1 WHERE id = :id")
            ->execute([':id' => $record['id']]);

        // Verify hash
        if ($record['otp_hash'] !== $otpHash) {
            return ['success' => false, 'error' => 'Mã xác nhận không đúng.'];
        }

        // Mark as verified, generate verification token
        $verificationToken = bin2hex(random_bytes(32));
        $this->db->prepare("
            UPDATE customer_otps SET verified_at = NOW(), verification_token = :vt WHERE id = :id
        ")->execute([':vt' => $verificationToken, ':id' => $record['id']]);

        return ['success' => true, 'verificationToken' => $verificationToken];
    }

    /**
     * Validate a verification token for completing registration.
     */
    public function validateVerificationToken($phone, $token, $purpose) {
        $stmt = $this->db->prepare("
            SELECT id FROM customer_otps
            WHERE phone = :phone AND purpose = :purpose
              AND verification_token = :token AND verified_at IS NOT NULL
              AND expires_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([':phone' => trim($phone), ':purpose' => $purpose, ':token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    /**
     * Count recent OTP requests for rate limiting.
     */
    public function countRecentOtps($phone, $minutesWindow = 15) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt FROM customer_otps
            WHERE phone = :phone AND created_at > DATE_SUB(NOW(), INTERVAL :mins MINUTE)
        ");
        $stmt->execute([':phone' => trim($phone), ':mins' => $minutesWindow]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['cnt'] ?? 0);
    }
}
