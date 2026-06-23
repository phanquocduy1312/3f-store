<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ContactMessage {
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
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    email VARCHAR(100) NULL,
                    topic VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'new',
                    source VARCHAR(50) NOT NULL DEFAULT 'website_contact',
                    ip_address VARCHAR(50) NULL,
                    user_agent VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_topic (topic),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
        } catch (\Throwable $e) {
            error_log('ContactMessage table migration failed: ' . $e->getMessage());
        }
    }

    public function saveMessage($data) {
        $stmt = $this->db->prepare("
            INSERT INTO contact_messages (name, phone, email, topic, message, ip_address, user_agent, status, source)
            VALUES (:name, :phone, :email, :topic, :message, :ip_address, :user_agent, :status, :source)
        ");
        $stmt->execute([
            ':name' => trim($data['name']),
            ':phone' => trim($data['phone']),
            ':email' => !empty($data['email']) ? trim($data['email']) : null,
            ':topic' => trim($data['topic']),
            ':message' => trim($data['message']),
            ':ip_address' => isset($data['ip_address']) ? trim($data['ip_address']) : null,
            ':user_agent' => isset($data['user_agent']) ? trim($data['user_agent']) : null,
            ':status' => isset($data['status']) ? trim($data['status']) : 'new',
            ':source' => isset($data['source']) ? trim($data['source']) : 'website_contact'
        ]);
        return (int)$this->db->lastInsertId();
    }
}
