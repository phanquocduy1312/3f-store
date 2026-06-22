<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltySettings {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Retrieve all loyalty configurations.
     */
    public function getAll() {
        $stmt = $this->db->prepare("SELECT setting_key, setting_value, description FROM loyalty_settings");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = [
                'value' => $row['setting_value'],
                'description' => $row['description']
            ];
        }
        return $settings;
    }

    /**
     * Retrieve a specific config value.
     */
    public function get($key, $default = null) {
        $stmt = $this->db->prepare("SELECT setting_value FROM loyalty_settings WHERE setting_key = :key LIMIT 1");
        $stmt->execute([':key' => $key]);
        $val = $stmt->fetchColumn();
        return $val !== false ? $val : $default;
    }

    /**
     * Set/update a config value.
     */
    public function set($key, $value) {
        $stmt = $this->db->prepare("
            INSERT INTO loyalty_settings (setting_key, setting_value) 
            VALUES (:key, :value)
            ON DUPLICATE KEY UPDATE setting_value = :value
        ");
        return $stmt->execute([
            ':key' => $key,
            ':value' => (string)$value
        ]);
    }
}
