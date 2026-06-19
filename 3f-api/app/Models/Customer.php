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

    // ─── Phase 1 Admin Management ───

    public function adminPaginateCustomers($filters) {
        $page = isset($filters['page']) ? max(1, (int)$filters['page']) : 1;
        $limit = isset($filters['limit']) ? min(100, max(1, (int)$filters['limit'])) : 10;
        $offset = ($page - 1) * $limit;
        
        $where = ["1=1"];
        $params = [];
        
        if (!empty($filters['q'])) {
            $where[] = "(c.full_name LIKE :search OR c.name LIKE :search OR c.email LIKE :search OR c.phone LIKE :search)";
            $params[':search'] = "%{$filters['q']}%";
        }
        
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = "c.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['phoneVerified']) && $filters['phoneVerified'] !== 'all') {
            if ($filters['phoneVerified'] === 'yes') {
                $where[] = "c.phone_verified_at IS NOT NULL";
            } else {
                $where[] = "c.phone_verified_at IS NULL";
            }
        }
        
        $whereSql = implode(' AND ', $where);
        $baseSql = "FROM customers c WHERE $whereSql";
        
        if (!empty($filters['hasOrders']) && $filters['hasOrders'] !== 'all') {
            if ($filters['hasOrders'] === 'yes') {
                $baseSql .= " AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.order_status != 'cancelled')";
            } else {
                $baseSql .= " AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.order_status != 'cancelled')";
            }
        }
        
        $pointsSql = "(
            (SELECT COALESCE(SUM(pt.points), 0) FROM customer_point_transactions pt WHERE pt.customer_phone = c.phone) 
            + 
            CASE WHEN NOT EXISTS (SELECT 1 FROM customer_point_transactions pt2 WHERE pt2.customer_phone = c.phone) THEN
                (SELECT COALESCE(SUM(spr.approved_points), 0) FROM shopee_point_requests spr WHERE spr.phone = c.phone AND spr.processing_status = 'approved')
            ELSE 0 END
        )";

        if (!empty($filters['tier']) && $filters['tier'] !== 'all') {
            $tierMap = [
                'Silver' => [0, 4999],
                'Gold' => [5000, 14999],
                'Platinum' => [15000, 999999999]
            ];
            if (isset($tierMap[$filters['tier']])) {
                $min = $tierMap[$filters['tier']][0];
                $max = $tierMap[$filters['tier']][1];
                $baseSql .= " AND $pointsSql BETWEEN $min AND $max";
            }
        }

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total $baseSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get items
        $sql = "SELECT c.id, c.full_name, c.email, c.phone, c.status, c.created_at, c.phone_verified_at, c.email_verified_at, c.last_login_at,
                       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.order_status != 'cancelled') as total_orders,
                       (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.customer_id = c.id AND o.order_status = 'completed') as total_spent,
                       (SELECT MAX(created_at) FROM orders o WHERE o.customer_id = c.id AND o.order_status != 'cancelled') as last_order_date,
                       $pointsSql as total_points
                $baseSql
                ORDER BY c.created_at DESC 
                LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
                
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($items as &$item) {
            $pts = (int)$item['total_points'];
            $item['tier'] = 'Silver';
            if ($pts >= 15000) $item['tier'] = 'Platinum';
            elseif ($pts >= 5000) $item['tier'] = 'Gold';
        }
        
        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ];
    }

    public function adminGetCustomerDetail($id) {
        $customer = $this->findById($id);
        if (!$customer) return null;
        
        // Sessions
        $stmtSession = $this->db->prepare("SELECT id, created_at, expires_at, revoked_at FROM customer_sessions WHERE customer_id = :id ORDER BY id DESC LIMIT 10");
        $stmtSession->execute([':id' => $id]);
        $customer['sessions'] = $stmtSession->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure not to leak sensitive hashes
        unset($customer['password_hash']);
        
        return $customer;
    }

    public function adminUpdateStatus($id, $status, $reason, $adminId) {
        $stmt = $this->db->prepare("UPDATE customers SET status = :status WHERE id = :id");
        $success = $stmt->execute([':status' => $status, ':id' => (int)$id]);
        if ($success && $status === 'blocked') {
            // Revoke all sessions
            $stmtRevoke = $this->db->prepare("UPDATE customer_sessions SET revoked_at = NOW() WHERE customer_id = :id AND revoked_at IS NULL");
            $stmtRevoke->execute([':id' => (int)$id]);
        }
        return $success;
    }

    public function adminGetCustomerOrders($id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE customer_id = :id ORDER BY id DESC LIMIT 50");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function adminGetCustomerPoints($phone) {
        $pointModel = new CustomerPointTransactionModel();
        return $pointModel->getCustomerTransactions($phone);
    }
}
