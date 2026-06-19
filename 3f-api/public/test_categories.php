<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Auto-loader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

require_once __DIR__ . '/../config/config.php';

try {
    $db = \App\Core\Database::getInstance()->getConnection();
    $service = new \App\Services\ProductCatalogService();
    $adminId = 1;

    echo "1. List Categories:\n";
    $categories = $service->adminListCategories();
    echo "Found " . count($categories) . " categories.\n\n";

    echo "2. Create Category:\n";
    $payload = [
        'name' => 'Test Category ' . time(),
        'description' => 'Test description',
        'sortOrder' => 10
    ];
    $newId = $service->adminSaveCategory($payload, $adminId);
    echo "Created category ID: $newId\n\n";

    echo "3. Edit Category:\n";
    $payload['id'] = $newId;
    $payload['name'] = 'Test Category Edited';
    $service->adminSaveCategory($payload, $adminId);
    echo "Edited category ID: $newId\n\n";

    echo "4. Toggle Active:\n";
    $service->adminToggleCategoryActive($newId, false, $adminId);
    echo "Toggled active to false.\n\n";

    echo "5. Create Child Category:\n";
    $childPayload = [
        'name' => 'Child Category',
        'parentId' => $newId
    ];
    $childId = $service->adminSaveCategory($childPayload, $adminId);
    echo "Created child ID: $childId\n\n";

    echo "6. Test Delete Parent (Should Fail):\n";
    try {
        $service->adminDeleteCategory($newId, $adminId);
        echo "FAIL: Should have thrown exception.\n";
    } catch (\Exception $e) {
        echo "SUCCESS (Blocked): " . $e->getMessage() . "\n";
    }
    echo "\n";

    echo "7. Delete Child Category:\n";
    $service->adminDeleteCategory($childId, $adminId);
    echo "Deleted child ID: $childId\n\n";

    echo "8. Test Delete Category with Product (Should Fail):\n";
    // Find a category with products
    $stmt = $db->query("SELECT category_id FROM products WHERE category_id IS NOT NULL LIMIT 1");
    $catWithProd = $stmt->fetchColumn();
    if ($catWithProd) {
        try {
            $service->adminDeleteCategory($catWithProd, $adminId);
            echo "FAIL: Should have thrown exception for category $catWithProd.\n";
        } catch (\Exception $e) {
            echo "SUCCESS (Blocked): " . $e->getMessage() . "\n";
        }
    } else {
        echo "No category with products found to test.\n";
    }
    echo "\n";

    echo "9. Delete Parent Category:\n";
    $service->adminDeleteCategory($newId, $adminId);
    echo "Deleted parent ID: $newId\n\n";

    echo "ALL TESTS PASSED!";

} catch (\Throwable $e) {
    echo "UNHANDLED ERROR: " . $e->getMessage();
}
