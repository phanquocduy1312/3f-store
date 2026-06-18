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
        
        $countSql = "
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE {$where}
        ";
        $stmt = $this->db->prepare($countSql);
        $stmt->execute($params);
        $total = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        // Build sort after count query to avoid adding startsWith/contains parameters to count query
        $sort = $this->buildSort($filters['sort'] ?? 'newest', $filters['q'] ?? null, $params);

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(60, max(1, (int)($filters['limit'] ?? 24)));
        $offset = ($page - 1) * $limit;

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

        if (isset($filters['q']) && $filters['q'] !== '') {
            $q = trim((string)$filters['q']);
            $q = preg_replace('/\s+/', ' ', $q);
            if (mb_strlen($q, 'UTF-8') >= 2) {
                $where .= " AND (
                    p.name LIKE :q1 
                    OR p.brand LIKE :q2 
                    OR p.description LIKE :q3 
                    OR p.slug LIKE :q4 
                    OR EXISTS (
                        SELECT 1 FROM product_variants pv 
                        WHERE pv.product_id = p.id 
                        AND pv.is_active = 1
                        AND (
                            pv.sku LIKE :q5 
                            OR pv.variant_name LIKE :q6
                        )
                    )
                )";
                $qVal = '%' . $q . '%';
                $params[':q1'] = $qVal;
                $params[':q2'] = $qVal;
                $params[':q3'] = $qVal;
                $params[':q4'] = $qVal;
                $params[':q5'] = $qVal;
                $params[':q6'] = $qVal;
            }
        }

        if (isset($filters['category']) && $filters['category'] !== '') {
            $where .= " AND (c.slug = :category OR c.name = :category OR p.product_type = :category)";
            $params[':category'] = trim($filters['category']);
        }

        if (isset($filters['categorySlug']) && $filters['categorySlug'] !== '') {
            $where .= " AND c.slug = :category_slug";
            $params[':category_slug'] = trim($filters['categorySlug']);
        }

        if (isset($filters['brand']) && $filters['brand'] !== '') {
            $where .= " AND p.brand = :brand";
            $params[':brand'] = trim($filters['brand']);
        }

        if (isset($filters['petType']) && $filters['petType'] !== '') {
            $petType = trim($filters['petType']);
            if ($petType === 'cat') {
                $where .= " AND p.pet_type IN ('cat', 'both')";
            } elseif ($petType === 'dog') {
                $where .= " AND p.pet_type IN ('dog', 'both')";
            } elseif ($petType === 'both') {
                $where .= " AND p.pet_type = 'both'";
            } else {
                $where .= " AND p.pet_type = :pet_type";
                $params[':pet_type'] = $petType;
            }
        }

        if (isset($filters['productType']) && $filters['productType'] !== '') {
            $where .= " AND p.product_type = :product_type";
            $params[':product_type'] = trim($filters['productType']);
        }

        if (isset($filters['minPrice']) && $filters['minPrice'] !== null && $filters['minPrice'] !== '') {
            $where .= " AND p.min_price >= :min_price";
            $params[':min_price'] = (float)$filters['minPrice'];
        }

        if (isset($filters['maxPrice']) && $filters['maxPrice'] !== null && $filters['maxPrice'] !== '') {
            $where .= " AND p.min_price <= :max_price";
            $params[':max_price'] = (float)$filters['maxPrice'];
        }

        return $where;
    }

    private function buildSort($sort, $q = null, &$params = []) {
        if ($q !== null && $q !== '') {
            $qClean = trim((string)$q);
            $qClean = preg_replace('/\s+/', ' ', $qClean);
            if (mb_strlen($qClean, 'UTF-8') >= 2 && !in_array($sort, ['price_asc', 'price_desc', 'popular'], true)) {
                $params[':startsWith'] = $qClean . '%';
                $params[':contains1'] = '%' . $qClean . '%';
                $params[':contains2'] = '%' . $qClean . '%';
                return "ORDER BY
                    CASE
                        WHEN p.name LIKE :startsWith THEN 1
                        WHEN p.name LIKE :contains1 THEN 2
                        WHEN p.brand LIKE :contains2 THEN 3
                        ELSE 4
                    END,
                    p.sold_count DESC,
                    p.id DESC";
            }
        }

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

    public function listProductFilters() {
        // 1. Categories (only counts active products in active categories)
        $catSql = "
            SELECT c.slug, c.name, COUNT(p.id) AS count
            FROM product_categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
            WHERE c.is_active = 1
            GROUP BY c.id, c.slug, c.name
            ORDER BY c.sort_order ASC
        ";
        $categories = $this->db->query($catSql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($categories as &$c) {
            $c['count'] = (int)$c['count'];
        }

        // 2. Pet Types (calculated suitabilities)
        $petSql = "
            SELECT 
                SUM(CASE WHEN pet_type IN ('cat', 'both') THEN 1 ELSE 0 END) as cat_count,
                SUM(CASE WHEN pet_type IN ('dog', 'both') THEN 1 ELSE 0 END) as dog_count,
                SUM(CASE WHEN pet_type = 'both' THEN 1 ELSE 0 END) as both_count
            FROM products 
            WHERE is_active = 1
        ";
        $petRow = $this->db->query($petSql)->fetch(PDO::FETCH_ASSOC);
        $petTypes = [
            [
                'value' => 'cat',
                'label' => 'Cho mèo',
                'count' => (int)($petRow['cat_count'] ?? 0)
            ],
            [
                'value' => 'dog',
                'label' => 'Cho chó',
                'count' => (int)($petRow['dog_count'] ?? 0)
            ],
            [
                'value' => 'both',
                'label' => 'Chó & mèo',
                'count' => (int)($petRow['both_count'] ?? 0)
            ]
        ];

        // 3. Product Types
        $typeSql = "
            SELECT product_type, COUNT(*) as count
            FROM products
            WHERE is_active = 1 AND product_type IS NOT NULL AND product_type != ''
            GROUP BY product_type
            ORDER BY count DESC
        ";
        $typesRows = $this->db->query($typeSql)->fetchAll(PDO::FETCH_ASSOC);
        $productTypeLabels = [
            'dry_food' => 'Thức ăn hạt',
            'wet_food' => 'Pate / thức ăn ướt',
            'treat' => 'Snack / thưởng',
            'litter' => 'Cát vệ sinh',
            'supplement' => 'Sữa & dinh dưỡng',
            'accessory' => 'Phụ kiện',
            'hygiene' => 'Chăm sóc / vệ sinh',
            'other' => 'Khác'
        ];
        $productTypes = [];
        foreach ($typesRows as $row) {
            $val = $row['product_type'];
            $productTypes[] = [
                'value' => $val,
                'label' => $productTypeLabels[$val] ?? ucfirst(str_replace('_', ' ', $val)),
                'count' => (int)$row['count']
            ];
        }

        // 4. Brands
        $brandSql = "
            SELECT brand, COUNT(*) as count
            FROM products
            WHERE is_active = 1 AND brand IS NOT NULL AND brand != ''
            GROUP BY brand
            ORDER BY count DESC, brand ASC
        ";
        $brandRows = $this->db->query($brandSql)->fetchAll(PDO::FETCH_ASSOC);
        $brands = [];
        foreach ($brandRows as $row) {
            $brands[] = [
                'value' => $row['brand'],
                'label' => $row['brand'],
                'count' => (int)$row['count']
            ];
        }

        // 5. Price Range
        $priceSql = "
            SELECT MIN(min_price) as min_price, MAX(max_price) as max_price
            FROM products
            WHERE is_active = 1
        ";
        $priceRow = $this->db->query($priceSql)->fetch(PDO::FETCH_ASSOC);

        return [
            'categories' => $categories,
            'petTypes' => $petTypes,
            'productTypes' => $productTypes,
            'brands' => $brands,
            'priceRange' => [
                'min' => $priceRow['min_price'] !== null ? (float)$priceRow['min_price'] : 0,
                'max' => $priceRow['max_price'] !== null ? (float)$priceRow['max_price'] : 0
            ]
        ];
    }
}
