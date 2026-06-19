<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ShopeeTokenModel {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    /**
     * Run database schema migration safely.
     */
    private function migrate() {
        try {
            // 1. Create shopee_oauth_states table if not exists
            $sqlStates = "
                CREATE TABLE IF NOT EXISTS `shopee_oauth_states` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `state` VARCHAR(255) UNIQUE NOT NULL,
                    `admin_user_id` INT NULL,
                    `expires_at` DATETIME NOT NULL,
                    `used_at` DATETIME NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            $this->db->exec($sqlStates);

            // 2. Safe migration for shopee_tokens table
            $stmt = $this->db->query("SHOW TABLES LIKE 'shopee_tokens'");
            $tableExists = ($stmt->rowCount() > 0);

            if (!$tableExists) {
                $sqlTokens = "
                    CREATE TABLE `shopee_tokens` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `shop_id` VARCHAR(100) NOT NULL UNIQUE,
                        `shop_name` VARCHAR(255) NULL,
                        `access_token` TEXT NOT NULL,
                        `refresh_token` VARCHAR(255) NOT NULL,
                        `access_token_expire_at` DATETIME NOT NULL,
                        `refresh_token_expire_at` DATETIME NULL,
                        `is_active` TINYINT(1) DEFAULT 1,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ";
                $this->db->exec($sqlTokens);
            } else {
                // Modify access_token to TEXT to handle potentially long Shopee v2 tokens
                $this->db->exec("ALTER TABLE `shopee_tokens` MODIFY COLUMN `access_token` TEXT NOT NULL");

                // Add new columns if missing
                $columnsStmt = $this->db->query("DESCRIBE `shopee_tokens`");
                $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);

                if (!in_array('shop_name', $columns)) {
                    $this->db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `shop_name` VARCHAR(255) NULL AFTER `shop_id`");
                }
                if (!in_array('access_token_expire_at', $columns)) {
                    $this->db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `access_token_expire_at` DATETIME NULL AFTER `refresh_token`");
                }
                if (!in_array('refresh_token_expire_at', $columns)) {
                    $this->db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `refresh_token_expire_at` DATETIME NULL AFTER `access_token_expire_at`");
                }
                if (!in_array('is_active', $columns)) {
                    $this->db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 AFTER `refresh_token_expire_at`");
                }
                if (!in_array('environment', $columns)) {
                    $this->db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `environment` VARCHAR(20) DEFAULT 'sandbox' AFTER `shop_name`");
                    // Disable all legacy tokens when migrating to new environment-aware schema
                    $this->db->exec("UPDATE `shopee_tokens` SET `is_active` = 0 WHERE `environment` = 'sandbox'");
                }

                // Migrate data from token_expired_at column to access_token_expire_at if present
                if (in_array('token_expired_at', $columns)) {
                    $this->db->exec("UPDATE `shopee_tokens` SET `access_token_expire_at` = `token_expired_at` WHERE `access_token_expire_at` IS NULL");
                }

                // Guarantee access_token_expire_at is populated and set as NOT NULL
                $this->db->exec("UPDATE `shopee_tokens` SET `access_token_expire_at` = NOW() WHERE `access_token_expire_at` IS NULL");
                $this->db->exec("ALTER TABLE `shopee_tokens` MODIFY COLUMN `access_token_expire_at` DATETIME NOT NULL");

                // Ensure shop_id is unique
                $indexes = $this->db->query("SHOW INDEX FROM `shopee_tokens`")->fetchAll(PDO::FETCH_ASSOC);
                $hasUniqueShopId = false;
                foreach ($indexes as $idx) {
                    if ($idx['Column_name'] === 'shop_id' && (int)$idx['Non_unique'] === 0) {
                        $hasUniqueShopId = true;
                        break;
                    }
                }

                if (!$hasUniqueShopId) {
                    // Deduplicate shop_id records (keeping the latest one based on updated_at/id)
                    $this->db->exec("
                        DELETE t1 FROM shopee_tokens t1
                        INNER JOIN shopee_tokens t2 
                        WHERE t1.id < t2.id AND t1.shop_id = t2.shop_id
                    ");

                    // Drop composite index if exists
                    try {
                        $this->db->exec("ALTER TABLE `shopee_tokens` DROP INDEX `idx_shop_partner`");
                    } catch (\Exception $e) {
                        // Ignore if not present
                    }

                    // Add unique constraint on shop_id
                    try {
                        $this->db->exec("ALTER TABLE `shopee_tokens` ADD UNIQUE (`shop_id`)");
                    } catch (\Exception $e) {
                        // Ignore if error
                    }
                }
            }
        } catch (\Throwable $e) {
            error_log("ShopeeTokenModel Auto-Migration Error: " . $e->getMessage());
        }
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
     * Gets the latest active token matching the environment.
     *
     * @param string|null $environment Defaults to SHOPEE_ENV or 'sandbox'
     * @return array|null
     */
    public function getLatestToken($environment = null) {
        if ($environment === null) {
            $environment = getenv('SHOPEE_ENV') ?: 'sandbox';
        }
        
        $stmt = $this->db->prepare("SELECT * FROM shopee_tokens WHERE is_active = 1 AND environment = :environment ORDER BY updated_at DESC, id DESC LIMIT 1");
        $stmt->execute([':environment' => $environment]);
        return $stmt->fetch() ?: null;
    }

    public function upsertToken($data) {
        $env = isset($data['environment']) ? $data['environment'] : (getenv('SHOPEE_ENV') ?: 'sandbox');
        
        $sql = "
            INSERT INTO shopee_tokens (
                shop_id, 
                shop_name, 
                environment,
                access_token, 
                refresh_token, 
                access_token_expire_at, 
                refresh_token_expire_at,
                is_active
            ) VALUES (
                :shop_id, 
                :shop_name, 
                :environment,
                :access_token, 
                :refresh_token, 
                :access_token_expire_at, 
                :refresh_token_expire_at,
                :is_active
            )
            ON DUPLICATE KEY UPDATE
                shop_name = VALUES(shop_name),
                environment = VALUES(environment),
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                access_token_expire_at = VALUES(access_token_expire_at),
                refresh_token_expire_at = VALUES(refresh_token_expire_at),
                is_active = VALUES(is_active),
                updated_at = CURRENT_TIMESTAMP
        ";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':shop_id'                 => $data['shop_id'],
            ':shop_name'               => $data['shop_name'] ?? null,
            ':environment'             => $env,
            ':access_token'            => $data['access_token'],
            ':refresh_token'           => $data['refresh_token'],
            ':access_token_expire_at'  => $data['access_token_expire_at'],
            ':refresh_token_expire_at' => $data['refresh_token_expire_at'] ?? null,
            ':is_active'               => isset($data['is_active']) ? (int)$data['is_active'] : 1
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

        $allowedKeys = [
            'shop_name', 
            'environment',
            'access_token', 
            'refresh_token', 
            'access_token_expire_at', 
            'refresh_token_expire_at', 
            'is_active'
        ];

        foreach ($data as $key => $val) {
            if (in_array($key, $allowedKeys, true)) {
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
