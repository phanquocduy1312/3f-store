<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

class LoyaltyPointTransaction {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get available balance for a customer.
     */
    public function getAvailableBalance($customerId) {
        $stmt = $this->db->prepare("
            SELECT SUM(points) FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id AND status = 'available'
        ");
        $stmt->execute([':customer_id' => $customerId]);
        $avail = (int)$stmt->fetchColumn();

        // Also subtract used points (which are negative points stored with status 'used')
        $stmtUsed = $this->db->prepare("
            SELECT SUM(points) FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id AND status = 'used'
        ");
        $stmtUsed->execute([':customer_id' => $customerId]);
        $used = (int)$stmtUsed->fetchColumn();

        return $avail + $used; // since used is negative, addition actually subtracts
    }

    /**
     * Get holding balance for a customer.
     */
    public function getHoldingBalance($customerId) {
        $stmt = $this->db->prepare("
            SELECT SUM(points) FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id AND status = 'holding'
        ");
        $stmt->execute([':customer_id' => $customerId]);
        return (int)($stmt->fetchColumn() ?: 0);
    }

    /**
     * Get used balance for a customer.
     */
    public function getUsedBalance($customerId) {
        $stmt = $this->db->prepare("
            SELECT SUM(points) FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id AND status = 'used'
        ");
        return abs((int)($stmt->fetchColumn() ?: 0));
    }

    /**
     * Get expired points.
     */
    public function getExpiredBalance($customerId) {
        $stmt = $this->db->prepare("
            SELECT SUM(points) FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id AND status = 'expired'
        ");
        return (int)($stmt->fetchColumn() ?: 0);
    }

    /**
     * Add a ledger transaction.
     */
    public function addTransaction($data) {
        $db = $this->db;

        // Idempotency check using idempotency_key
        if (!empty($data['idempotency_key'])) {
            $stmt = $db->prepare("SELECT id FROM loyalty_point_transactions WHERE idempotency_key = ? LIMIT 1");
            $stmt->execute([$data['idempotency_key']]);
            if ($stmt->fetch()) {
                return false; 
            }
        }

        $currentBalance = $this->getAvailableBalance($data['customer_id']);
        $points = (int)$data['points'];
        
        $balanceAfter = $currentBalance;
        if (in_array($data['status'], ['available', 'used'])) {
            $balanceAfter = $currentBalance + $points;
        }

        $sql = "
            INSERT INTO loyalty_point_transactions (
                customer_id, order_id, source, type, status, points, 
                eligible_amount, multiplier, balance_after, expires_at, 
                reference_type, reference_id, reason, created_by_admin_id, 
                metadata_json, idempotency_key
            ) VALUES (
                :customer_id, :order_id, :source, :type, :status, :points, 
                :eligible_amount, :multiplier, :balance_after, :expires_at, 
                :reference_type, :reference_id, :reason, :created_by_admin_id, 
                :metadata_json, :idempotency_key
            )
        ";

        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':customer_id' => $data['customer_id'],
                ':order_id' => $data['order_id'] ?? null,
                ':source' => $data['source'],
                ':type' => $data['type'],
                ':status' => $data['status'],
                ':points' => $points,
                ':eligible_amount' => $data['eligible_amount'] ?? 0.00,
                ':multiplier' => $data['multiplier'] ?? 1.00,
                ':balance_after' => $balanceAfter,
                ':expires_at' => $data['expires_at'] ?? null,
                ':reference_type' => $data['reference_type'] ?? null,
                ':reference_id' => $data['reference_id'] ?? null,
                ':reason' => $data['reason'] ?? null,
                ':created_by_admin_id' => $data['created_by_admin_id'] ?? null,
                ':metadata_json' => isset($data['metadata_json']) ? json_encode($data['metadata_json']) : null,
                ':idempotency_key' => $data['idempotency_key'] ?? null
            ]);

            return (int)$db->lastInsertId();
        } catch (\PDOException $e) {
            if ($e->getCode() == '23000' || strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return false;
            }
            throw $e;
        }
    }

    /**
     * Get transaction history for a customer.
     */
    public function getCustomerTransactions($customerId) {
        $stmt = $this->db->prepare("
            SELECT * FROM loyalty_point_transactions 
            WHERE customer_id = :customer_id 
            ORDER BY id DESC
        ");
        $stmt->execute([':customer_id' => $customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
