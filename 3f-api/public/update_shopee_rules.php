<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Load environment variables from .env
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
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

// Autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $relativeClass = substr($class, 4);
        $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to DB successfully.\n";

    // 1. Update Shopee rules in loyalty_point_rules
    $stmt1 = $db->prepare("UPDATE loyalty_point_rules SET money_per_point = 200 WHERE source = 'shopee'");
    $stmt1->execute();
    echo "Updated Shopee point rules.\n";

    // 2. Update loyalty_tiers benefits column
    $tiersData = [
        'silver' => "Tích điểm tốt hơn trên kênh riêng.\nĐược dùng điểm tối đa 10% giá trị đơn.\nCó voucher chăm sóc định kỳ.",
        'gold' => "Ưu đãi riêng cho combo lớn.\nĐược dùng điểm tối đa 15% giá trị đơn.\nĐược nhắc lịch mua lại theo lịch ăn / cát / pate của pet.\nĐược ưu tiên nhận deal sớm.",
        'diamond' => "Nhóm chăm sóc riêng / ưu tiên CSKH.\nĐược dùng điểm tối đa 20% giá trị đơn.\nCó deal riêng cho khách nuôi nhiều bé.\nĐược ưu tiên giữ hàng, deal hot hoặc sản phẩm mới."
    ];

    $stmt2 = $db->prepare("UPDATE loyalty_tiers SET benefits = :benefits WHERE key_name = :key");
    foreach ($tiersData as $key => $benefits) {
        $stmt2->execute([
            ':key' => $key,
            ':benefits' => $benefits
        ]);
        echo "Updated tier: {$key}\n";
    }

    // Verify
    $tiers = $db->query("SELECT key_name, name, benefits FROM loyalty_tiers")->fetchAll(PDO::FETCH_ASSOC);
    print_r($tiers);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
