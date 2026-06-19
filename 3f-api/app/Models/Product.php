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

    public function getAdminCategories() {
        $sql = "
            SELECT 
                c.id, c.parent_id, c.name, c.slug, c.description, c.image_url, 
                c.sort_order, c.is_active, c.created_at, c.updated_at,
                p.name AS parent_name,
                (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count,
                (SELECT COUNT(*) FROM product_categories child WHERE child.parent_id = c.id) AS children_count
            FROM product_categories c
            LEFT JOIN product_categories p ON p.id = c.parent_id
            ORDER BY c.sort_order ASC, c.name ASC
        ";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function adminSaveCategory($data) {
        $id = !empty($data['id']) ? (int)$data['id'] : null;
        $parentId = !empty($data['parentId']) ? (int)$data['parentId'] : null;
        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $imageUrl = trim($data['imageUrl'] ?? '');
        $sortOrder = isset($data['sortOrder']) ? (int)$data['sortOrder'] : 0;
        
        if ($name === '') {
            throw new \Exception("Tên danh mục không được trống.", 400);
        }

        // Handle Slug
        $slug = trim($data['slug'] ?? '');
        if ($slug === '') {
            $slug = $this->slugify($name);
        } else {
            $slug = $this->slugify($slug);
        }

        // Ensure unique slug
        $baseSlug = $slug;
        $counter = 2;
        while (true) {
            $checkSql = "SELECT COUNT(*) FROM product_categories WHERE slug = :slug";
            $checkParams = [':slug' => $slug];
            if ($id) {
                $checkSql .= " AND id != :id";
                $checkParams[':id'] = $id;
            }
            $stmt = $this->db->prepare($checkSql);
            $stmt->execute($checkParams);
            if ($stmt->fetchColumn() == 0) {
                break;
            }
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        if ($id) {
            // Update
            $sql = "UPDATE product_categories 
                    SET parent_id = :parent_id, name = :name, slug = :slug, description = :description, 
                        image_url = :image_url, sort_order = :sort_order 
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':parent_id' => $parentId,
                ':name' => $name,
                ':slug' => $slug,
                ':description' => $description,
                ':image_url' => $imageUrl,
                ':sort_order' => $sortOrder,
                ':id' => $id
            ]);
            return $id;
        } else {
            // Insert
            $sql = "INSERT INTO product_categories (parent_id, name, slug, description, image_url, sort_order, is_active) 
                    VALUES (:parent_id, :name, :slug, :description, :image_url, :sort_order, 1)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':parent_id' => $parentId,
                ':name' => $name,
                ':slug' => $slug,
                ':description' => $description,
                ':image_url' => $imageUrl,
                ':sort_order' => $sortOrder
            ]);
            return $this->db->lastInsertId();
        }
    }

    public function adminToggleCategoryActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE product_categories SET is_active = :is_active WHERE id = :id");
        $stmt->execute([
            ':is_active' => $isActive ? 1 : 0,
            ':id' => $id
        ]);
        return true;
    }

    public function adminDeleteCategory($id) {
        // Check products
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM products WHERE category_id = :id");
        $stmt->execute([':id' => $id]);
        if ($stmt->fetchColumn() > 0) {
            throw new \Exception("Danh mục đang có sản phẩm, không thể xóa.", 400);
        }

        // Check child categories
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM product_categories WHERE parent_id = :id");
        $stmt->execute([':id' => $id]);
        if ($stmt->fetchColumn() > 0) {
            throw new \Exception("Danh mục đang có danh mục con, không thể xóa.", 400);
        }

        $stmt = $this->db->prepare("DELETE FROM product_categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return true;
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
                (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS variant_count,
                (SELECT MAX(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS max_original_price
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
            SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                (SELECT MAX(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1) AS max_original_price
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

    private function slugify($str) {
        $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/", 'a', $str);
        $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/", 'e', $str);
        $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/", 'i', $str);
        $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/", 'o', $str);
        $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/", 'u', $str);
        $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/", 'y', $str);
        $str = preg_replace("/(đ)/", 'd', $str);
        $str = preg_replace("/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/", 'a', $str);
        $str = preg_replace("/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/", 'e', $str);
        $str = preg_replace("/(Ì|Í|Ị|Ỉ|Ĩ)/", 'i', $str);
        $str = preg_replace("/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/", 'o', $str);
        $str = preg_replace("/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/", 'u', $str);
        $str = preg_replace("/(Ý|Ỳ|Ỵ|Ỷ|Ỹ)/", 'y', $str);
        $str = preg_replace("/(Đ)/", 'd', $str);
        
        $str = strtolower($str);
        $str = preg_replace('/[^a-z0-9\s_-]/', '', $str);
        $str = preg_replace('/[\s_-]+/', '-', $str);
        $str = trim($str, '-');
        
        if (strlen($str) > 130) {
            $str = substr($str, 0, 130);
            $str = trim($str, '-');
        }
        return $str;
    }

    private function sanitizeRichHtml($html) {
        $html = trim((string)($html ?? ''));
        if ($html === '') {
            return '';
        }

        $html = preg_replace('#<\s*(script|iframe)[^>]*>.*?<\s*/\s*\1\s*>#is', '', $html);
        $html = preg_replace('#<\s*(script|iframe)[^>]*\/?\s*>#is', '', $html);
        $html = preg_replace('/\s+on[a-z]+\s*=\s*(".*?"|\'.*?\'|[^\s>]+)/is', '', $html);
        $html = preg_replace('/\s+style\s*=\s*(".*?"|\'.*?\'|[^\s>]+)/is', '', $html);
        $html = preg_replace('/\s+(href|src)\s*=\s*("|\')?\s*(javascript|data):[^"\'\s>]*/is', '', $html);
        $html = preg_replace('/javascript\s*:/i', '', $html);

        return strip_tags($html, '<p><br><strong><b><em><i><u><s><h2><h3><ul><ol><li><blockquote><a><img><hr>');
    }

    public function getAdminProducts($filters = []) {
        $params = [];
        $where = "1=1";

        if (isset($filters['q']) && trim((string)$filters['q']) !== '') {
            $q = trim((string)$filters['q']);
            $where .= " AND (p.name LIKE :q1 OR p.brand LIKE :q2 OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.sku LIKE :q3))";
            $params[':q1'] = '%' . $q . '%';
            $params[':q2'] = '%' . $q . '%';
            $params[':q3'] = '%' . $q . '%';
        }

        if (isset($filters['category']) && trim((string)$filters['category']) !== '') {
            $cat = trim((string)$filters['category']);
            if (is_numeric($cat)) {
                $where .= " AND p.category_id = :category_id";
                $params[':category_id'] = (int)$cat;
            } else {
                $where .= " AND c.slug = :category_slug";
                $params[':category_slug'] = $cat;
            }
        }

        if (isset($filters['petType']) && trim((string)$filters['petType']) !== '') {
            $where .= " AND p.pet_type = :pet_type";
            $params[':pet_type'] = trim((string)$filters['petType']);
        }

        if (isset($filters['productType']) && trim((string)$filters['productType']) !== '') {
            $where .= " AND p.product_type = :product_type";
            $params[':product_type'] = trim((string)$filters['productType']);
        }

        if (isset($filters['isActive']) && trim((string)$filters['isActive']) !== '') {
            $where .= " AND p.is_active = :is_active";
            $params[':is_active'] = (int)$filters['isActive'];
        }

        if (isset($filters['stockStatus']) && trim((string)$filters['stockStatus']) !== '') {
            $status = trim((string)$filters['stockStatus']);
            if ($status === 'in_stock') {
                $where .= " AND p.total_stock > 0";
            } elseif ($status === 'low_stock') {
                $where .= " AND p.total_stock > 0 AND p.total_stock <= 10";
            } elseif ($status === 'out_of_stock') {
                $where .= " AND p.total_stock <= 0";
            }
        }

        $countSql = "
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE {$where}
        ";
        $stmt = $this->db->prepare($countSql);
        $stmt->execute($params);
        $total = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 24)));
        $offset = ($page - 1) * $limit;

        $sql = "
            SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                   (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count,
                   (SELECT MIN(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1 AND pv.original_price IS NOT NULL AND pv.original_price > pv.price) AS min_original_price,
                   (SELECT MAX(original_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = 1 AND pv.original_price IS NOT NULL AND pv.original_price > pv.price) AS max_original_price
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE {$where}
            ORDER BY p.updated_at DESC, p.id DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $stats = [
            'totalProducts' => (int)$this->db->query("SELECT COUNT(*) FROM products")->fetchColumn(),
            'activeProducts' => (int)$this->db->query("SELECT COUNT(*) FROM products WHERE is_active = 1")->fetchColumn(),
            'inactiveProducts' => (int)$this->db->query("SELECT COUNT(*) FROM products WHERE is_active = 0")->fetchColumn(),
            'outOfStockProducts' => (int)$this->db->query("SELECT COUNT(*) FROM products WHERE total_stock <= 0")->fetchColumn(),
            'lowStockProducts' => (int)$this->db->query("SELECT COUNT(*) FROM products WHERE total_stock > 0 AND total_stock <= 10")->fetchColumn(),
        ];

        return [
            'items' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'stats' => $stats,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => (int)ceil($total / $limit)
            ]
        ];
    }

    public function getAdminProductDetail($id) {
        $sql = "
            SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                (SELECT MAX(original_price) FROM product_variants pv WHERE pv.product_id = p.id) AS max_original_price
            FROM products p
            LEFT JOIN product_categories c ON c.id = p.category_id
            WHERE p.id = :id
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => (int)$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product) {
            return null;
        }

        $product['images'] = $this->getImages((int)$product['id']);
        
        $stmtVariants = $this->db->prepare("
            SELECT *
            FROM product_variants
            WHERE product_id = :product_id
            ORDER BY id ASC
        ");
        $stmtVariants->execute([':product_id' => (int)$product['id']]);
        $variants = $stmtVariants->fetchAll(PDO::FETCH_ASSOC);
        foreach ($variants as &$v) {
            $stmtCheckOrder = $this->db->prepare("SELECT COUNT(*) FROM order_items WHERE variant_id = :variant_id LIMIT 1");
            $stmtCheckOrder->execute([':variant_id' => (int)$v['id']]);
            $v['hasOrderHistory'] = ((int)$stmtCheckOrder->fetchColumn() > 0);
        }
        $product['variants'] = $variants;

        return $product;
    }

    public function saveProduct($data, $adminUserId = null) {
        $productId = isset($data['id']) ? (int)$data['id'] : 0;
        
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            throw new \Exception("Tên sản phẩm không được trống.", 400);
        }
        
        $categoryId = isset($data['categoryId']) && $data['categoryId'] !== '' ? (int)$data['categoryId'] : null;
        if (empty($categoryId)) {
            throw new \Exception("Danh mục không được trống.", 400);
        }

        $variants = $data['variants'] ?? [];
        if (!is_array($variants) || empty($variants)) {
            throw new \Exception("Sản phẩm phải có ít nhất 1 biến thể.", 400);
        }

        // Validate SKU uniqueness
        $payloadSkus = [];
        foreach ($variants as $v) {
            $vId = isset($v['id']) && $v['id'] !== '' ? (int)$v['id'] : 0;
            $vSku = trim($v['sku'] ?? '');
            if (empty($vSku)) {
                throw new \Exception("SKU của biến thể không được trống.", 400);
            }
            if (in_array($vSku, $payloadSkus, true)) {
                throw new \Exception("SKU đã tồn tại.", 400);
            }
            $payloadSkus[] = $vSku;

            // Check duplicate SKU in DB
            $checkSkuStmt = $this->db->prepare("SELECT id FROM product_variants WHERE sku = :sku AND is_active = 1");
            $checkSkuStmt->execute([':sku' => $vSku]);
            $existingSkuRows = $checkSkuStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($existingSkuRows as $exSku) {
                if ((int)$exSku['id'] !== $vId) {
                    throw new \Exception("SKU đã tồn tại.", 400);
                }
            }

            // Price & stock validations
            $price = (float)($v['price'] ?? 0);
            $originalPrice = isset($v['originalPrice']) && $v['originalPrice'] !== '' && $v['originalPrice'] !== null ? (float)$v['originalPrice'] : null;
            $stockQuantity = (int)($v['stockQuantity'] ?? 0);

            if ($price <= 0) {
                throw new \Exception("Giá bán phải lớn hơn 0.", 400);
            }
            if ($originalPrice !== null && $originalPrice < $price) {
                throw new \Exception("Giá gốc phải lớn hơn hoặc bằng giá bán.", 400);
            }
            if ($stockQuantity < 0) {
                throw new \Exception("Số lượng tồn kho không được âm.", 400);
            }
        }

        $description = $this->sanitizeRichHtml($data['description'] ?? '');
        $ingredients = $this->sanitizeRichHtml($data['ingredients'] ?? '');
        $feeding_guide = $this->sanitizeRichHtml($data['guide'] ?? '');
        if (strlen($description) > 200000) {
            throw new \Exception("Mô tả chi tiết quá dài.", 400);
        }

        try {
            $this->db->beginTransaction();

            // Slug logic
            $slug = trim($data['slug'] ?? '');
            if (empty($slug)) {
                $slug = $this->slugify($name);
            } else {
                $slug = $this->slugify($slug);
            }

            // Ensure unique slug
            $originalSlug = $slug;
            $counter = 2;
            while (true) {
                $stmt = $this->db->prepare("SELECT id FROM products WHERE slug = :slug AND id != :id");
                $stmt->execute([':slug' => $slug, ':id' => $productId]);
                if (!$stmt->fetch()) {
                    break;
                }
                $suffix = '-' . $counter;
                $maxLen = 180 - strlen($suffix);
                $slug = substr($originalSlug, 0, $maxLen) . $suffix;
                $counter++;
            }

            if ($productId <= 0) {
                // Insert product
                $stmt = $this->db->prepare("
                    INSERT INTO products (
                        source_platform, source_product_id, source_seller_id, source_product_url, 
                        category_id, name, slug, short_description, description, ingredients, feeding_guide, brand, 
                        pet_type, product_type, is_active, is_featured, is_imported
                    ) VALUES (
                        'manual', :source_product_id, NULL, NULL, 
                        :category_id, :name, :slug, :short_description, :description, :ingredients, :feeding_guide, :brand, 
                        :pet_type, :product_type, :is_active, :is_featured, 0
                    )
                ");
                $sourceProductId = 'p_' . bin2hex(random_bytes(8));
                $stmt->execute([
                    ':source_product_id' => $sourceProductId,
                    ':category_id' => $categoryId,
                    ':name' => $name,
                    ':slug' => $slug,
                    ':short_description' => $data['shortDescription'] ?? null,
                    ':description' => $description !== '' ? $description : null,
                    ':ingredients' => $ingredients !== '' ? $ingredients : null,
                    ':feeding_guide' => $feeding_guide !== '' ? $feeding_guide : null,
                    ':brand' => $data['brand'] ?? null,
                    ':pet_type' => $data['petType'] ?? 'both',
                    ':product_type' => $data['productType'] ?? 'other',
                    ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1,
                    ':is_featured' => isset($data['isFeatured']) ? (int)$data['isFeatured'] : 0,
                ]);
                $productId = (int)$this->db->lastInsertId();
            } else {
                // Update product
                $stmt = $this->db->prepare("
                    UPDATE products SET
                        category_id = :category_id,
                        name = :name,
                        slug = :slug,
                        short_description = :short_description,
                        description = :description,
                        ingredients = :ingredients,
                        feeding_guide = :feeding_guide,
                        brand = :brand,
                        pet_type = :pet_type,
                        product_type = :product_type,
                        is_active = :is_active,
                        is_featured = :is_featured
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':category_id' => $categoryId,
                    ':name' => $name,
                    ':slug' => $slug,
                    ':short_description' => $data['shortDescription'] ?? null,
                    ':description' => $description !== '' ? $description : null,
                    ':ingredients' => $ingredients !== '' ? $ingredients : null,
                    ':feeding_guide' => $feeding_guide !== '' ? $feeding_guide : null,
                    ':brand' => $data['brand'] ?? null,
                    ':pet_type' => $data['petType'] ?? 'both',
                    ':product_type' => $data['productType'] ?? 'other',
                    ':is_active' => isset($data['isActive']) ? (int)$data['isActive'] : 1,
                    ':is_featured' => isset($data['isFeatured']) ? (int)$data['isFeatured'] : 0,
                    ':id' => $productId
                ]);
            }

            // Sync variants
            $stmt = $this->db->prepare("SELECT id FROM product_variants WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $productId]);
            $existingVariantIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            foreach ($variants as $v) {
                $vId = isset($v['id']) && $v['id'] !== '' ? (int)$v['id'] : 0;
                $vSku = trim($v['sku']);
                $vName = $v['variantName'] ?? $v['name'] ?? $vSku;
                $option1Name = $v['option1Name'] ?? null;
                $option1Value = $v['option1Value'] ?? null;
                $option2Name = $v['option2Name'] ?? null;
                $option2Value = $v['option2Value'] ?? null;
                $option3Name = $v['option3Name'] ?? null;
                $option3Value = $v['option3Value'] ?? null;
                $price = (float)$v['price'];
                $originalPrice = isset($v['originalPrice']) && $v['originalPrice'] !== '' && $v['originalPrice'] !== null ? (float)$v['originalPrice'] : null;
                $stockQuantity = (int)$v['stockQuantity'];
                $vIsActive = isset($v['isActive']) ? (int)$v['isActive'] : 1;

                if ($vId > 0 && in_array($vId, $existingVariantIds, true)) {
                    // Get old status first to check if deactivated
                    $stmtOldActive = $this->db->prepare("SELECT is_active, sku FROM product_variants WHERE id = :id");
                    $stmtOldActive->execute([':id' => $vId]);
                    $oldVar = $stmtOldActive->fetch(PDO::FETCH_ASSOC);

                    // Update
                    $stmtUpdate = $this->db->prepare("
                        UPDATE product_variants SET
                            sku = :sku,
                            variant_name = :variant_name,
                            option_1_name = :option_1_name,
                            option_1_value = :option_1_value,
                            option_2_name = :option_2_name,
                            option_2_value = :option_2_value,
                            option_3_name = :option_3_name,
                            option_3_value = :option_3_value,
                            price = :price,
                            original_price = :original_price,
                            stock_quantity = :stock_quantity,
                            is_active = :is_active
                        WHERE id = :id
                    ");
                    $stmtUpdate->execute([
                        ':sku' => $vSku,
                        ':variant_name' => $vName,
                        ':option_1_name' => $option1Name,
                        ':option_1_value' => $option1Value,
                        ':option_2_name' => $option2Name,
                        ':option_2_value' => $option2Value,
                        ':option_3_name' => $option3Name,
                        ':option_3_value' => $option3Value,
                        ':price' => $price,
                        ':original_price' => $originalPrice,
                        ':stock_quantity' => $stockQuantity,
                        ':is_active' => $vIsActive,
                        ':id' => $vId
                    ]);

                    if ($oldVar && (int)$oldVar['is_active'] === 1 && $vIsActive === 0) {
                        AuditLog::write($adminUserId, 'product_variant_deactivate', 'product_variants', $vId, [
                            'productId' => $productId,
                            'sku' => $oldVar['sku'] ?? $vSku,
                            'reason' => 'payload_inactive'
                        ]);
                    }

                    $index = array_search($vId, $existingVariantIds, true);
                    if ($index !== false) {
                        unset($existingVariantIds[$index]);
                    }
                } else {
                    // Insert
                    $stmtGetSource = $this->db->prepare("SELECT source_product_id FROM products WHERE id = :id");
                    $stmtGetSource->execute([':id' => $productId]);
                    $sourceProductId = $stmtGetSource->fetchColumn();

                    $stmtInsert = $this->db->prepare("
                        INSERT INTO product_variants (
                            product_id, source_platform, source_product_id, source_sku_id,
                            sku, variant_name, option_1_name, option_1_value, option_2_name, option_2_value,
                            option_3_name, option_3_value, price, original_price, stock_quantity, is_active
                        ) VALUES (
                            :product_id, 'manual', :source_product_id, :source_sku_id,
                            :sku, :variant_name, :option_1_name, :option_1_value, :option_2_name, :option_2_value,
                            :option_3_name, :option_3_value, :price, :original_price, :stock_quantity, :is_active
                        )
                    ");
                    $sourceSkuId = 'pv_' . bin2hex(random_bytes(8));
                    $stmtInsert->execute([
                        ':product_id' => $productId,
                        ':source_product_id' => $sourceProductId,
                        ':source_sku_id' => $sourceSkuId,
                        ':sku' => $vSku,
                        ':variant_name' => $vName,
                        ':option_1_name' => $option1Name,
                        ':option_1_value' => $option1Value,
                        ':option_2_name' => $option2Name,
                        ':option_2_value' => $option2Value,
                        ':option_3_name' => $option3Name,
                        ':option_3_value' => $option3Value,
                        ':price' => $price,
                        ':original_price' => $originalPrice,
                        ':stock_quantity' => $stockQuantity,
                        ':is_active' => $vIsActive
                    ]);
                }
            }

            // Handle deleted variants (soft or hard delete)
            foreach ($existingVariantIds as $delId) {
                $stmtCheckOrder = $this->db->prepare("SELECT 1 FROM order_items WHERE variant_id = :variant_id LIMIT 1");
                $stmtCheckOrder->execute([':variant_id' => $delId]);
                if ($stmtCheckOrder->fetch()) {
                    // Soft delete: set is_active = 0
                    $stmtSoft = $this->db->prepare("UPDATE product_variants SET is_active = 0 WHERE id = :id");
                    $stmtSoft->execute([':id' => $delId]);

                    AuditLog::write($adminUserId, 'product_variant_deactivate', 'product_variants', $delId, [
                        'productId' => $productId,
                        'reason' => 'deleted_with_order_history'
                    ]);
                } else {
                    // Hard delete
                    $stmtHard = $this->db->prepare("DELETE FROM product_variants WHERE id = :id");
                    $stmtHard->execute([':id' => $delId]);

                    $stmtDelImg = $this->db->prepare("DELETE FROM product_images WHERE variant_id = :variant_id");
                    $stmtDelImg->execute([':variant_id' => $delId]);
                }
            }

            // Sync images
            $stmt = $this->db->prepare("SELECT id, image_url FROM product_images WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $productId]);
            $existingImages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $existingImageUrls = array_column($existingImages, 'image_url');

            $imagesPayload = $data['galleryImages'] ?? [];
            $hasPrimary = false;
            
            foreach ($imagesPayload as &$img) {
                if (!empty($img['isPrimary']) || !empty($img['isMain'])) {
                    if (!$hasPrimary) {
                        $img['is_main'] = 1;
                        $hasPrimary = true;
                    } else {
                        $img['is_main'] = 0;
                    }
                } else {
                    $img['is_main'] = 0;
                }
            }
            unset($img);

            $mainImageUrl = trim($data['mainImageUrl'] ?? '');
            if (!$hasPrimary && !empty($mainImageUrl)) {
                $found = false;
                foreach ($imagesPayload as &$img) {
                    $imgUrl = trim($img['url'] ?? $img['imageUrl'] ?? '');
                    if ($imgUrl === $mainImageUrl) {
                        $img['is_main'] = 1;
                        $found = true;
                        break;
                    }
                }
                unset($img);
                if (!$found) {
                    array_unshift($imagesPayload, [
                        'url' => $mainImageUrl,
                        'is_main' => 1,
                        'sortOrder' => 0
                    ]);
                    $hasPrimary = true;
                }
            }

            if (!$hasPrimary && !empty($imagesPayload)) {
                $imagesPayload[0]['is_main'] = 1;
            }

            // Write image update log
            AuditLog::write($adminUserId, 'product_image_update', 'products', $productId, [
                'imageCount' => count($imagesPayload)
            ]);

            $processedImageUrls = [];
            $primaryUrl = '';

            foreach ($imagesPayload as $img) {
                $imgUrl = trim($img['url'] ?? $img['imageUrl'] ?? '');
                if (empty($imgUrl)) continue;

                $isMain = !empty($img['is_main']) ? 1 : 0;
                if ($isMain === 1) {
                    $primaryUrl = $imgUrl;
                }
                $sortOrder = isset($img['sortOrder']) ? (int)$img['sortOrder'] : 0;

                // Check existing
                $stmt = $this->db->prepare("SELECT id FROM product_images WHERE product_id = :product_id AND image_url = :image_url LIMIT 1");
                $stmt->execute([':product_id' => $productId, ':image_url' => $imgUrl]);
                $existingImgId = $stmt->fetchColumn();

                if ($existingImgId) {
                    $stmtUpdate = $this->db->prepare("UPDATE product_images SET is_main = :is_main, sort_order = :sort_order WHERE id = :id");
                    $stmtUpdate->execute([':is_main' => $isMain, ':sort_order' => $sortOrder, ':id' => $existingImgId]);
                } else {
                    $stmtInsert = $this->db->prepare("
                        INSERT INTO product_images (product_id, variant_id, image_url, local_image_path, image_type, is_main, sort_order, source_platform)
                        VALUES (:product_id, NULL, :image_url, NULL, 'product', :is_main, :sort_order, 'manual')
                    ");
                    $stmtInsert->execute([':product_id' => $productId, ':image_url' => $imgUrl, ':is_main' => $isMain, ':sort_order' => $sortOrder]);
                }
                $processedImageUrls[] = $imgUrl;
            }

            foreach ($existingImages as $exImg) {
                if (!in_array($exImg['image_url'], $processedImageUrls, true)) {
                    $stmtDel = $this->db->prepare("DELETE FROM product_images WHERE id = :id");
                    $stmtDel->execute([':id' => $exImg['id']]);
                }
            }

            // Update product main image and json
            $stmtCount = $this->db->prepare("SELECT COUNT(*) FROM product_images WHERE product_id = :product_id");
            $stmtCount->execute([':product_id' => $productId]);
            $imgCount = (int)$stmtCount->fetchColumn();

            if (empty($primaryUrl) && !empty($processedImageUrls)) {
                $primaryUrl = $processedImageUrls[0];
            }

            $stmtUpdateProductImg = $this->db->prepare("
                UPDATE products SET 
                    main_image_url = :main_image_url, 
                    image_urls_json = :image_urls_json,
                    image_count = :image_count
                WHERE id = :id
            ");
            $stmtUpdateProductImg->execute([
                ':main_image_url' => !empty($primaryUrl) ? $primaryUrl : null,
                ':image_urls_json' => json_encode($processedImageUrls, JSON_UNESCAPED_SLASHES),
                ':image_count' => $imgCount,
                ':id' => $productId
            ]);

            // Recalculate aggregates based on ACTIVE variants (is_active = 1)
            $stmtAgg = $this->db->prepare("
                SELECT 
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    SUM(stock_quantity) as total_stock,
                    COUNT(*) as variant_count
                FROM product_variants
                WHERE product_id = :product_id AND is_active = 1
            ");
            $stmtAgg->execute([':product_id' => $productId]);
            $agg = $stmtAgg->fetch(PDO::FETCH_ASSOC);

            $minPrice = $agg['min_price'] !== null ? (float)$agg['min_price'] : 0.0;
            $maxPrice = $agg['max_price'] !== null ? (float)$agg['max_price'] : 0.0;
            $totalStock = $agg['total_stock'] !== null ? (int)$agg['total_stock'] : 0;
            $variantCount = (int)$agg['variant_count'];

            $stmtUpdateAgg = $this->db->prepare("
                UPDATE products SET
                    min_price = :min_price,
                    max_price = :max_price,
                    total_stock = :total_stock
                WHERE id = :id
            ");
            $stmtUpdateAgg->execute([
                ':min_price' => $minPrice,
                ':max_price' => $maxPrice,
                ':total_stock' => $totalStock,
                ':id' => $productId
            ]);

            $this->db->commit();
            return $productId;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function toggleActive($id, $isActive) {
        $stmt = $this->db->prepare("UPDATE products SET is_active = :is_active WHERE id = :id");
        return $stmt->execute([
            ':id' => (int)$id,
            ':is_active' => (int)$isActive
        ]);
    }

    public function adminToggleActive($productId, $isActive) {
        $stmt = $this->db->prepare("UPDATE products SET is_active = :is_active WHERE id = :id");
        $stmt->execute([
            ':is_active' => $isActive ? 1 : 0,
            ':id' => $productId
        ]);

        return ['success' => true];
    }

    /**
     * Delete product only if it has no orders
     */
    public function deleteProduct($productId) {
        // Check if there are any orders for this product
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = :product_id");
        $stmt->execute([':product_id' => $productId]);
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            throw new \Exception("Sản phẩm đã phát sinh đơn hàng, không thể xóa. Vui lòng ẩn sản phẩm thay vì xóa.", 400);
        }

        try {
            $this->db->beginTransaction();

            // Delete images
            $stmt = $this->db->prepare("DELETE FROM product_images WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $productId]);

            // Delete variants
            $stmt = $this->db->prepare("DELETE FROM product_variants WHERE product_id = :product_id");
            $stmt->execute([':product_id' => $productId]);

            // Delete product
            $stmt = $this->db->prepare("DELETE FROM products WHERE id = :product_id");
            $stmt->execute([':product_id' => $productId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
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
            SELECT c.id, c.parent_id, c.slug, c.name, COUNT(p.id) AS count
            FROM product_categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
            WHERE c.is_active = 1
            GROUP BY c.id, c.slug, c.name, c.parent_id
            ORDER BY c.sort_order ASC
        ";
        $categories = $this->db->query($catSql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($categories as &$c) {
            $c['count'] = (int)$c['count'];
            $c['id'] = (int)$c['id'];
            $c['parentId'] = $c['parent_id'] ? (int)$c['parent_id'] : null;
            unset($c['parent_id']);
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
