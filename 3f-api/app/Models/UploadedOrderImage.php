<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class UploadedOrderImage {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Inserts uploaded image details into database.
     */
    public function create($data) {
        $sql = "
            INSERT INTO uploaded_order_images (
                original_filename, 
                stored_filename, 
                file_path, 
                file_url, 
                mime_type, 
                file_size, 
                upload_source
            ) VALUES (
                :original_filename, 
                :stored_filename, 
                :file_path, 
                :file_url, 
                :mime_type, 
                :file_size, 
                :upload_source
            )
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':original_filename' => $data['original_filename'],
            ':stored_filename'   => $data['stored_filename'],
            ':file_path'         => $data['file_path'],
            ':file_url'          => $data['file_url'],
            ':mime_type'         => $data['mime_type'],
            ':file_size'         => $data['file_size'],
            ':upload_source'     => isset($data['upload_source']) ? $data['upload_source'] : 'customer_form'
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Finds image details by primary ID.
     */
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM uploaded_order_images WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }
}
