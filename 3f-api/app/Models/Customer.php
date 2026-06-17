<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class Customer {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function upsertCustomer($name, $phone, $email = null, $zalo = null) {
        $phone = trim($phone);
        $name = trim($name);
        $email = $email ? trim($email) : null;
        $zalo = $zalo ? trim($zalo) : null;

        $stmt = $this->db->prepare("SELECT id, name, email, zalo FROM customers WHERE phone = :phone");
        $stmt->execute([':phone' => $phone]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Update fields if they are provided/changed
            $updatedName = $name ?: $existing['name'];
            $updatedEmail = $email ?: $existing['email'];
            $updatedZalo = $zalo ?: $existing['zalo'];

            $updateStmt = $this->db->prepare("
                UPDATE customers 
                SET name = :name, email = :email, zalo = :zalo 
                WHERE id = :id
            ");
            $updateStmt->execute([
                ':name' => $updatedName,
                ':email' => $updatedEmail,
                ':zalo' => $updatedZalo,
                ':id' => $existing['id']
            ]);
            return (int)$existing['id'];
        } else {
            // Insert new customer
            $insertStmt = $this->db->prepare("
                INSERT INTO customers (name, phone, email, zalo) 
                VALUES (:name, :phone, :email, :zalo)
            ");
            $insertStmt->execute([
                ':name' => $name,
                ':phone' => $phone,
                ':email' => $email,
                ':zalo' => $zalo
            ]);
            return (int)$this->db->lastInsertId();
        }
    }

    public function getCustomerByPhone($phone) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE phone = :phone LIMIT 1");
        $stmt->execute([':phone' => trim($phone)]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
