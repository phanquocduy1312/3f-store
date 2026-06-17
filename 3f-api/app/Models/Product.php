<?php
namespace App\Models;

use App\Core\Database;
use PDO;

class Product {
    private $db;
    private static $migrated = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        if (!self::$migrated) {
            $this->migrate();
            self::$migrated = true;
        }
    }

    public function migrate() {
        $schemaPath = dirname(__DIR__, 2) . '/database/product_catalog_schema.sql';
        if (!file_exists($schemaPath)) {
            return;
        }

        $sql = file_get_contents($schemaPath);
        $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sql)));
        foreach ($statements as $statement) {
            if ($statement !== '') {
                $this->db->exec($statement);
            }
        }
    }

    public function listCategories($activeOnly = true) {
        $sql = "SELECT c.*, p.name AS parent_name FROM product_categories c LEFT JOIN product_categories p ON p.id = c.parent_id WHERE 1=1";
        if ($activeOnly) {
            $sql .= " AND c.is_active = 1";
        }
        $sql .= " ORDER BY c.sort_order ASC, c.name ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listProducts($filters = []) {
        $params = [];
        $where = $this->buildWhere($filters, $params);
        $sort = $this->buildSort($filters['sort'] ?? 'newest');
        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(60, max(1, (int)($filters['limit'] ?? 24)));
        $offset = ($page - 1) * $limit;

        $countSql = "
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE {$where}
        ";
        $stmt = $this->db->prepare($countSql);
        $stmt->execute($params);
        $total = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $sql = "
            SELECT
                p.*,
                c.name AS category_name,
                c.slug AS category_slug,
                (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS variant_count
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE {$where}
            {$sort}
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
            'items' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => (int)ceil($total / $limit)
            ]
        ];
    }

    public function getProductDetail($identifier, $field = 'slug') {
        $allowed = ['slug', 'id', 'source_product_id'];
        if (!in_array($field, $allowed, true)) {
            $field = 'slug';
        }

        $sql = "
            SELECT p.*, c.name AS category_name, c.slug AS category_slug
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE p.{$field} = :identifier
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':identifier' => $identifier]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            return null;
        }

        $product['images'] = $this->getImages((int)$product['id']);
        $product['variants'] = $this->getVariants((int)$product['id']);
        return $product;
    }

    public function getImages($productId) {
        $stmt = $this->db->prepare("
            SELECT *
            FROM product_images
            WHERE product_id = :product_id
            ORDER BY is_main DESC, sort_order ASC, id ASC
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVariants($productId) {
        $stmt = $this->db->prepare("
            SELECT *
            FROM product_variants
            WHERE product_id = :product_id AND is_active = 1
            ORDER BY id ASC
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveProduct($data) {
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        if ($id <= 0) {
            return false;
        }

        $allowed = [
            'name', 'short_description', 'description', 'brand', 'pet_type',
            'product_type', 'min_price', 'max_price', 'total_stock',
            'sold_count', 'rating_average', 'review_count', 'is_active',
            'is_featured'
        ];
        $mapped = $this->mapAdminPayload($data);
        $fields = [];
        $params = [':id' => $id];

        foreach ($mapped as $key => $value) {
            if (in_array($key, $allowed, true)) {
                $fields[] = "`{$key}` = :{$key}";
                $params[":{$key}"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function toggleActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE products SET is_active = :is_active WHERE id = :id");
        return $stmt->execute([
            ':id' => (int)$id,
            ':is_active' => (int)$isActive
        ]);
    }

    private function buildWhere($filters, &$params) {
        $where = "p.is_active = 1";

        if (!empty($filters['admin'])) {
            $where = "1=1";
        }

        if (!empty($filters['q'])) {
            $where .= " AND (p.name LIKE :q OR p.brand LIKE :q OR p.description LIKE :q)";
            $params[':q'] = '%' . trim($filters['q']) . '%';
        }

        if (!empty($filters['category'])) {
            $where .= " AND (c.slug = :category OR c.name = :category OR p.product_type = :category)";
            $params[':category'] = trim($filters['category']);
        }

        if (!empty($filters['petType'])) {
            $where .= " AND p.pet_type = :pet_type";
            $params[':pet_type'] = trim($filters['petType']);
        }

        if (!empty($filters['productType'])) {
            $where .= " AND p.product_type = :product_type";
            $params[':product_type'] = trim($filters['productType']);
        }

        if ($filters['minPrice'] !== null && $filters['minPrice'] !== '') {
            $where .= " AND p.min_price >= :min_price";
            $params[':min_price'] = (float)$filters['minPrice'];
        }

        if ($filters['maxPrice'] !== null && $filters['maxPrice'] !== '') {
            $where .= " AND p.min_price <= :max_price";
            $params[':max_price'] = (float)$filters['maxPrice'];
        }

        return $where;
    }

    private function buildSort($sort) {
        switch ($sort) {
            case 'price_asc':
                return "ORDER BY p.min_price ASC, p.id DESC";
            case 'price_desc':
                return "ORDER BY p.min_price DESC, p.id DESC";
            case 'popular':
                return "ORDER BY p.sold_count DESC, p.rating_average DESC, p.id DESC";
            case 'newest':
            default:
                return "ORDER BY p.created_at DESC, p.id DESC";
        }
    }

    private function mapAdminPayload($data) {
        $map = [
            'shortDescription' => 'short_description',
            'petType' => 'pet_type',
            'productType' => 'product_type',
            'minPrice' => 'min_price',
            'maxPrice' => 'max_price',
            'totalStock' => 'total_stock',
            'soldCount' => 'sold_count',
            'ratingAverage' => 'rating_average',
            'reviewCount' => 'review_count',
            'isActive' => 'is_active',
            'isFeatured' => 'is_featured'
        ];

        $mapped = [];
        foreach ($data as $key => $value) {
            $mapped[$map[$key] ?? $key] = $value;
        }
        return $mapped;
    }
}
