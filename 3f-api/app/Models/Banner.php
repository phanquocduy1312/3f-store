<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

/**
 * Banner Model.
 */
class Banner {
    private $db;
    private static $migrated = false;
    
    // Placement Whitelist
    public static $placements = [
        'home_hero_slider'
    ];

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    private function migrate() {
        $schemaPath = dirname(__DIR__, 2) . '/database/banners_schema.sql';
        if (file_exists($schemaPath)) {
            $sql = file_get_contents($schemaPath);
            try {
                $this->db->exec($sql);
                
                // Seed default banners if empty
                $count = $this->db->query("SELECT COUNT(*) FROM banners WHERE deleted_at IS NULL")->fetchColumn();
                if ($count == 0) {
                    $this->db->exec("
                        INSERT INTO banners (placement, image_url, link_url, is_active, sort_order) VALUES
                        ('home_hero_slider', '/assets/images/banner-1.webp', '/products', 1, 1),
                        ('home_hero_slider', '/assets/images/banner-2.webp', '/products', 1, 2),
                        ('home_hero_slider', '/assets/images/banner-3.webp', '/products', 1, 3)
                    ");
                }
            } catch (\PDOException $e) {
                // Ignore errors during migration if the table or index already exists
                error_log("Banners migration warning: " . $e->getMessage());
            }
        }
    }

    /**
     * Get active banners, optionally filtered by placement.
     */
    public function getActiveBanners($placement = null) {
        $sql = "
            SELECT id, placement, title, subtitle, image_url, link_url, button_text, sort_order, start_at, end_at
            FROM banners
            WHERE is_active = 1
              AND deleted_at IS NULL
              AND (start_at IS NULL OR start_at <= NOW())
              AND (end_at IS NULL OR end_at >= NOW())
        ";
        
        $params = [];
        if ($placement !== null) {
            if (!in_array($placement, self::$placements, true)) {
                return [];
            }
            $sql .= " AND placement = :placement";
            $params[':placement'] = $placement;
        }
        
        $sql .= " ORDER BY sort_order ASC, created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Admin paginate banners list.
     */
    public function adminPaginateBanners($filters) {
        $page = isset($filters['page']) ? max(1, (int)$filters['page']) : 1;
        $limit = isset($filters['limit']) ? min(100, max(1, (int)$filters['limit'])) : 10;
        $offset = ($page - 1) * $limit;

        $where = ["deleted_at IS NULL"];
        $params = [];

        if (!empty($filters['placement']) && $filters['placement'] !== 'all') {
            $where[] = "placement = :placement";
            $params[':placement'] = $filters['placement'];
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== 'all' && $filters['is_active'] !== '') {
            $where[] = "is_active = :is_active";
            $params[':is_active'] = (int)$filters['is_active'];
        }

        if (!empty($filters['q'])) {
            $where[] = "(title LIKE :search OR subtitle LIKE :search)";
            $params[':search'] = "%{$filters['q']}%";
        }

        $whereSql = implode(' AND ', $where);

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM banners WHERE $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get items
        $sql = "
            SELECT *
            FROM banners
            WHERE $whereSql
            ORDER BY sort_order ASC, created_at DESC
            LIMIT " . (int)$limit . " OFFSET " . (int)$offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'totalPages' => ceil($total / $limit)
        ];
    }

    /**
     * Admin get details for a banner.
     */
    public function adminGetBannerDetail($id) {
        $stmt = $this->db->prepare("SELECT * FROM banners WHERE id = :id AND deleted_at IS NULL LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Validate payload fields according to specifications.
     */
    public function validate($payload) {
        if (empty($payload['placement']) || !in_array($payload['placement'], self::$placements, true)) {
            throw new Exception("Vị trí hiển thị (placement) không hợp lệ.");
        }
        if (empty($payload['image_url'])) {
            throw new Exception("Đường dẫn hình ảnh (image_url) là bắt buộc.");
        }
        if (isset($payload['sort_order']) && !is_numeric($payload['sort_order'])) {
            throw new Exception("Thứ tự hiển thị (sort_order) phải là số nguyên.");
        }
        
        $start_at = !empty($payload['start_at']) ? $payload['start_at'] : null;
        $end_at = !empty($payload['end_at']) ? $payload['end_at'] : null;
        
        if ($start_at && $end_at && strtotime($end_at) <= strtotime($start_at)) {
            throw new Exception("Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.");
        }
    }

    /**
     * Admin create banner.
     */
    public function adminCreateBanner($payload, $adminId) {
        $this->validate($payload);
        
        $stmt = $this->db->prepare("
            INSERT INTO banners (
                placement, title, subtitle, image_url, link_url, button_text,
                is_active, sort_order, start_at, end_at, created_by_admin_id
            ) VALUES (
                :placement, :title, :subtitle, :image_url, :link_url, :button_text,
                :is_active, :sort_order, :start_at, :end_at, :created_by_admin_id
            )
        ");
        
        $stmt->execute([
            ':placement' => $payload['placement'],
            ':title' => !empty($payload['title']) ? $payload['title'] : null,
            ':subtitle' => !empty($payload['subtitle']) ? $payload['subtitle'] : null,
            ':image_url' => $payload['image_url'],
            ':link_url' => !empty($payload['link_url']) ? $payload['link_url'] : null,
            ':button_text' => !empty($payload['button_text']) ? $payload['button_text'] : null,
            ':is_active' => isset($payload['is_active']) ? (int)$payload['is_active'] : 1,
            ':sort_order' => isset($payload['sort_order']) ? (int)$payload['sort_order'] : 0,
            ':start_at' => !empty($payload['start_at']) ? $payload['start_at'] : null,
            ':end_at' => !empty($payload['end_at']) ? $payload['end_at'] : null,
            ':created_by_admin_id' => $adminId
        ]);
        
        return (int)$this->db->lastInsertId();
    }

    /**
     * Admin update banner.
     */
    public function adminUpdateBanner($id, $payload, $adminId) {
        $this->validate($payload);
        
        $stmt = $this->db->prepare("
            UPDATE banners
            SET placement = :placement,
                title = :title,
                subtitle = :subtitle,
                image_url = :image_url,
                link_url = :link_url,
                button_text = :button_text,
                is_active = :is_active,
                sort_order = :sort_order,
                start_at = :start_at,
                end_at = :end_at,
                updated_by_admin_id = :updated_by_admin_id,
                updated_at = NOW()
            WHERE id = :id AND deleted_at IS NULL
        ");
        
        return $stmt->execute([
            ':placement' => $payload['placement'],
            ':title' => !empty($payload['title']) ? $payload['title'] : null,
            ':subtitle' => !empty($payload['subtitle']) ? $payload['subtitle'] : null,
            ':image_url' => $payload['image_url'],
            ':link_url' => !empty($payload['link_url']) ? $payload['link_url'] : null,
            ':button_text' => !empty($payload['button_text']) ? $payload['button_text'] : null,
            ':is_active' => isset($payload['is_active']) ? (int)$payload['is_active'] : 1,
            ':sort_order' => isset($payload['sort_order']) ? (int)$payload['sort_order'] : 0,
            ':start_at' => !empty($payload['start_at']) ? $payload['start_at'] : null,
            ':end_at' => !empty($payload['end_at']) ? $payload['end_at'] : null,
            ':updated_by_admin_id' => $adminId,
            ':id' => (int)$id
        ]);
    }

    /**
     * Admin soft delete banner.
     */
    public function adminSoftDeleteBanner($id, $adminId) {
        $stmt = $this->db->prepare("
            UPDATE banners
            SET deleted_at = NOW(),
                updated_by_admin_id = :admin_id,
                is_active = 0
            WHERE id = :id AND deleted_at IS NULL
        ");
        return $stmt->execute([
            ':id' => (int)$id,
            ':admin_id' => $adminId
        ]);
    }

    /**
     * Increment click count.
     */
    public function incrementClickCount($id) {
        $stmt = $this->db->prepare("UPDATE banners SET click_count = click_count + 1 WHERE id = :id AND deleted_at IS NULL");
        return $stmt->execute([':id' => (int)$id]);
    }

    /**
     * Increment impression count.
     */
    public function incrementImpressionCount($id) {
        $stmt = $this->db->prepare("UPDATE banners SET impression_count = impression_count + 1 WHERE id = :id AND deleted_at IS NULL");
        return $stmt->execute([':id' => (int)$id]);
    }
}
