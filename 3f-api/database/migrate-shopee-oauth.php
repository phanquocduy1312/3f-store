<?php
/**
 * Migration Script for Shopee OAuth Connection Tables (Safe Migration Version)
 * Usage: php 3f-api/database/migrate-shopee-oauth.php
 */

// Load env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv("{$parts[0]}={$parts[1]}");
            $_ENV[$parts[0]] = $parts[1];
            $_SERVER[$parts[0]] = $parts[1];
        }
    }
}

// Autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database successfully.\n";

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
    $db->exec($sqlStates);
    echo "Table 'shopee_oauth_states' initialized/checked.\n";

    // 2. Safe migration for shopee_tokens table
    $stmt = $db->query("SHOW TABLES LIKE 'shopee_tokens'");
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
        $db->exec($sqlTokens);
        echo "Table 'shopee_tokens' created from scratch.\n";
    } else {
        echo "Table 'shopee_tokens' already exists. Performing safe migration...\n";

        // Modify access_token to TEXT to handle potentially long Shopee v2 tokens
        $db->exec("ALTER TABLE `shopee_tokens` MODIFY COLUMN `access_token` TEXT NOT NULL");
        echo "Modified access_token column to TEXT.\n";

        // Add new columns if missing
        $columnsStmt = $db->query("DESCRIBE `shopee_tokens`");
        $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);

        if (!in_array('shop_name', $columns)) {
            $db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `shop_name` VARCHAR(255) NULL AFTER `shop_id`");
            echo "Added column 'shop_name'.\n";
        }
        if (!in_array('access_token_expire_at', $columns)) {
            $db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `access_token_expire_at` DATETIME NULL AFTER `refresh_token`");
            echo "Added column 'access_token_expire_at'.\n";
        }
        if (!in_array('refresh_token_expire_at', $columns)) {
            $db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `refresh_token_expire_at` DATETIME NULL AFTER `access_token_expire_at`");
            echo "Added column 'refresh_token_expire_at'.\n";
        }
        if (!in_array('is_active', $columns)) {
            $db->exec("ALTER TABLE `shopee_tokens` ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 AFTER `refresh_token_expire_at`");
            echo "Added column 'is_active'.\n";
        }

        // Migrate data from token_expired_at column to access_token_expire_at if present
        if (in_array('token_expired_at', $columns)) {
            $db->exec("UPDATE `shopee_tokens` SET `access_token_expire_at` = `token_expired_at` WHERE `access_token_expire_at` IS NULL");
            echo "Migrated values from 'token_expired_at' to 'access_token_expire_at'.\n";
        }

        // Guarantee access_token_expire_at is populated and set as NOT NULL
        $db->exec("UPDATE `shopee_tokens` SET `access_token_expire_at` = NOW() WHERE `access_token_expire_at` IS NULL");
        $db->exec("ALTER TABLE `shopee_tokens` MODIFY COLUMN `access_token_expire_at` DATETIME NOT NULL");

        // Ensure shop_id is unique
        $indexes = $db->query("SHOW INDEX FROM `shopee_tokens`")->fetchAll(PDO::FETCH_ASSOC);
        $hasUniqueShopId = false;
        foreach ($indexes as $idx) {
            if ($idx['Column_name'] === 'shop_id' && (int)$idx['Non_unique'] === 0) {
                $hasUniqueShopId = true;
                break;
            }
        }

        if (!$hasUniqueShopId) {
            // Deduplicate shop_id records (keeping the latest one based on updated_at/id)
            $db->exec("
                DELETE t1 FROM shopee_tokens t1
                INNER JOIN shopee_tokens t2 
                WHERE t1.id < t2.id AND t1.shop_id = t2.shop_id
            ");
            echo "Deduplicated shopee_tokens records.\n";

            // Drop composite index if exists
            try {
                $db->exec("ALTER TABLE `shopee_tokens` DROP INDEX `idx_shop_partner`");
                echo "Dropped index idx_shop_partner.\n";
            } catch (\Exception $e) {
                // Ignore if not present
            }

            // Add unique constraint on shop_id
            try {
                $db->exec("ALTER TABLE `shopee_tokens` ADD UNIQUE (`shop_id`)");
                echo "Added UNIQUE constraint to shop_id.\n";
            } catch (\Exception $e) {
                echo "Warning: Could not add UNIQUE to shop_id: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "Migration completed successfully.\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
