<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ShopeeOauthStateModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Creates a new random state with an expiry time.
     *
     * @param string $state
     * @param int|null $adminUserId
     * @param int $expiresInSeconds
     * @return bool
     */
    public function createState($state, $adminUserId = null, $expiresInSeconds = 600) {
        $expiresAt = date('Y-m-d H:i:s', time() + $expiresInSeconds);
        $sql = "INSERT INTO shopee_oauth_states (state, admin_user_id, expires_at) VALUES (:state, :admin_user_id, :expires_at)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':state'         => $state,
            ':admin_user_id' => $adminUserId,
            ':expires_at'    => $expiresAt
        ]);
    }

    /**
     * Finds state details.
     *
     * @param string $state
     * @return array|null
     */
    public function findState($state) {
        $stmt = $this->db->prepare("SELECT * FROM shopee_oauth_states WHERE state = :state LIMIT 1");
        $stmt->execute([':state' => $state]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Marks a state as used.
     *
     * @param string $state
     * @return bool
     */
    public function markAsUsed($state) {
        $stmt = $this->db->prepare("UPDATE shopee_oauth_states SET used_at = :used_at WHERE state = :state");
        return $stmt->execute([
            ':used_at' => date('Y-m-d H:i:s'),
            ':state'   => $state
        ]);
    }
}
