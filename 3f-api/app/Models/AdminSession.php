<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class AdminSession {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    private function migrate() {
        $schemaPath = dirname(__DIR__, 2) . '/database/admin_schema.sql';
        if (!file_exists($schemaPath)) {
            return;
        }
        $sql = file_get_contents($schemaPath);
        $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sql)));
        foreach ($statements as $statement) {
            if ($statement !== '') {
                $this->db->exec($statement);
            }
        }
    }

    /**
     * Create a new session token for the user.
     */
    public function createSession($adminUserId) {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        // Expire in 24 hours
        $expiresAt = date('Y-m-d H:i:s', time() + 86400);

        $stmt = $this->db->prepare("
            INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at)
            VALUES (:admin_user_id, :token_hash, :expires_at)
        ");
        $stmt->execute([
            ':admin_user_id' => (int)$adminUserId,
            ':token_hash' => $tokenHash,
            ':expires_at' => $expiresAt
        ]);

        return $token;
    }

    /**
     * Validate the given session token.
     * Returns admin user id if valid, null otherwise.
     */
    public function validateToken($token) {
        $tokenHash = hash('sha256', $token);

        $stmt = $this->db->prepare("
            SELECT s.admin_user_id, u.is_active
            FROM admin_sessions s
            JOIN admin_users u ON s.admin_user_id = u.id
            WHERE s.token_hash = :token_hash
              AND s.expires_at > :now
              AND s.revoked_at IS NULL
            LIMIT 1
        ");
        $stmt->execute([
            ':token_hash' => $tokenHash,
            ':now' => date('Y-m-d H:i:s')
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && (int)$row['is_active'] === 1) {
            return (int)$row['admin_user_id'];
        }

        return null;
    }

    /**
     * Revoke the given session token (logout).
     */
    public function revokeToken($token) {
        $tokenHash = hash('sha256', $token);
        $stmt = $this->db->prepare("
            UPDATE admin_sessions
            SET revoked_at = NOW()
            WHERE token_hash = :token_hash AND revoked_at IS NULL
        ");
        return $stmt->execute([':token_hash' => $tokenHash]);
    }
}
