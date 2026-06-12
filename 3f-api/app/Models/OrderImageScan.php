<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class OrderImageScan {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        
        // Dynamically ensure error_message column exists in order_image_scans table
        try {
            $stmt = $this->db->query("SHOW COLUMNS FROM order_image_scans LIKE 'error_message'");
            if (!$stmt->fetch()) {
                $this->db->exec("ALTER TABLE order_image_scans ADD COLUMN error_message TEXT NULL");
            }
        } catch (\Exception $e) {
            // Silence column check exceptions to guarantee uptime on varying server setups
        }
    }

    /**
     * Inserts OCR scan result into database.
     */
    public function create($data) {
        $sql = "
            INSERT INTO order_image_scans (
                image_id, 
                scan_status, 
                raw_text, 
                extracted_customer_name, 
                extracted_phone, 
                extracted_email, 
                extracted_order_code, 
                extracted_order_amount, 
                extracted_order_date, 
                extracted_order_status, 
                extracted_shipping_provider, 
                extracted_tracking_code, 
                confidence, 
                warnings, 
                error_message,
                ocr_provider
            ) VALUES (
                :image_id, 
                :scan_status, 
                :raw_text, 
                :extracted_customer_name, 
                :extracted_phone, 
                :extracted_email, 
                :extracted_order_code, 
                :extracted_order_amount, 
                :extracted_order_date, 
                :extracted_order_status, 
                :extracted_shipping_provider, 
                :extracted_tracking_code, 
                :confidence, 
                :warnings, 
                :error_message,
                :ocr_provider
            )
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':image_id'                    => $data['image_id'],
            ':scan_status'                 => isset($data['scan_status']) ? $data['scan_status'] : 'success',
            ':raw_text'                    => isset($data['raw_text']) ? $data['raw_text'] : '',
            ':extracted_customer_name'     => isset($data['extracted_customer_name']) ? $data['extracted_customer_name'] : null,
            ':extracted_phone'             => isset($data['extracted_phone']) ? $data['extracted_phone'] : null,
            ':extracted_email'             => isset($data['extracted_email']) ? $data['extracted_email'] : null,
            ':extracted_order_code'        => isset($data['extracted_order_code']) ? $data['extracted_order_code'] : null,
            ':extracted_order_amount'      => isset($data['extracted_order_amount']) ? $data['extracted_order_amount'] : null,
            ':extracted_order_date'        => isset($data['extracted_order_date']) ? $data['extracted_order_date'] : null,
            ':extracted_order_status'      => isset($data['extracted_order_status']) ? $data['extracted_order_status'] : null,
            ':extracted_shipping_provider' => isset($data['extracted_shipping_provider']) ? $data['extracted_shipping_provider'] : null,
            ':extracted_tracking_code'     => isset($data['extracted_tracking_code']) ? $data['extracted_tracking_code'] : null,
            ':confidence'                  => isset($data['confidence']) ? (int)$data['confidence'] : 0,
            ':warnings'                    => isset($data['warnings']) ? $data['warnings'] : '[]',
            ':error_message'               => isset($data['error_message']) ? $data['error_message'] : null,
            ':ocr_provider'                => isset($data['ocr_provider']) ? $data['ocr_provider'] : 'ocr_space'
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Finds scan record by primary ID.
     */
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM order_image_scans WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Finds scan record by associated image ID.
     */
    public function findByImageId($imageId) {
        $stmt = $this->db->prepare("SELECT * FROM order_image_scans WHERE image_id = :image_id ORDER BY id DESC LIMIT 1");
        $stmt->execute([':image_id' => $imageId]);
        return $stmt->fetch() ?: null;
    }
}
