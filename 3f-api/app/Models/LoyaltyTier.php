<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class LoyaltyTier {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Retrieve all tiers.
     */
    public function getAll() {
        $stmt = $this->db->prepare("SELECT * FROM loyalty_tiers ORDER BY min_spend ASC, id ASC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Retrieve a specific tier by key_name or ID.
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM loyalty_tiers WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getByKeyName($keyName) {
        $stmt = $this->db->prepare("SELECT * FROM loyalty_tiers WHERE key_name = :key LIMIT 1");
        $stmt->execute([':key' => $keyName]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Update a tier.
     */
    public function update($id, $data) {
        $stmt = $this->db->prepare("
            UPDATE loyalty_tiers
            SET name = :name,
                multiplier = :multiplier,
                color = :color,
                min_spend = :min_spend,
                min_orders = :min_orders,
                redemption_cap_percent = :redemption_cap_percent,
                benefits = :benefits,
                is_active = :is_active
            WHERE id = :id
        ");
        return $stmt->execute([
            ':id' => (int)$id,
            ':name' => $data['name'],
            ':multiplier' => (float)$data['multiplier'],
            ':color' => $data['color'],
            ':min_spend' => (float)$data['min_spend'],
            ':min_orders' => (int)$data['min_orders'],
            ':redemption_cap_percent' => (int)$data['redemption_cap_percent'],
            ':benefits' => $data['benefits'] ?? '',
            ':is_active' => (int)$data['is_active']
        ]);
    }
}
