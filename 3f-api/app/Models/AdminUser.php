<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class AdminUser {
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
     * Check if admin_users table is empty.
     */
    public function isEmpty() {
        $stmt = $this->db->query("SELECT COUNT(*) as count FROM admin_users");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return ((int)($row['count'] ?? 0)) === 0;
    }

    /**
     * Create an admin user.
     */
    public function createUser($name, $email, $password, $role = 'admin') {
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare("
            INSERT INTO admin_users (name, email, password_hash, role)
            VALUES (:name, :email, :password_hash, :role)
        ");
        $stmt->execute([
            ':name' => trim($name),
            ':email' => trim(strtolower($email)),
            ':password_hash' => $passwordHash,
            ':role' => trim($role)
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Find admin by email.
     */
    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM admin_users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => trim(strtolower($email))]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Find admin by ID.
     */
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT id, name, email, role, is_active, last_login_at, created_at, updated_at FROM admin_users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Record login time.
     */
    public function updateLastLogin($id) {
        $stmt = $this->db->prepare("UPDATE admin_users SET last_login_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => (int)$id]);
    }
}
