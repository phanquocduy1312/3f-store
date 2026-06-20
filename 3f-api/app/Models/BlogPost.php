<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

/**
 * BlogPost Model.
 */
class BlogPost {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    private function migrate() {
        $schemaPath = dirname(__DIR__, 2) . '/database/blog_posts_schema.sql';
        if (file_exists($schemaPath)) {
            $sql = file_get_contents($schemaPath);
            try {
                $this->db->exec($sql);
            } catch (\PDOException $e) {
                error_log("BlogPost migration warning: " . $e->getMessage());
            }
        }
    }

    /**
     * Get paginated active blog posts.
     */
    public function getPaginated($page = 1, $limit = 10, $q = '') {
        $page = max(1, (int)$page);
        $limit = min(100, max(1, (int)$limit));
        $offset = ($page - 1) * $limit;

        $where = ["deleted_at IS NULL"];
        $params = [];

        if (!empty($q)) {
            $where[] = "(title LIKE :q OR summary LIKE :q OR content LIKE :q)";
            $params[':q'] = "%$q%";
        }

        $whereSql = implode(' AND ', $where);

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM blog_posts WHERE $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get items
        $sql = "
            SELECT id, title, slug, summary, thumbnail_url, author, published_at, created_at
            FROM blog_posts
            WHERE $whereSql
            ORDER BY published_at DESC, created_at DESC
            LIMIT " . (int)$limit . " OFFSET " . (int)$offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit)
        ];
    }

    /**
     * Get detail of a blog post by slug.
     */
    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM blog_posts WHERE slug = :slug AND deleted_at IS NULL LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Upsert a blog post.
     */
    public function upsert($data) {
        $sql = "
            INSERT INTO blog_posts (title, slug, summary, content, thumbnail_url, author, published_at)
            VALUES (:title, :slug, :summary, :content, :thumbnail_url, :author, :published_at)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                summary = VALUES(summary),
                content = VALUES(content),
                thumbnail_url = VALUES(thumbnail_url),
                author = VALUES(author),
                published_at = VALUES(published_at),
                updated_at = NOW()
        ";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':summary' => $data['summary'] ?? null,
            ':content' => $data['content'],
            ':thumbnail_url' => $data['thumbnail_url'] ?? null,
            ':author' => $data['author'] ?? 'Admin',
            ':published_at' => $data['published_at'] ?? null,
        ]);
    }
}
