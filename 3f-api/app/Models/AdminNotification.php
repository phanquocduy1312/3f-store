<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class AdminNotification {
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
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS admin_notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) NOT NULL DEFAULT 'info',
                    reference_type VARCHAR(50) NULL,
                    reference_id VARCHAR(100) NULL,
                    is_read TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_is_read (is_read),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
        } catch (\Throwable $e) {
            error_log('AdminNotification table migration failed: ' . $e->getMessage());
        }
    }

    public function createNotification($title, $message, $type = 'info', $refType = null, $refId = null) {
        $stmt = $this->db->prepare("
            INSERT INTO admin_notifications (title, message, type, reference_type, reference_id, is_read)
            VALUES (:title, :message, :type, :ref_type, :ref_id, 0)
        ");
        $stmt->execute([
            ':title' => trim($title),
            ':message' => trim($message),
            ':type' => trim($type),
            ':ref_type' => $refType ? trim($refType) : null,
            ':ref_id' => $refId ? trim((string)$refId) : null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function listNotifications($limit = 50) {
        $limit = max(1, min(100, (int)$limit));
        $stmt = $this->db->prepare("
            SELECT * FROM admin_notifications 
            ORDER BY id DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUnreadCount() {
        $stmt = $this->db->query("SELECT COUNT(*) FROM admin_notifications WHERE is_read = 0");
        return (int)$stmt->fetchColumn();
    }

    public function markRead($id) {
        $stmt = $this->db->prepare("UPDATE admin_notifications SET is_read = 1 WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->rowCount() > 0;
    }

    public function markAllRead() {
        $stmt = $this->db->query("UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0");
        return $stmt->rowCount();
    }

    public function deleteNotification($id) {
        $stmt = $this->db->prepare("DELETE FROM admin_notifications WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->rowCount() > 0;
    }
}
