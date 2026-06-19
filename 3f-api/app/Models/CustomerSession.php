<?php
namespace App\Models;

use App\Core\Database;
use PDO;

/**
 * Customer session model for token-based authentication.
 */
class CustomerSession {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            self::$migrated = true;
            // Migration handled by Customer model loading customer-auth-schema.sql
            
            // Self-healing migration for user_agent and ip_address
            try {
                $checkCol = $this->db->query("SHOW COLUMNS FROM customer_sessions LIKE 'ip_address'")->fetch();
                if (!$checkCol) {
                    $this->db->exec("ALTER TABLE customer_sessions ADD COLUMN ip_address VARCHAR(45) NULL");
                }
                $checkAgent = $this->db->query("SHOW COLUMNS FROM customer_sessions LIKE 'user_agent'")->fetch();
                if (!$checkAgent) {
                    $this->db->exec("ALTER TABLE customer_sessions ADD COLUMN user_agent VARCHAR(255) NULL");
                }
            } catch (\Exception $e) {
                // Ignore
            }
        }
    }

    /**
     * Create a new session token for a customer.
     * @return string Raw token to send to client
     */
    public function createSession($customerId, $expiresInSeconds = 604800) {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + $expiresInSeconds);
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $this->db->prepare("
            INSERT INTO customer_sessions (customer_id, token_hash, expires_at, ip_address, user_agent)
            VALUES (:customer_id, :token_hash, :expires_at, :ip_address, :user_agent)
        ");
        $stmt->execute([
            ':customer_id' => (int)$customerId,
            ':token_hash' => $tokenHash,
            ':expires_at' => $expiresAt,
            ':ip_address' => $ip,
            ':user_agent' => $ua,
        ]);
        return $token;
    }

    /**
     * Validate token and return customer_id or null.
     */
    public function validateToken($token) {
        $tokenHash = hash('sha256', $token);
        $stmt = $this->db->prepare("
            SELECT customer_id FROM customer_sessions
            WHERE token_hash = :token_hash
              AND expires_at > :now
              AND revoked_at IS NULL
            LIMIT 1
        ");
        $stmt->execute([
            ':token_hash' => $tokenHash,
            ':now' => date('Y-m-d H:i:s'),
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['customer_id'] : null;
    }

    /**
     * Revoke a session token (logout).
     */
    public function revokeToken($token) {
        $tokenHash = hash('sha256', $token);
        $stmt = $this->db->prepare("
            UPDATE customer_sessions SET revoked_at = NOW()
            WHERE token_hash = :token_hash AND revoked_at IS NULL
        ");
        return $stmt->execute([':token_hash' => $tokenHash]);
    }

    /**
     * Revoke all sessions for a customer.
     */
    public function revokeAllForCustomer($customerId) {
        $stmt = $this->db->prepare("
            UPDATE customer_sessions SET revoked_at = NOW()
            WHERE customer_id = :cid AND revoked_at IS NULL
        ");
        return $stmt->execute([':cid' => (int)$customerId]);
    }
}
