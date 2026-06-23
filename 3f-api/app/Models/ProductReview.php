<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class ProductReview {
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
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS product_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                customer_id INT NOT NULL,
                order_id INT NOT NULL,
                order_item_id INT NOT NULL,
                rating TINYINT NOT NULL,
                content TEXT NULL,
                images_json TEXT NULL,
                is_verified_purchase TINYINT(1) NOT NULL DEFAULT 1,
                status VARCHAR(30) NOT NULL DEFAULT 'published',
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_customer_order_item_review (customer_id, order_item_id),
                INDEX idx_product_reviews_product_status (product_id, status),
                INDEX idx_product_reviews_customer (customer_id),
                INDEX idx_product_reviews_order (order_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    public function listForProduct($productId, $filters = []) {
        $productId = (int)$productId;
        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(50, max(1, (int)($filters['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        $where = ["r.product_id = :product_id", "r.status = 'published'"];
        $params = [':product_id' => $productId];

        if (!empty($filters['rating'])) {
            $where[] = "r.rating = :rating";
            $params[':rating'] = max(1, min(5, (int)$filters['rating']));
        }
        if (!empty($filters['hasImages'])) {
            $where[] = "r.images_json IS NOT NULL AND r.images_json <> '' AND r.images_json <> '[]'";
        }
        if (!empty($filters['verifiedOnly'])) {
            $where[] = "r.is_verified_purchase = 1";
        }

        $whereSql = implode(' AND ', $where);

        $stmtSummary = $this->db->prepare("
            SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS review_count
            FROM product_reviews
            WHERE product_id = :product_id AND status = 'published'
        ");
        $stmtSummary->execute([':product_id' => $productId]);
        $summary = $stmtSummary->fetch(PDO::FETCH_ASSOC) ?: ['average_rating' => 0, 'review_count' => 0];

        $stmtCount = $this->db->prepare("SELECT COUNT(*) FROM product_reviews r WHERE {$whereSql}");
        $stmtCount->execute($params);
        $total = (int)$stmtCount->fetchColumn();

        $sql = "
            SELECT
                r.*,
                c.full_name,
                c.name,
                o.order_code
            FROM product_reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN orders o ON o.id = r.order_id
            WHERE {$whereSql}
            ORDER BY r.created_at DESC, r.id DESC
            LIMIT :limit OFFSET :offset
        ";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'items' => array_map([$this, 'mapReview'], $stmt->fetchAll(PDO::FETCH_ASSOC)),
            'summary' => [
                'averageRating' => round((float)($summary['average_rating'] ?? 0), 2),
                'reviewCount' => (int)($summary['review_count'] ?? 0),
            ],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => max(1, (int)ceil($total / $limit)),
            ],
        ];
    }

    public function getEligibility($productId, $customerId) {
        $productId = (int)$productId;
        $customerId = (int)$customerId;

        $stmt = $this->db->prepare("
            SELECT
                oi.id AS order_item_id,
                o.id AS order_id,
                o.order_code,
                o.completed_at,
                r.id AS review_id
            FROM orders o
            INNER JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN product_reviews r ON r.order_item_id = oi.id AND r.customer_id = o.customer_id
            WHERE o.customer_id = :customer_id
              AND o.order_status = 'completed'
              AND oi.product_id = :product_id
            ORDER BY COALESCE(o.completed_at, o.updated_at, o.created_at) DESC, oi.id DESC
        ");
        $stmt->execute([':customer_id' => $customerId, ':product_id' => $productId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$rows) {
            return [
                'eligible' => false,
                'reason' => 'Bạn chỉ có thể đánh giá khi đã mua sản phẩm và đơn hàng đã hoàn tất.',
                'completedPurchaseCount' => 0,
                'alreadyReviewed' => false,
            ];
        }

        foreach ($rows as $row) {
            if (empty($row['review_id'])) {
                return [
                    'eligible' => true,
                    'reason' => null,
                    'completedPurchaseCount' => count($rows),
                    'alreadyReviewed' => false,
                    'orderId' => (int)$row['order_id'],
                    'orderItemId' => (int)$row['order_item_id'],
                    'orderCode' => $row['order_code'],
                ];
            }
        }

        return [
            'eligible' => false,
            'reason' => 'Bạn đã đánh giá sản phẩm này cho các đơn hàng hoàn tất.',
            'completedPurchaseCount' => count($rows),
            'alreadyReviewed' => true,
        ];
    }

    public function create($productId, $customerId, $payload) {
        $productId = (int)$productId;
        $customerId = (int)$customerId;
        $rating = max(1, min(5, (int)($payload['rating'] ?? 0)));
        $content = trim((string)($payload['content'] ?? ''));
        $orderItemId = isset($payload['orderItemId']) ? (int)$payload['orderItemId'] : 0;

        if ($rating < 1 || $rating > 5) {
            throw new \Exception('Vui lòng chọn số sao từ 1 đến 5.', 400);
        }
        $contentLength = function_exists('mb_strlen') ? mb_strlen($content, 'UTF-8') : strlen($content);
        if ($contentLength < 10) {
            throw new \Exception('Nội dung đánh giá cần ít nhất 10 ký tự.', 400);
        }

        $eligibility = $this->getEligibility($productId, $customerId);
        if (empty($eligibility['eligible'])) {
            throw new \Exception($eligibility['reason'] ?: 'Bạn chưa đủ điều kiện đánh giá sản phẩm này.', 403);
        }

        if ($orderItemId > 0 && $orderItemId !== (int)$eligibility['orderItemId']) {
            throw new \Exception('Đơn hàng không hợp lệ để đánh giá sản phẩm này.', 403);
        }

        $images = [];
        if (isset($payload['images']) && is_array($payload['images'])) {
            foreach ($payload['images'] as $image) {
                $image = trim((string)$image);
                if ($image !== '' && count($images) < 5) {
                    $images[] = $image;
                }
            }
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO product_reviews (
                    product_id, customer_id, order_id, order_item_id, rating, content, images_json, is_verified_purchase, status
                ) VALUES (
                    :product_id, :customer_id, :order_id, :order_item_id, :rating, :content, :images_json, 1, 'published'
                )
            ");
            $stmt->execute([
                ':product_id' => $productId,
                ':customer_id' => $customerId,
                ':order_id' => (int)$eligibility['orderId'],
                ':order_item_id' => (int)$eligibility['orderItemId'],
                ':rating' => $rating,
                ':content' => $content,
                ':images_json' => json_encode($images, JSON_UNESCAPED_UNICODE),
            ]);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new \Exception('Bạn đã đánh giá sản phẩm này cho đơn hàng đã chọn.', 409);
            }
            throw $e;
        }

        $reviewId = (int)$this->db->lastInsertId();
        $this->refreshProductStats($productId);
        return $this->findById($reviewId);
    }

    public function refreshProductStats($productId) {
        $stmt = $this->db->prepare("
            SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS review_count
            FROM product_reviews
            WHERE product_id = :product_id AND status = 'published'
        ");
        $stmt->execute([':product_id' => (int)$productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $update = $this->db->prepare("
            UPDATE products
            SET rating_average = :average_rating, review_count = :review_count, updated_at = NOW()
            WHERE id = :product_id
        ");
        $update->execute([
            ':average_rating' => round((float)($row['average_rating'] ?? 0), 2),
            ':review_count' => (int)($row['review_count'] ?? 0),
            ':product_id' => (int)$productId,
        ]);
    }

    public function adminList($filters = []) {
        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = ["1=1"];
        $params = [];

        $status = trim((string)($filters['status'] ?? 'all'));
        if ($status !== '' && $status !== 'all') {
            $where[] = "r.status = :status";
            $params[':status'] = $status;
        }

        $rating = (int)($filters['rating'] ?? 0);
        if ($rating >= 1 && $rating <= 5) {
            $where[] = "r.rating = :rating";
            $params[':rating'] = $rating;
        }

        $verified = trim((string)($filters['verified'] ?? 'all'));
        if ($verified === 'yes') {
            $where[] = "r.is_verified_purchase = 1";
        } elseif ($verified === 'no') {
            $where[] = "r.is_verified_purchase = 0";
        }

        $hasImages = trim((string)($filters['hasImages'] ?? 'all'));
        if ($hasImages === 'yes') {
            $where[] = "r.images_json IS NOT NULL AND r.images_json <> '' AND r.images_json <> '[]'";
        } elseif ($hasImages === 'no') {
            $where[] = "(r.images_json IS NULL OR r.images_json = '' OR r.images_json = '[]')";
        }

        $q = trim((string)($filters['q'] ?? ''));
        if ($q !== '') {
            $where[] = "(
                r.content LIKE :q
                OR p.name LIKE :q
                OR p.slug LIKE :q
                OR c.full_name LIKE :q
                OR c.name LIKE :q
                OR c.phone LIKE :q
                OR c.email LIKE :q
                OR o.order_code LIKE :q
            )";
            $params[':q'] = '%' . $q . '%';
        }

        $whereSql = implode(' AND ', $where);
        $sort = trim((string)($filters['sort'] ?? 'newest'));
        $orderSql = "r.created_at DESC, r.id DESC";
        if ($sort === 'oldest') {
            $orderSql = "r.created_at ASC, r.id ASC";
        } elseif ($sort === 'rating_high') {
            $orderSql = "r.rating DESC, r.created_at DESC";
        } elseif ($sort === 'rating_low') {
            $orderSql = "r.rating ASC, r.created_at DESC";
        }

        $countSql = "
            SELECT COUNT(*)
            FROM product_reviews r
            LEFT JOIN products p ON p.id = r.product_id
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN orders o ON o.id = r.order_id
            WHERE {$whereSql}
        ";
        $stmtCount = $this->db->prepare($countSql);
        $stmtCount->execute($params);
        $total = (int)$stmtCount->fetchColumn();

        $sql = "
            SELECT
                r.*,
                c.full_name,
                c.name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.status AS customer_status,
                o.order_code,
                o.order_status,
                p.name AS product_name,
                p.slug AS product_slug,
                p.main_image_url AS product_image,
                p.rating_average AS product_rating_average,
                p.review_count AS product_review_count
            FROM product_reviews r
            LEFT JOIN products p ON p.id = r.product_id
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN orders o ON o.id = r.order_id
            WHERE {$whereSql}
            ORDER BY {$orderSql}
            LIMIT :limit OFFSET :offset
        ";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'items' => array_map([$this, 'mapReview'], $stmt->fetchAll(PDO::FETCH_ASSOC)),
            'stats' => $this->adminStats(),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => max(1, (int)ceil($total / $limit)),
            ],
        ];
    }

    public function adminStats() {
        $stmt = $this->db->query("
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
                SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) AS hidden,
                SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) AS flagged,
                SUM(CASE WHEN is_verified_purchase = 1 THEN 1 ELSE 0 END) AS verified,
                COALESCE(AVG(CASE WHEN status = 'published' THEN rating END), 0) AS average_rating
            FROM product_reviews
        ");
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        return [
            'total' => (int)($row['total'] ?? 0),
            'published' => (int)($row['published'] ?? 0),
            'hidden' => (int)($row['hidden'] ?? 0),
            'flagged' => (int)($row['flagged'] ?? 0),
            'verified' => (int)($row['verified'] ?? 0),
            'averageRating' => round((float)($row['average_rating'] ?? 0), 2),
        ];
    }

    public function adminFindById($id) {
        $stmt = $this->db->prepare("
            SELECT
                r.*,
                c.full_name,
                c.name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.status AS customer_status,
                o.order_code,
                o.order_status,
                p.name AS product_name,
                p.slug AS product_slug,
                p.main_image_url AS product_image,
                p.rating_average AS product_rating_average,
                p.review_count AS product_review_count
            FROM product_reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN orders o ON o.id = r.order_id
            LEFT JOIN products p ON p.id = r.product_id
            WHERE r.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => (int)$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->mapReview($row) : null;
    }

    public function adminUpdateStatus($id, $status) {
        $id = (int)$id;
        $allowed = ['published', 'hidden', 'flagged'];
        if (!in_array($status, $allowed, true)) {
            throw new \Exception('Trạng thái đánh giá không hợp lệ.', 400);
        }

        $review = $this->adminFindById($id);
        if (!$review) {
            throw new \Exception('Không tìm thấy đánh giá.', 404);
        }

        $stmt = $this->db->prepare("UPDATE product_reviews SET status = :status, updated_at = NOW() WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        $this->refreshProductStats((int)$review['productId']);

        return $this->adminFindById($id);
    }

    public function adminDelete($id) {
        $id = (int)$id;
        $review = $this->adminFindById($id);
        if (!$review) {
            throw new \Exception('Không tìm thấy đánh giá.', 404);
        }

        $stmt = $this->db->prepare("DELETE FROM product_reviews WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->refreshProductStats((int)$review['productId']);

        return true;
    }

    private function findById($id) {
        $stmt = $this->db->prepare("
            SELECT r.*, c.full_name, c.name, o.order_code
            FROM product_reviews r
            LEFT JOIN customers c ON c.id = r.customer_id
            LEFT JOIN orders o ON o.id = r.order_id
            WHERE r.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => (int)$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->mapReview($row) : null;
    }

    private function mapReview($row) {
        $name = trim((string)($row['full_name'] ?: ($row['name'] ?? 'Khách hàng 3F')));
        return [
            'id' => (int)$row['id'],
            'productId' => (int)$row['product_id'],
            'customerId' => (int)$row['customer_id'],
            'orderId' => (int)$row['order_id'],
            'orderItemId' => (int)$row['order_item_id'],
            'orderCode' => $row['order_code'] ?? null,
            'rating' => (int)$row['rating'],
            'content' => $row['content'],
            'images' => $this->decodeImages($row['images_json'] ?? ''),
            'verifiedPurchase' => (int)$row['is_verified_purchase'] === 1,
            'customerName' => $this->maskCustomerName($name),
            'customerRawName' => $name,
            'customerPhone' => $row['customer_phone'] ?? null,
            'customerEmail' => $row['customer_email'] ?? null,
            'customerStatus' => $row['customer_status'] ?? null,
            'status' => $row['status'] ?? 'published',
            'orderStatus' => $row['order_status'] ?? null,
            'productName' => $row['product_name'] ?? null,
            'productSlug' => $row['product_slug'] ?? null,
            'productImage' => $row['product_image'] ?? null,
            'productRatingAverage' => isset($row['product_rating_average']) ? (float)$row['product_rating_average'] : null,
            'productReviewCount' => isset($row['product_review_count']) ? (int)$row['product_review_count'] : null,
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }

    private function decodeImages($json) {
        $decoded = json_decode((string)$json, true);
        return is_array($decoded) ? array_values(array_filter($decoded, 'is_string')) : [];
    }

    private function maskCustomerName($name) {
        $name = trim($name);
        if ($name === '') return 'Khách hàng 3F';
        $parts = preg_split('/\s+/', $name);
        if (count($parts) <= 1) {
            return $this->firstChar($name) . '***';
        }
        $last = array_pop($parts);
        return implode(' ', $parts) . ' ' . $this->firstChar($last) . '.';
    }

    private function firstChar($value) {
        return function_exists('mb_substr') ? mb_substr($value, 0, 1, 'UTF-8') : substr($value, 0, 1);
    }
}
