<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class AuditLog {
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

        // Self-healing migration for ip_address and user_agent
        try {
            $checkIpCol = $this->db->query("SHOW COLUMNS FROM admin_audit_logs LIKE 'ip_address'")->fetch();
            if (!$checkIpCol) {
                $this->db->exec("ALTER TABLE admin_audit_logs ADD COLUMN ip_address VARCHAR(100) NULL AFTER entity_id");
            }
            $checkAgentCol = $this->db->query("SHOW COLUMNS FROM admin_audit_logs LIKE 'user_agent'")->fetch();
            if (!$checkAgentCol) {
                $this->db->exec("ALTER TABLE admin_audit_logs ADD COLUMN user_agent TEXT NULL AFTER ip_address");
            }
        } catch (\Exception $e) {
            // Ignore error if table doesn't exist yet or other issues during setup
        }
    }

    /**
     * Write an audit log entry.
     */
    public static function write($adminUserId, $action, $entityType, $entityId = null, $metadata = null) {
        try {
            $db = Database::getInstance()->getConnection();
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ipAddress = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
            }
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            $metadataJson = $metadata ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null;

            $stmt = $db->prepare("
                INSERT INTO admin_audit_logs (admin_user_id, action, entity_type, entity_id, ip_address, user_agent, metadata_json)
                VALUES (:admin_user_id, :action, :entity_type, :entity_id, :ip_address, :user_agent, :metadata_json)
            ");
            
            $stmt->execute([
                ':admin_user_id' => $adminUserId,
                ':action'        => $action,
                ':entity_type'   => $entityType,
                ':entity_id'     => $entityId,
                ':ip_address'    => $ipAddress,
                ':user_agent'    => $userAgent,
                ':metadata_json' => $metadataJson
            ]);
        } catch (\Throwable $e) {
            // Silence log errors to not disrupt application execution, but log to error_log
            error_log("Failed to write admin audit log: " . $e->getMessage());
        }
    }
}
