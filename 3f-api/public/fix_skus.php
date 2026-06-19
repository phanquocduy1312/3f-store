<?php
// Load env if exists
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . '=' . trim(trim($value, '"\'')));
        }
    }
}

$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: '3f';
$user = getenv('DB_USER') ?: '3f_user';
$pass = getenv('DB_PASS') ?: '0932368720Ab';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Find duplicated SKUs for active variants
$stmt = $pdo->query("
    SELECT sku, COUNT(*) as c 
    FROM product_variants 
    WHERE is_active = 1 AND sku IS NOT NULL AND sku != ''
    GROUP BY sku 
    HAVING c > 1
");
$duplicates = $stmt->fetchAll();

$count = 0;
foreach ($duplicates as $dup) {
    $sku = $dup['sku'];
    
    // Get all variants with this SKU
    $stmt2 = $pdo->prepare("SELECT id FROM product_variants WHERE sku = ? AND is_active = 1 ORDER BY id ASC");
    $stmt2->execute([$sku]);
    $variants = $stmt2->fetchAll();
    
    // Keep the first one intact, update the rest
    array_shift($variants);
    foreach ($variants as $idx => $v) {
        $hash = strtoupper(substr(str_shuffle(MD5(microtime())), 0, 4));
        $newSku = $sku . '-' . $hash;
        
        // Ensure new SKU doesn't exist
        $check = $pdo->prepare("SELECT id FROM product_variants WHERE sku = ?");
        $check->execute([$newSku]);
        if ($check->rowCount() > 0) {
            $newSku .= 'A'; // super fallback
        }

        $stmt3 = $pdo->prepare("UPDATE product_variants SET sku = ? WHERE id = ?");
        $stmt3->execute([$newSku, $v['id']]);
        echo "Updated variant ID {$v['id']} from $sku to $newSku\n";
        $count++;
    }
}

echo "Done. Fixed $count duplicate SKUs in the database.\n";
