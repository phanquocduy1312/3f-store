<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

spl_autoload_register(function ($class) {
    if (strpos($class, "App\\") === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . "/app/" . str_replace("\\", "/", $relativeClass) . ".php";
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

require_once __DIR__ . "/../app/Core/Database.php";
require_once __DIR__ . "/../config/config.php";

try {
    $customerModel = new \App\Models\Customer();
    $filters = [
        "page" => 1,
        "limit" => 10,
        "status" => "all",
        "tier" => "all",
        "phoneVerified" => "all",
        "hasOrders" => "all"
    ];
    $result = $customerModel->adminPaginateCustomers($filters);
    print_r($result);
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}

