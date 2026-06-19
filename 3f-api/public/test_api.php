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
    $_SERVER["HTTP_AUTHORIZATION"] = "Bearer test";
    $controller = new \App\Controllers\AdminCustomerController();
    $controller->list();
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}

