<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ProductCatalogService;
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;
use Exception;

class ProductController {
    public function list() {
        try {
            $q = Request::query('q');
            $limit = Request::query('limit');
            
            if ($q !== null && trim((string)$q) !== '') {
                $defaultLimit = 12;
                $limitVal = $limit !== null ? (int)$limit : $defaultLimit;
                if ($limitVal > 20) {
                    $limitVal = 20;
                }
            } else {
                $limitVal = $limit !== null ? (int)$limit : 24;
            }

            $service = new ProductCatalogService();
            $data = $service->listProducts([
                'q' => $q,
                'category' => Request::query('category'),
                'categorySlug' => Request::query('categorySlug'),
                'petType' => Request::query('petType'),
                'productType' => Request::query('productType'),
                'brand' => Request::query('brand'),
                'minPrice' => Request::query('minPrice'),
                'maxPrice' => Request::query('maxPrice'),
                'page' => Request::query('page', 1),
                'limit' => $limitVal,
                'sort' => Request::query('sort', 'newest')
            ]);

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product list error: " . $e->getMessage()], 500);
        }
    }

    public function detail() {
        $slug = trim((string)Request::query('slug', ''));
        $id = trim((string)Request::query('id', ''));
        $sourceProductId = trim((string)Request::query('sourceProductId', ''));

        if ($slug === '' && $id === '' && $sourceProductId === '') {
            Response::json(["success" => false, "message" => "Missing product slug or id."], 400);
        }

        try {
            $service = new ProductCatalogService();
            if ($slug !== '') {
                $data = $service->detail($slug, 'slug');
            } elseif ($sourceProductId !== '') {
                $data = $service->detail($sourceProductId, 'source_product_id');
            } else {
                $data = $service->detail($id, 'id');
            }

            if (!$data) {
                Response::json(["success" => false, "message" => "Product not found."], 404);
            }

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product detail error: " . $e->getMessage()], 500);
        }
    }

