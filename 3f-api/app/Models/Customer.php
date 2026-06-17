<?php
namespace App\Models;

use App\Core\Database;
use PDO;

/**
 * Customer model - supports email-only and phone-only registration.
 */
class Customer {
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
        $files = [
            dirname(__DIR__, 2) . '/database/customer-auth-schema.sql',
            dirname(__DIR__, 2) . '/database/customer_profile_schema.sql'
        ];
        foreach ($files as $schemaPath) {
            if (!file_exists($schemaPath)) continue;
            $sql = file_get_contents($schemaPath);
            $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sql)));
            foreach ($statements as $stmt) {
                if ($stmt !== '') {
                    try {
                        $this->db->exec($stmt);
                    } catch (\PDOException $e) {
                        // Ignore duplicate column/index/key/table errors during migration
                        $msg = $e->getMessage();
                        if (strpos($msg, 'Duplicate') === false && 
                            strpos($msg, 'already exists') === false && 
                            strpos($msg, 'unknown column') === false &&
                            strpos($msg, 'Unknown column') === false) {
                            error_log("Customer migration warning on file " . basename($schemaPath) . ": " . $msg);
                        }
                    }
                }
            }
        }
    }

    // ─── Finders ───

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => trim($email)]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findByPhone($phone) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE phone = :phone LIMIT 1");
        $stmt->execute([':phone' => trim($phone)]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // ─── Registration ───

    public function createByEmail($fullName, $email, $passwordHash) {
        $stmt = $this->db->prepare("
            INSERT INTO customers (full_name, name, email, password_hash, status, created_at)
            VALUES (:full_name, :name, :email, :password_hash, 'active', NOW())
        ");
        $stmt->execute([
            ':full_name' => trim($fullName),
            ':name' => trim($fullName),
            ':email' => trim($email),
            ':password_hash' => $passwordHash,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function createByPhone($phone, $fullName, $email = null, $passwordHash = null) {
        $stmt = $this->db->prepare("
            INSERT INTO customers (full_name, name, phone, email, password_hash, phone_verified_at, status, created_at)
            VALUES (:full_name, :name, :phone, :email, :password_hash, NOW(), 'active', NOW())
        ");
        $stmt->execute([
            ':full_name' => trim($fullName),
            ':name' => trim($fullName),
            ':phone' => trim($phone),
            ':email' => $email ? trim($email) : null,
            ':password_hash' => $passwordHash,
        ]);
        return (int)$this->db->lastInsertId();
    }

    // ─── Updates ───

    public function updatePhone($customerId, $phone) {
        $stmt = $this->db->prepare("
            UPDATE customers SET phone = :phone, phone_verified_at = NOW(), updated_at = NOW()
            WHERE id = :id
        ");
        return $stmt->execute([':phone' => trim($phone), ':id' => (int)$customerId]);
    }

    public function updateLastLogin($customerId) {
        $stmt = $this->db->prepare("UPDATE customers SET last_login_at = NOW() WHERE id = :id");
        return $stmt->execute([':id' => (int)$customerId]);
    }

    // ─── Legacy compatibility (used by OrderController) ───

    public function upsertCustomer($name, $phone, $email = null, $zalo = null) {
        $phone = trim($phone);
        $name = trim($name);
        $email = $email ? trim($email) : null;
        $zalo = $zalo ? trim($zalo) : null;

        $stmt = $this->db->prepare("SELECT id, name, email, zalo FROM customers WHERE phone = :phone");
        $stmt->execute([':phone' => $phone]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $updatedName = $name ?: $existing['name'];
            $updatedEmail = $email ?: $existing['email'];
            $updatedZalo = $zalo ?: $existing['zalo'];
            $updateStmt = $this->db->prepare("
                UPDATE customers SET name = :name, email = :email, zalo = :zalo WHERE id = :id
            ");
            $updateStmt->execute([
                ':name' => $updatedName, ':email' => $updatedEmail,
                ':zalo' => $updatedZalo, ':id' => $existing['id']
            ]);
            return (int)$existing['id'];
        } else {
            $insertStmt = $this->db->prepare("
                INSERT INTO customers (name, full_name, phone, email, zalo, status) VALUES (:name, :full_name, :phone, :email, :zalo, 'active')
            ");
            $insertStmt->execute([
                ':name' => $name, ':full_name' => $name, ':phone' => $phone,
                ':email' => $email, ':zalo' => $zalo
            ]);
            return (int)$this->db->lastInsertId();
        }
    }

    public function getCustomerByPhone($phone) {
        return $this->findByPhone($phone);
    }
}
