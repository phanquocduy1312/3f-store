<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ShopeeTokenModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Finds token details by shop ID.
     *
     * @param string|int $shopId
     * @return array|null
     */
    public function findByShopId($shopId) {
        $stmt = $this->db->prepare("SELECT * FROM shopee_tokens WHERE shop_id = :shop_id LIMIT 1");
        $stmt->execute([':shop_id' => $shopId]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Gets the latest updated token.
     *
     * @return array|null
     */
    public function getLatestToken() {
        $stmt = $this->db->prepare("SELECT * FROM shopee_tokens ORDER BY updated_at DESC, id DESC LIMIT 1");
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    /**
     * Inserts new token or updates on duplicate shop_id + partner_id key.
     *
     * @param array $data
     * @return bool
     */
    public function upsertToken($data) {
        $sql = "
            INSERT INTO shopee_tokens (
                shop_id, 
                partner_id, 
                access_token, 
                refresh_token, 
                expire_in, 
                token_expired_at
            ) VALUES (
                :shop_id, 
                :partner_id, 
                :access_token, 
                :refresh_token, 
                :expire_in, 
                :token_expired_at
            )
            ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                expire_in = VALUES(expire_in),
                token_expired_at = VALUES(token_expired_at),
                updated_at = CURRENT_TIMESTAMP
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':shop_id'          => $data['shop_id'],
            ':partner_id'       => $data['partner_id'],
            ':access_token'     => $data['access_token'],
            ':refresh_token'    => $data['refresh_token'],
            ':expire_in'        => $data['expire_in'],
            ':token_expired_at' => $data['token_expired_at']
        ]);
    }

    /**
     * Updates an existing shop's token.
     *
     * @param string|int $shopId
     * @param array $data
     * @return bool
     */
    public function updateToken($shopId, $data) {
        $fields = [];
        $params = [':shop_id' => $shopId];

        foreach ($data as $key => $val) {
            if (in_array($key, ['access_token', 'refresh_token', 'expire_in', 'token_expired_at'])) {
                $fields[] = "`$key` = :$key";
                $params[":$key"] = $val;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE shopee_tokens SET " . implode(', ', $fields) . " WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
