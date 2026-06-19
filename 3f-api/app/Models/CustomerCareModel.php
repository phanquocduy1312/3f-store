<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

class CustomerCareModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        
        if (!self::$migrated) {
            self::$migrated = true;
            try {
                // 1. Create customer_notes table
                $this->db->exec("
                    CREATE TABLE IF NOT EXISTS customer_notes (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id INT NOT NULL,
                        admin_id INT NOT NULL,
                        note TEXT NOT NULL,
                        visibility ENUM('internal') DEFAULT 'internal',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
                        deleted_at DATETIME NULL,
                        INDEX idx_customer_notes_customer_id (customer_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");

                // 2. Create customer_tags table
                $this->db->exec("
                    CREATE TABLE IF NOT EXISTS customer_tags (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        color VARCHAR(20) NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");

                // 3. Create customer_tag_assignments table
                $this->db->exec("
                    CREATE TABLE IF NOT EXISTS customer_tag_assignments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id INT NOT NULL,
                        tag_id INT NOT NULL,
                        assigned_by_admin_id INT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uniq_customer_tag (customer_id, tag_id),
                        INDEX idx_assignments_customer_id (customer_id),
                        INDEX idx_assignments_tag_id (tag_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ");

                // 4. Insert default tags if not exist
                $stmt = $this->db->query("SELECT COUNT(*) FROM customer_tags");
                if ($stmt->fetchColumn() == 0) {
                    $defaultTags = [
                        ['VIP', '#f59e0b'],
                        ['Khách mới', '#10b981'],
                        ['Khách thân thiết', '#3b82f6'],
                        ['Cần chăm sóc', '#eab308'],
                        ['Rủi ro churn', '#ef4444'],
                        ['Hay mua đồ mèo', '#8b5cf6'],
                        ['Hay mua đồ chó', '#ec4899']
                    ];
                    $insertStmt = $this->db->prepare("INSERT IGNORE INTO customer_tags (name, color) VALUES (?, ?)");
                    foreach ($defaultTags as $tag) {
                        $insertStmt->execute($tag);
                    }
                }
            } catch (\Exception $e) {
                // Ignore errors during migration on subsequent runs
            }
        }
    }

    // ==========================================
    // NOTES
    // ==========================================
    public function getNotes($customerId) {
        $stmt = $this->db->prepare("
            SELECT n.*, u.name as admin_name 
            FROM customer_notes n
            LEFT JOIN admin_users u ON n.admin_id = u.id
            WHERE n.customer_id = :customer_id AND n.deleted_at IS NULL
            ORDER BY n.created_at DESC
        ");
        $stmt->execute([':customer_id' => (int)$customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createNote($customerId, $adminId, $noteText) {
        $stmt = $this->db->prepare("
            INSERT INTO customer_notes (customer_id, admin_id, note)
            VALUES (:customer_id, :admin_id, :note)
        ");
        $stmt->execute([
            ':customer_id' => (int)$customerId,
            ':admin_id' => (int)$adminId,
            ':note' => $noteText
        ]);
        return $this->db->lastInsertId();
    }

    public function updateNote($noteId, $noteText) {
        $stmt = $this->db->prepare("
            UPDATE customer_notes SET note = :note WHERE id = :id AND deleted_at IS NULL
        ");
        $stmt->execute([
            ':note' => $noteText,
            ':id' => (int)$noteId
        ]);
        return $stmt->rowCount() > 0;
    }

    public function deleteNote($noteId) {
        $stmt = $this->db->prepare("
            UPDATE customer_notes SET deleted_at = NOW() WHERE id = :id
        ");
        $stmt->execute([':id' => (int)$noteId]);
        return $stmt->rowCount() > 0;
    }

    public function getNoteById($noteId) {
        $stmt = $this->db->prepare("SELECT * FROM customer_notes WHERE id = :id AND deleted_at IS NULL");
        $stmt->execute([':id' => (int)$noteId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ==========================================
    // TAGS
    // ==========================================
    public function getAllTags() {
        $stmt = $this->db->query("SELECT * FROM customer_tags ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createTag($name, $color) {
        $stmt = $this->db->prepare("INSERT INTO customer_tags (name, color) VALUES (:name, :color)");
        try {
            $stmt->execute([':name' => $name, ':color' => $color]);
            return $this->db->lastInsertId();
        } catch (\PDOException $e) {
            // Probably duplicate
            return null;
        }
    }

    public function getCustomerTags($customerId) {
        $stmt = $this->db->prepare("
            SELECT t.*, a.id as assignment_id
            FROM customer_tags t
            JOIN customer_tag_assignments a ON t.id = a.tag_id
            WHERE a.customer_id = :customer_id
            ORDER BY t.name ASC
        ");
        $stmt->execute([':customer_id' => (int)$customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function assignTag($customerId, $tagId, $adminId) {
        $stmt = $this->db->prepare("
            INSERT IGNORE INTO customer_tag_assignments (customer_id, tag_id, assigned_by_admin_id)
            VALUES (:customer_id, :tag_id, :admin_id)
        ");
        $stmt->execute([
            ':customer_id' => (int)$customerId,
            ':tag_id' => (int)$tagId,
            ':admin_id' => (int)$adminId
        ]);
        return $stmt->rowCount() > 0;
    }

    public function removeTagAssignment($customerId, $tagId) {
        $stmt = $this->db->prepare("
            DELETE FROM customer_tag_assignments
            WHERE customer_id = :customer_id AND tag_id = :tag_id
        ");
        $stmt->execute([
            ':customer_id' => (int)$customerId,
            ':tag_id' => (int)$tagId
        ]);
        return $stmt->rowCount() > 0;
    }

    // ==========================================
    // TIMELINE
    // ==========================================
    public function getTimeline($customerId) {
        $timeline = [];

        // 1. Customer registration / blocks
        $stmt = $this->db->prepare("SELECT id, status, created_at FROM customers WHERE id = :id");
        $stmt->execute([':id' => (int)$customerId]);
        $cust = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($cust) {
            $timeline[] = [
                'type' => 'customer_registered',
                'title' => 'Tài khoản được tạo',
                'description' => 'Khách hàng đăng ký tài khoản trên hệ thống',
                'created_at' => $cust['created_at'],
                'metadata' => ['status' => $cust['status']]
            ];
        }

        // 2. Orders
        $stmt = $this->db->prepare("SELECT id, order_status as status, total as total_amount, created_at FROM orders WHERE customer_id = :id ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([':id' => (int)$customerId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($orders as $order) {
            $timeline[] = [
                'type' => 'order_created',
                'title' => 'Tạo đơn hàng #' . $order['id'],
                'description' => 'Trạng thái: ' . $order['status'] . ' - Tổng tiền: ' . number_format((float)$order['total_amount']) . 'đ',
                'created_at' => $order['created_at'],
                'metadata' => ['order_id' => $order['id'], 'status' => $order['status']]
            ];
        }

        // 3. Points transactions
        $stmt = $this->db->prepare("SELECT id, points as points_change, type as transaction_type, description, created_at FROM customer_point_transactions WHERE customer_id = :id ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([':id' => (int)$customerId]);
        $points = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($points as $pt) {
            $timeline[] = [
                'type' => 'point_transaction',
                'title' => 'Biến động điểm: ' . ($pt['points_change'] > 0 ? '+' : '') . $pt['points_change'],
                'description' => $pt['description'] ?: 'Loại: ' . $pt['transaction_type'],
                'created_at' => $pt['created_at'],
                'metadata' => ['points_change' => $pt['points_change'], 'type' => $pt['transaction_type']]
            ];
        }

        // 4. Sessions
        $stmt = $this->db->prepare("SELECT id, created_at, revoked_at FROM customer_sessions WHERE customer_id = :id ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([':id' => (int)$customerId]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($sessions as $sess) {
            $timeline[] = [
                'type' => 'session_created',
                'title' => 'Đăng nhập mới',
                'description' => 'Đã đăng nhập vào hệ thống',
                'created_at' => $sess['created_at'],
                'metadata' => ['session_id' => $sess['id']]
            ];
            if ($sess['revoked_at']) {
                $timeline[] = [
                    'type' => 'session_revoked',
                    'title' => 'Thu hồi phiên đăng nhập',
                    'description' => 'Phiên #' . $sess['id'] . ' đã bị thu hồi',
                    'created_at' => $sess['revoked_at'],
                    'metadata' => ['session_id' => $sess['id']]
                ];
            }
        }

        // 5. Notes
        $stmt = $this->db->prepare("SELECT id, note, created_at FROM customer_notes WHERE customer_id = :id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([':id' => (int)$customerId]);
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($notes as $note) {
            $timeline[] = [
                'type' => 'note_created',
                'title' => 'Thêm ghi chú CSKH',
                'description' => mb_substr($note['note'], 0, 100) . (mb_strlen($note['note']) > 100 ? '...' : ''),
                'created_at' => $note['created_at'],
                'metadata' => ['note_id' => $note['id']]
            ];
        }

        // 6. Audit Logs
        $stmt = $this->db->prepare("SELECT action, metadata_json as description, created_at FROM admin_audit_logs WHERE entity_id = :id AND entity_type = 'customer' AND action IN ('customer_blocked', 'customer_unblocked') ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([':id' => (int)$customerId]);
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($logs as $log) {
            $metadata = json_decode($log['description'] ?? '{}', true) ?: [];
            $reason = $metadata['reason'] ?? 'Không có lý do';
            $timeline[] = [
                'type' => $log['action'],
                'title' => $log['action'] === 'customer_blocked' ? 'Tài khoản bị khóa' : 'Tài khoản được mở khóa',
                'description' => 'Lý do: ' . $reason,
                'created_at' => $log['created_at'],
                'metadata' => $metadata
            ];
        }

        // Sort by created_at DESC
        usort($timeline, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Limit to latest 50 events
        return array_slice($timeline, 0, 50);
    }
}
