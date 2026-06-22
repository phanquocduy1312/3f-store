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

        // Add SEO and view tracking columns to existing database dynamically
        $columns = [
            'seo_title' => "ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255) NULL AFTER title",
            'seo_description' => "ALTER TABLE blog_posts ADD COLUMN seo_description TEXT NULL AFTER summary",
            'seo_keywords' => "ALTER TABLE blog_posts ADD COLUMN seo_keywords VARCHAR(255) NULL AFTER author",
            'view_count' => "ALTER TABLE blog_posts ADD COLUMN view_count INT DEFAULT 0 AFTER published_at",
            'thumbnail_alt' => "ALTER TABLE blog_posts ADD COLUMN thumbnail_alt VARCHAR(255) NULL AFTER thumbnail_url",
            'status' => "ALTER TABLE blog_posts ADD COLUMN status VARCHAR(50) DEFAULT 'published' AFTER author",
            'seo_score' => "ALTER TABLE blog_posts ADD COLUMN seo_score INT DEFAULT 0 AFTER view_count",
            'category' => "ALTER TABLE blog_posts ADD COLUMN category VARCHAR(100) NULL AFTER author",
            'category_slug' => "ALTER TABLE blog_posts ADD COLUMN category_slug VARCHAR(150) NULL AFTER category",
            'toc_enabled' => "ALTER TABLE blog_posts ADD COLUMN toc_enabled TINYINT(1) DEFAULT 1 AFTER view_count",
            'toc_title' => "ALTER TABLE blog_posts ADD COLUMN toc_title VARCHAR(100) DEFAULT 'Mục lục bài viết' AFTER toc_enabled",
            'deleted_at' => "ALTER TABLE blog_posts ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at"
        ];

        foreach ($columns as $col => $alterSql) {
            try {
                $this->db->query("SELECT $col FROM blog_posts LIMIT 1");
            } catch (\PDOException $e) {
                try {
                    $this->db->exec($alterSql);
                } catch (\PDOException $ex) {
                    error_log("BlogPost alter error ($col): " . $ex->getMessage());
                }
            }
        }
    }

    /**
     * Get paginated active blog posts.
     */
    public function getPaginated($page = 1, $limit = 10, $q = '', $isAdmin = false, $category = '', $sort = '') {
        $page = max(1, (int)$page);
        $limit = min(100, max(1, (int)$limit));
        $offset = ($page - 1) * $limit;

        $where = ["deleted_at IS NULL"];
        $params = [];

        if (!$isAdmin) {
            $where[] = "status = 'published'";
            $where[] = "published_at <= NOW()";
        }

        if (!empty($q)) {
            $where[] = "(title LIKE :q OR summary LIKE :q OR content LIKE :q OR seo_keywords LIKE :q)";
            $params[':q'] = "%$q%";
        }

        if (!empty($category)) {
            $where[] = "(category = :category OR category_slug = :category)";
            $params[':category'] = $category;
        }

        $whereSql = implode(' AND ', $where);

        // Count total
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM blog_posts WHERE $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Determine sort order
        $orderSql = "published_at DESC, created_at DESC"; // Default for public
        if ($isAdmin) {
            $orderSql = "COALESCE(updated_at, created_at) DESC, created_at DESC, id DESC"; // Default for admin
        }

        if ($sort === "updated_at") {
            $orderSql = "COALESCE(updated_at, created_at) DESC, created_at DESC, id DESC";
        } elseif ($sort === "published_at") {
            $orderSql = "published_at DESC, created_at DESC, id DESC";
        } elseif ($sort === "views") {
            $orderSql = "view_count DESC, id DESC";
        } elseif ($sort === "seo_score") {
            $orderSql = "seo_score ASC, id DESC";
        }

        // Get items
        $sql = "
            SELECT id, title, seo_title, slug, summary, seo_description, thumbnail_url, thumbnail_alt, author, status, category, category_slug, toc_enabled, toc_title, seo_keywords, published_at, view_count, seo_score, created_at, updated_at
            FROM blog_posts
            WHERE $whereSql
            ORDER BY $orderSql
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
     * Get detail of a blog post by ID.
     */
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM blog_posts WHERE id = :id AND deleted_at IS NULL LIMIT 1");
        $stmt->execute([':id' => (int)$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }


    /**
     * Create a new blog post.
     */
    public function create($data) {
        $sql = "
            INSERT INTO blog_posts (title, seo_title, slug, summary, seo_description, content, thumbnail_url, thumbnail_alt, author, status, category, category_slug, toc_enabled, toc_title, seo_keywords, published_at, seo_score, created_at, updated_at)
            VALUES (:title, :seo_title, :slug, :summary, :seo_description, :content, :thumbnail_url, :thumbnail_alt, :author, :status, :category, :category_slug, :toc_enabled, :toc_title, :seo_keywords, :published_at, :seo_score, NOW(), NOW())
        ";
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([
            ':title' => $data['title'],
            ':seo_title' => $data['seo_title'] ?? null,
            ':slug' => $data['slug'],
            ':summary' => $data['summary'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':content' => $data['content'],
            ':thumbnail_url' => $data['thumbnail_url'] ?? null,
            ':thumbnail_alt' => $data['thumbnail_alt'] ?? null,
            ':author' => $data['author'] ?? 'Admin',
            ':status' => $data['status'] ?? 'published',
            ':category' => $data['category'] ?? null,
            ':category_slug' => $data['category_slug'] ?? null,
            ':toc_enabled' => isset($data['toc_enabled']) ? (int)$data['toc_enabled'] : 1,
            ':toc_title' => $data['toc_title'] ?? 'Mục lục bài viết',
            ':seo_keywords' => $data['seo_keywords'] ?? null,
            ':published_at' => $data['published_at'] ?? date('Y-m-d H:i:s'),
            ':seo_score' => (int)($data['seo_score'] ?? 0)
        ]);
        return $success ? $this->db->lastInsertId() : false;
    }

    /**
     * Update an existing blog post.
     */
    public function update($id, $data) {
        $sql = "
            UPDATE blog_posts 
            SET title = :title,
                seo_title = :seo_title,
                slug = :slug,
                summary = :summary,
                seo_description = :seo_description,
                content = :content,
                thumbnail_url = :thumbnail_url,
                thumbnail_alt = :thumbnail_alt,
                author = :author,
                status = :status,
                category = :category,
                category_slug = :category_slug,
                toc_enabled = :toc_enabled,
                toc_title = :toc_title,
                seo_keywords = :seo_keywords,
                published_at = :published_at,
                seo_score = :seo_score,
                updated_at = NOW()
            WHERE id = :id AND deleted_at IS NULL
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => (int)$id,
            ':title' => $data['title'],
            ':seo_title' => $data['seo_title'] ?? null,
            ':slug' => $data['slug'],
            ':summary' => $data['summary'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':content' => $data['content'],
            ':thumbnail_url' => $data['thumbnail_url'] ?? null,
            ':thumbnail_alt' => $data['thumbnail_alt'] ?? null,
            ':author' => $data['author'] ?? 'Admin',
            ':status' => $data['status'] ?? 'published',
            ':category' => $data['category'] ?? null,
            ':category_slug' => $data['category_slug'] ?? null,
            ':toc_enabled' => isset($data['toc_enabled']) ? (int)$data['toc_enabled'] : 1,
            ':toc_title' => $data['toc_title'] ?? 'Mục lục bài viết',
            ':seo_keywords' => $data['seo_keywords'] ?? null,
            ':published_at' => $data['published_at'] ?? null,
            ':seo_score' => (int)($data['seo_score'] ?? 0)
        ]);
    }

    /**
     * Delete (soft-delete) a blog post.
     */
    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE blog_posts SET deleted_at = NOW() WHERE id = :id");
        return $stmt->execute([':id' => (int)$id]);
    }

    /**
     * Increment view count of a post.
     */
    public function incrementViews($slug) {
        $stmt = $this->db->prepare("UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = :slug AND deleted_at IS NULL");
        return $stmt->execute([':slug' => $slug]);
    }

    /**
     * Upsert a blog post.
     */
    public function upsert($data) {
        $sql = "
            INSERT INTO blog_posts (title, seo_title, slug, summary, seo_description, content, thumbnail_url, thumbnail_alt, author, status, category, category_slug, toc_enabled, toc_title, seo_keywords, published_at, seo_score)
            VALUES (:title, :seo_title, :slug, :summary, :seo_description, :content, :thumbnail_url, :thumbnail_alt, :author, :status, :category, :category_slug, :toc_enabled, :toc_title, :seo_keywords, :published_at, :seo_score)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                seo_title = VALUES(seo_title),
                summary = VALUES(summary),
                seo_description = VALUES(seo_description),
                content = VALUES(content),
                thumbnail_url = VALUES(thumbnail_url),
                thumbnail_alt = VALUES(thumbnail_alt),
                author = VALUES(author),
                status = VALUES(status),
                category = VALUES(category),
                category_slug = VALUES(category_slug),
                toc_enabled = VALUES(toc_enabled),
                toc_title = VALUES(toc_title),
                seo_keywords = VALUES(seo_keywords),
                published_at = VALUES(published_at),
                seo_score = VALUES(seo_score),
                updated_at = NOW()
        ";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':title' => $data['title'],
            ':seo_title' => $data['seo_title'] ?? null,
            ':slug' => $data['slug'],
            ':summary' => $data['summary'] ?? null,
            ':seo_description' => $data['seo_description'] ?? null,
            ':content' => $data['content'],
            ':thumbnail_url' => $data['thumbnail_url'] ?? null,
            ':thumbnail_alt' => $data['thumbnail_alt'] ?? null,
            ':author' => $data['author'] ?? 'Admin',
            ':status' => $data['status'] ?? 'published',
            ':category' => $data['category'] ?? null,
            ':category_slug' => $data['category_slug'] ?? null,
            ':toc_enabled' => isset($data['toc_enabled']) ? (int)$data['toc_enabled'] : 1,
            ':toc_title' => $data['toc_title'] ?? 'Mục lục bài viết',
            ':seo_keywords' => $data['seo_keywords'] ?? null,
            ':published_at' => $data['published_at'] ?? null,
            ':seo_score' => (int)($data['seo_score'] ?? 0)
        ]);
    }
}

