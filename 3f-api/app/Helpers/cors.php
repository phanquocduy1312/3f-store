<?php
/**
 * CORS handling helper
 */

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://3f-store.vercel.app',
    'https://trial1506895.mbws.vn'
];

// Add production public URL from config if set
$configPath = dirname(__DIR__, 2) . '/config/config.php';
if (file_exists($configPath)) {
    $config = require $configPath;
    if (!empty($config['app']['public_url'])) {
        $allowedOrigins[] = rtrim($config['app']['public_url'], '/');
    }
}

$httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigin = '';

if (in_array(rtrim($httpOrigin, '/'), $allowedOrigins, true)) {
    $allowedOrigin = $httpOrigin;
}

if ($allowedOrigin) {
    header("Access-Control-Allow-Origin: {$allowedOrigin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
