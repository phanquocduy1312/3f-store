<?php
/**
 * CLI Script to Seed Categories and Reclassify Products
 */

// Prevent raw PHP HTML errors
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Load environment variables from 3f-api/.env
$envFile = dirname(__DIR__) . '/3f-api/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'(.*)'$/", $val, $matches)) {
                $val = $matches[1];
            }
            $val = trim($val);
            putenv("{$key}={$val}");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// Simple Autoloader mapping App\... namespace to 3f-api/app/... directory
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/3f-api/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;
use App\Services\ProductClassificationService;

try {
    $db = Database::getInstance()->getConnection();

    // 1. Seed/Update default categories
    $categories = [
        [
            'slug' => 'thuc-an-cho-meo',
            'name' => 'Thức ăn cho mèo',
            'sort_order' => 10
        ],
        [
            'slug' => 'thuc-an-cho-cho',
            'name' => 'Thức ăn cho chó',
            'sort_order' => 20
        ],
        [
            'slug' => 'pate-snack',
            'name' => 'Pate & Snack',
            'sort_order' => 30
        ],
        [
            'slug' => 'sua-dinh-duong',
            'name' => 'Sữa & Dinh dưỡng',
            'sort_order' => 40
        ],
        [
            'slug' => 've-sinh-thu-cung',
            'name' => 'Vệ sinh cho thú cưng',
            'sort_order' => 50
        ],
        [
            'slug' => 'phu-kien-do-choi',
            'name' => 'Phụ kiện & Đồ chơi',
            'sort_order' => 60
        ],
        [
            'slug' => 'khac',
            'name' => 'Khác',
            'sort_order' => 999
        ]
    ];

    $standardSlugs = [];
    foreach ($categories as $cat) {
        $standardSlugs[] = $cat['slug'];
        // Check if category exists
        $stmt = $db->prepare("SELECT id FROM product_categories WHERE slug = :slug");
        $stmt->execute([':slug' => $cat['slug']]);
        $existing = $stmt->fetch();
        if ($existing) {
            // Update it
            $stmt = $db->prepare("UPDATE product_categories SET name = :name, sort_order = :sort_order, is_active = 1 WHERE id = :id");
            $stmt->execute([
                ':name' => $cat['name'],
                ':sort_order' => $cat['sort_order'],
                ':id' => $existing['id']
            ]);
        } else {
            // Insert it
            $stmt = $db->prepare("INSERT INTO product_categories (name, slug, sort_order, is_active) VALUES (:name, :slug, :sort_order, 1)");
            $stmt->execute([
                ':name' => $cat['name'],
                ':slug' => $cat['slug'],
                ':sort_order' => $cat['sort_order']
            ]);
        }
    }

    // Deactivate non-standard categories
    $placeholders = implode(',', array_fill(0, count($standardSlugs), '?'));
    $deactStmt = $db->prepare("UPDATE product_categories SET is_active = 0 WHERE slug NOT IN ($placeholders)");
    $deactStmt->execute($standardSlugs);

    // Load category mapping slug -> id
    $stmt = $db->query("SELECT id, slug FROM product_categories");
    $catSlugToId = [];
    while ($row = $stmt->fetch()) {
        $catSlugToId[$row['slug']] = (int)$row['id'];
    }

    // 2. Load all products
    $stmt = $db->query("SELECT id, name, description, brand FROM products");
    $products = $stmt->fetchAll();

    $total = count($products);
    $petTypeCounts = ['cat' => 0, 'dog' => 0, 'both' => 0, 'other' => 0];
    $productTypeCounts = [];
    $categoryCounts = [];

    foreach ($products as $p) {
        $name = $p['name'];
        $description = $p['description'] ?? '';

        $petType = ProductClassificationService::classifyPetType($name, $description);
        $productType = ProductClassificationService::classifyProductType($name, $description);
        $catSlug = ProductClassificationService::resolveCategorySlug($petType, $productType, $name, $description);
        $brand = $p['brand'];
        if (empty($brand)) {
            $brand = ProductClassificationService::detectBrand($name, $description);
        }

        $categoryId = isset($catSlugToId[$catSlug]) ? $catSlugToId[$catSlug] : null;

        // Update product table
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

    $response = [
        "success" => true,
        "data" => [
            "total" => $total,
            "petTypeCounts" => $petTypeCounts,
            "productTypeCounts" => $productTypeCounts,
            "categoryCounts" => $categoryCounts
        ]
    ];

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

} catch (\Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Reclassify error: " . $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    exit(1);
}