    public function categories() {
        try {
            $service = new ProductCatalogService();
            Response::json(["success" => true, "data" => $service->listCategories()], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Product categories error: " . $e->getMessage()], 500);
        }
    }

    public function adminList() {
        try {
            $service = new ProductCatalogService();
            $data = $service->listProducts([
                'admin' => true,
                'q' => Request::query('q'),
                'category' => Request::query('category'),
                'petType' => Request::query('petType'),
                'productType' => Request::query('productType'),
                'minPrice' => Request::query('minPrice'),
                'maxPrice' => Request::query('maxPrice'),
                'page' => Request::query('page', 1),
                'limit' => Request::query('limit', 24),
                'sort' => Request::query('sort', 'newest')
            ]);

            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product list error: " . $e->getMessage()], 500);
        }
    }

    public function adminDetail() {
        $id = trim((string)Request::query('id', ''));
        $slug = trim((string)Request::query('slug', ''));
        if ($id === '' && $slug === '') {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        try {
            $service = new ProductCatalogService();
            $data = $id !== '' ? $service->adminDetail($id, 'id') : $service->adminDetail($slug, 'slug');
            if (!$data) {
                Response::json(["success" => false, "message" => "Product not found."], 404);
            }
            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product detail error: " . $e->getMessage()], 500);
        }
    }

    public function adminSave() {
        $input = Request::json();
        if (empty($input['id'])) {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        try {
            $success = (new ProductCatalogService())->save($input);
            
            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'save_product', 'products', (int)$input['id'], [
                'name' => $input['name'] ?? null,
                'slug' => $input['slug'] ?? null
            ]);

            Response::json([
                "success" => (bool)$success,
                "message" => $success ? "Product saved." : "No product fields were updated."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product save error: " . $e->getMessage()], 500);
        }
    }

    public function adminToggleActive() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "Missing product id."], 400);
        }

        $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 0;
        try {
            $success = (new ProductCatalogService())->toggleActive($id, $isActive);
            
            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'toggle_product_active', 'products', $id, [
                'isActive' => $isActive
            ]);

            Response::json([
                "success" => (bool)$success,
                "message" => $isActive === 1 ? "Product activated." : "Product deactivated."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin product toggle error: " . $e->getMessage()], 500);
        }
    }

    public function filters() {
        try {
            $service = new ProductCatalogService();
            $filters = $service->listProductFilters();
            Response::json(["success" => true, "data" => $filters], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Filters error: " . $e->getMessage()], 500);
        }
    }

    public function adminReclassify() {
        try {
            $db = \App\Core\Database::getInstance()->getConnection();

            // Seed/Update default categories
            $categories = [
                ['slug' => 'thuc-an-cho-meo', 'name' => 'Thức ăn cho mèo', 'sort_order' => 10],
                ['slug' => 'thuc-an-cho-cho', 'name' => 'Thức ăn cho chó', 'sort_order' => 20],
                ['slug' => 'pate-snack', 'name' => 'Pate & Snack', 'sort_order' => 30],
                ['slug' => 'sua-dinh-duong', 'name' => 'Sữa & Dinh dưỡng', 'sort_order' => 40],
                ['slug' => 've-sinh-thu-cung', 'name' => 'Vệ sinh cho thú cưng', 'sort_order' => 50],
                ['slug' => 'phu-kien-do-choi', 'name' => 'Phụ kiện & Đồ chơi', 'sort_order' => 60],
                ['slug' => 'khac', 'name' => 'Khác', 'sort_order' => 999]
            ];

            $standardSlugs = [];
            foreach ($categories as $cat) {
                $standardSlugs[] = $cat['slug'];
                $stmt = $db->prepare("SELECT id FROM product_categories WHERE slug = :slug");
                $stmt->execute([':slug' => $cat['slug']]);
                $existing = $stmt->fetch();
                if ($existing) {
                    $stmt = $db->prepare("UPDATE product_categories SET name = :name, sort_order = :sort_order, is_active = 1 WHERE id = :id");
                    $stmt->execute([':name' => $cat['name'], ':sort_order' => $cat['sort_order'], ':id' => $existing['id']]);
                } else {
                    $stmt = $db->prepare("INSERT INTO product_categories (name, slug, sort_order, is_active) VALUES (:name, :slug, :sort_order, 1)");
                    $stmt->execute([':name' => $cat['name'], ':slug' => $cat['slug'], ':sort_order' => $cat['sort_order']]);
                }
            }

            // Deactivate non-standard categories
            $placeholders = implode(',', array_fill(0, count($standardSlugs), '?'));
            $deactStmt = $db->prepare("UPDATE product_categories SET is_active = 0 WHERE slug NOT IN ($placeholders)");
            $deactStmt->execute($standardSlugs);

            $stmt = $db->query("SELECT id, slug FROM product_categories");
            $catSlugToId = [];
            while ($row = $stmt->fetch()) {
                $catSlugToId[$row['slug']] = (int)$row['id'];
            }

            $stmt = $db->query("SELECT id, name, description, brand FROM products");
            $products = $stmt->fetchAll();

            $total = count($products);
            $petTypeCounts = ['cat' => 0, 'dog' => 0, 'both' => 0, 'other' => 0];
            $productTypeCounts = [];
            $categoryCounts = [];

            foreach ($products as $p) {
                $name = $p['name'];
                $description = $p['description'] ?? '';

                $petType = \App\Services\ProductClassificationService::classifyPetType($name, $description);
                $productType = \App\Services\ProductClassificationService::classifyProductType($name, $description);
                $catSlug = \App\Services\ProductClassificationService::resolveCategorySlug($petType, $productType, $name, $description);
                $brand = $p['brand'];
                if (empty($brand)) {
                    $brand = \App\Services\ProductClassificationService::detectBrand($name, $description);
                }

                $categoryId = isset($catSlugToId[$catSlug]) ? $catSlugToId[$catSlug] : null;

                $updateStmt = $db->prepare("
                    UPDATE products 
                    SET pet_type = :pet_type, 
                        product_type = :product_type, 
                        category_id = :category_id, 
                        brand = :brand 
                    WHERE id = :id
                ");
                $updateStmt->execute([
                    ':pet_type' => $petType,
                    ':product_type' => $productType,
                    ':category_id' => $categoryId,
                    ':brand' => $brand,
                    ':id' => $p['id']
                ]);

                $petTypeCounts[$petType] = ($petTypeCounts[$petType] ?? 0) + 1;
                $productTypeCounts[$productType] = ($productTypeCounts[$productType] ?? 0) + 1;
                $categoryCounts[$catSlug] = ($categoryCounts[$catSlug] ?? 0) + 1;
            }

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'reclassify_products', 'products', null, [
                'total' => $total,
                'petTypeCounts' => $petTypeCounts,
                'productTypeCounts' => $productTypeCounts,
                'categoryCounts' => $categoryCounts
            ]);

            Response::json([
                "success" => true,
                "data" => [
                    "total" => $total,
                    "petTypeCounts" => $petTypeCounts,
                    "productTypeCounts" => $productTypeCounts,
                    "categoryCounts" => $categoryCounts
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Admin reclassify error: " . $e->getMessage()], 500);
        }
    }
}
