<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ShopeePointRequest {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
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
                source
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
                :source
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
            ':source'            => isset($data['source']) ? $data['source'] : 'customer_form'
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
        $stmt = $this->db->prepare("
            SELECT id FROM shopee_point_requests 
            WHERE shopee_order_code = :code 
              AND processing_status != 'rejected' 
            LIMIT 1
        ");
        $stmt->execute([':code' => $orderCode]);
        return $stmt->fetch() ?: null;
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
    public function reject($id, $reason) {
        $sql = "
            UPDATE shopee_point_requests 
            SET processing_status = 'rejected',
                rejected_reason = :rejected_reason,
                rejected_at = NOW()
            WHERE id = :id
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':rejected_reason' => $reason,
            ':id'              => $id
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
}
