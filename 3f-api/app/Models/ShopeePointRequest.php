<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ShopeePointRequest {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->checkAndMigrate();
            self::$migrated = true;
        }
    }

    /**
     * Inserts new Shopee point request.
     */
    public function create($data) {
        $sql = "
            INSERT INTO shopee_point_requests (
                customer_name, 
                phone, 
                email, 
                zalo, 
                shopee_order_code, 
                order_amount, 
                expected_points, 
                approved_points, 
                image_id, 
                scan_id, 
                processing_status, 
                verification_status, 
                source,
                customer_id
            ) VALUES (
                :customer_name, 
                :phone, 
                :email, 
                :zalo, 
                :shopee_order_code, 
                :order_amount, 
                :expected_points, 
                0, 
                :image_id, 
                :scan_id, 
                'pending', 
                'not_checked', 
                :source,
                :customer_id
            )
        ";
        $params = [
            ':customer_name'     => isset($data['customer_name']) ? $data['customer_name'] : null,
            ':phone'             => $data['phone'],
            ':email'             => isset($data['email']) ? $data['email'] : null,
            ':zalo'              => isset($data['zalo']) ? $data['zalo'] : null,
            ':shopee_order_code' => $data['shopee_order_code'],
            ':order_amount'      => (int)$data['order_amount'],
            ':expected_points'   => (int)$data['expected_points'],
            ':image_id'          => isset($data['image_id']) ? $data['image_id'] : null,
            ':scan_id'           => isset($data['scan_id']) ? $data['scan_id'] : null,
            ':source'            => isset($data['source']) ? $data['source'] : 'customer_form',
            ':customer_id'       => isset($data['customer_id']) ? $data['customer_id'] : null
        ];
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Finds point request by primary ID.
     */
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM shopee_point_requests WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Finds if order code exists and is not rejected.
     */
    public function findDuplicateActiveOrderCode($orderCode) {
        // 1. Check if it's already awarded
        $stmtAward = $this->db->prepare("
            SELECT id FROM shopee_point_awards 
            WHERE shopee_order_code = :code
            LIMIT 1
        ");
        $stmtAward->execute([':code' => $orderCode]);
        if ($stmtAward->fetch()) {
            return true;
        }

        // 2. Check if it's pending/valid in requests
        $stmtReq = $this->db->prepare("
            SELECT id FROM shopee_point_requests 
            WHERE shopee_order_code = :code 
              AND processing_status = 'pending' 
            LIMIT 1
        ");
        $stmtReq->execute([':code' => $orderCode]);
        if ($stmtReq->fetch()) {
            return true;
        }

        return false;
    }

    /**
     * Fetches list of requests based on dynamic filters.
     */
    public function list($filters) {
        $whereClauses = [];
        $params = [];

        if (!empty($filters['status'])) {
            $whereClauses[] = "r.processing_status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['verification'])) {
            $whereClauses[] = "r.verification_status = :verification";
            $params[':verification'] = $filters['verification'];
        }

        if (!empty($filters['phone'])) {
            $whereClauses[] = "r.phone = :phone";
            $params[':phone'] = $filters['phone'];
        }

        if (!empty($filters['keyword'])) {
            $whereClauses[] = "(r.customer_name LIKE :keyword OR r.phone LIKE :keyword OR r.shopee_order_code LIKE :keyword)";
            $params[':keyword'] = "%" . $filters['keyword'] . "%";
        }

        $whereSQL = "";
        if (count($whereClauses) > 0) {
            $whereSQL = " WHERE " . implode(" AND ", $whereClauses);
        }

        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 20;
        $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;

        $sql = "
            SELECT r.*, img.file_url AS imageUrl
            FROM shopee_point_requests r
            LEFT JOIN uploaded_order_images img ON r.image_id = img.id
            $whereSQL
            ORDER BY r.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Counts total matching records.
     */
    public function count($filters) {
        $whereClauses = [];
        $params = [];

        if (!empty($filters['status'])) {
            $whereClauses[] = "r.processing_status = :status";
            $params[':status'] = $filters['status'];
        }

        if (!empty($filters['verification'])) {
            $whereClauses[] = "r.verification_status = :verification";
            $params[':verification'] = $filters['verification'];
        }

        if (!empty($filters['phone'])) {
            $whereClauses[] = "r.phone = :phone";
            $params[':phone'] = $filters['phone'];
        }

        if (!empty($filters['keyword'])) {
            $whereClauses[] = "(r.customer_name LIKE :keyword OR r.phone LIKE :keyword OR r.shopee_order_code LIKE :keyword)";
            $params[':keyword'] = "%" . $filters['keyword'] . "%";
        }

        $whereSQL = "";
        if (count($whereClauses) > 0) {
            $whereSQL = " WHERE " . implode(" AND ", $whereClauses);
        }

        $sql = "SELECT COUNT(*) AS total FROM shopee_point_requests r $whereSQL";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $res = $stmt->fetch();
        return $res ? (int)$res['total'] : 0;
    }

    /**
     * Approves point request.
     */
    public function approve($id, $data) {
        $sql = "
            UPDATE shopee_point_requests 
            SET processing_status = 'approved',
                verification_status = :verification_status,
                approved_points = :approved_points,
                approved_at = NOW(),
                admin_note = :admin_note
            WHERE id = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':verification_status' => $data['verification_status'],
            ':approved_points'     => (int)$data['approved_points'],
            ':admin_note'          => isset($data['admin_note']) ? $data['admin_note'] : null,
            ':id'                  => $id
        ]);
    }

    /**
     * Rejects point request.
     */
    public function reject($id, $reasonCode, $reasonText) {
        $sql = "
            UPDATE shopee_point_requests 
            SET processing_status = 'rejected',
                reject_reason_code = :reject_reason_code,
                rejected_reason = :rejected_reason,
                rejected_at = NOW()
            WHERE id = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':reject_reason_code' => $reasonCode,
            ':rejected_reason'    => $reasonText,
            ':id'                 => $id
        ]);
    }

    /**
     * Checks if another approved request has the same order code.
     */
    public function hasApprovedOrderCode($orderCode) {
        $stmt = $this->db->prepare("
            SELECT id FROM shopee_point_requests 
            WHERE shopee_order_code = :code 
              AND processing_status = 'approved' 
            LIMIT 1
        ");
        $stmt->execute([':code' => $orderCode]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Sums all approved points by customer phone.
     */
    public function sumApprovedPointsByPhone($phone) {
        $stmt = $this->db->prepare("
            SELECT SUM(approved_points) AS total_approved 
            FROM shopee_point_requests 
            WHERE phone = :phone 
              AND processing_status = 'approved'
        ");
        $stmt->execute([':phone' => $phone]);
        $res = $stmt->fetch();
        return $res && isset($res['total_approved']) ? (int)$res['total_approved'] : 0;
    }

    /**
     * Checks if verification columns exist and adds them if missing.
     */
    public function checkAndMigrate() {
        try {
            // Check existing shopee_point_requests migrations
            $stmt = $this->db->query("SHOW COLUMNS FROM `shopee_point_requests` LIKE 'matched_shopee_order_id'");
            $column = $stmt->fetch();
            
            if (!$column) {
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `matched_shopee_order_id` VARCHAR(100) NULL AFTER `verification_status`");
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `shopee_api_status` VARCHAR(50) NULL AFTER `matched_shopee_order_id`");
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `shopee_api_order_amount` INT NULL AFTER `shopee_api_status`");
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `shopee_api_raw_json` LONGTEXT NULL AFTER `shopee_api_order_amount`");
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `verified_at` DATETIME NULL AFTER `shopee_api_raw_json`");
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `verification_note` TEXT NULL AFTER `verified_at`");
            }

            $stmtCustomer = $this->db->query("SHOW COLUMNS FROM `shopee_point_requests` LIKE 'customer_id'");
            if (!$stmtCustomer->fetch()) {
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `customer_id` INT NULL AFTER `id`");
            }

            $stmtRejectCode = $this->db->query("SHOW COLUMNS FROM `shopee_point_requests` LIKE 'reject_reason_code'");
            if (!$stmtRejectCode->fetch()) {
                $this->db->exec("ALTER TABLE `shopee_point_requests` ADD COLUMN `reject_reason_code` VARCHAR(50) NULL AFTER `rejected_reason`");
            }

            // Create shopee_point_awards table
            $stmtTable = $this->db->query("SHOW TABLES LIKE 'shopee_point_awards'");
            if ($stmtTable->rowCount() == 0) {
                $sql = "
                    CREATE TABLE `shopee_point_awards` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `request_id` INT NOT NULL,
                        `shopee_order_code` VARCHAR(255) NOT NULL UNIQUE,
                        `customer_id` INT NULL,
                        `phone` VARCHAR(30) NOT NULL,
                        `verified_amount` INT NOT NULL,
                        `points_awarded` INT NOT NULL,
                        `point_transaction_id` INT NULL,
                        `approved_by_admin_id` INT NULL,
                        `environment` VARCHAR(20) DEFAULT 'live',
                        `shop_id` BIGINT NULL,
                        `is_legacy` TINYINT(1) DEFAULT 0,
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_request_id (request_id),
                        INDEX idx_customer_id (customer_id),
                        INDEX idx_created_at (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ";
                $this->db->exec($sql);

                // Backfill existing approved requests
                $this->backfillAwards();
            }

        } catch (\Exception $e) {
            error_log("Database migration check failed: " . $e->getMessage());
        }
    }

    /**
     * Backfill existing approved requests into shopee_point_awards.
     */
    private function backfillAwards() {
        try {
            $sql = "
                INSERT IGNORE INTO shopee_point_awards (
                    request_id, shopee_order_code, customer_id, phone, 
                    verified_amount, points_awarded, is_legacy
                )
                SELECT 
                    id, shopee_order_code, customer_id, phone, 
                    COALESCE(shopee_api_order_amount, order_amount, 0), 
                    approved_points, 1
                FROM shopee_point_requests 
                WHERE processing_status = 'approved'
            ";
            $this->db->exec($sql);
        } catch (\Exception $e) {
            error_log("Backfill shopee_point_awards failed: " . $e->getMessage());
        }
    }

    /**
     * Updates verification status and info.
     */
    public function updateVerification($id, $data) {
        $sql = "
            UPDATE shopee_point_requests 
            SET verification_status = :verification_status,
                matched_shopee_order_id = :matched_shopee_order_id,
                shopee_api_status = :shopee_api_status,
                shopee_api_order_amount = :shopee_api_order_amount,
                shopee_api_raw_json = :shopee_api_raw_json,
                verified_at = NOW(),
                verification_note = :verification_note
            WHERE id = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':verification_status'     => $data['verification_status'],
            ':matched_shopee_order_id' => isset($data['matched_shopee_order_id']) ? $data['matched_shopee_order_id'] : null,
            ':shopee_api_status'       => isset($data['shopee_api_status']) ? $data['shopee_api_status'] : null,
            ':shopee_api_order_amount' => isset($data['shopee_api_order_amount']) ? (int)$data['shopee_api_order_amount'] : null,
            ':shopee_api_raw_json'     => isset($data['shopee_api_raw_json']) ? $data['shopee_api_raw_json'] : null,
            ':verification_note'       => isset($data['verification_note']) ? $data['verification_note'] : null,
            ':id'                      => $id
        ]);
    }

    /**
     * Gets requests pending verification.
     */
    public function getPendingVerificationRequests($ids = null) {
        if ($ids !== null) {
            if (empty($ids)) return [];
            $inQuery = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $this->db->prepare("
                SELECT * FROM shopee_point_requests 
                WHERE id IN ($inQuery) AND processing_status = 'pending'
            ");
            $stmt->execute($ids);
            return $stmt->fetchAll();
        }
        
        $stmt = $this->db->prepare("
            SELECT * FROM shopee_point_requests 
            WHERE processing_status = 'pending' AND verification_status = 'not_checked'
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Checks if another approved or valid request exists with the same order code.
     */
    public function checkDuplicateOrderCode($orderCode, $excludeId) {
        $stmt = $this->db->prepare("
            SELECT id FROM shopee_point_requests 
            WHERE shopee_order_code = :code 
              AND id != :exclude_id
              AND (processing_status = 'approved' OR verification_status = 'valid')
            LIMIT 1
        ");
        $stmt->execute([
            ':code'       => $orderCode,
            ':exclude_id' => $excludeId
        ]);
        return $stmt->fetch() ?: null;
    }
}
