<?php
/**
 * Automated Integration Test Suite for Shopee OAuth Connection Flow
 * Usage: C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe scripts/test-shopee-oauth.php
 */

ini_set('display_errors', '1');
error_reporting(E_ALL);

// 1. Load env
$envFile = dirname(__DIR__) . '/3f-api/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv("{$parts[0]}={$parts[1]}");
            $_ENV[$parts[0]] = $parts[1];
            $_SERVER[$parts[0]] = $parts[1];
        }
    }
}

// Autoloader
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
use App\Models\AdminUser;
use App\Models\AdminSession;

// Helpers
function sendRequest($url, $method = 'GET', $headers = [], $body = null, &$info = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't auto-follow redirects, so we can verify them!
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    return $response;
}

try {
    $db = Database::getInstance()->getConnection();
    echo "=== Running Shopee OAuth Integration Tests ===\n";

    // Start PHP local server in a separate process
    $cmd = '"C:\\laragon\\bin\\php\\php-8.3.30-Win32-vs16-x64\\php.exe" -S 127.0.0.1:8080 -t "' . dirname(__DIR__) . '/3f-api/public"';
    $descriptors = [
        0 => ["pipe", "r"],
        1 => ["pipe", "w"],
        2 => ["pipe", "w"]
    ];
    $process = proc_open($cmd, $descriptors, $pipes);

    if (!is_resource($process)) {
        throw new Exception("Failed to start local PHP server.");
    }

    // Wait 1 second for server to boot
    sleep(1);
    echo "Started local PHP test server on port 8080.\n";

    // ----------------------------------------------------
    // Test 1: callback without params returns 400 Missing code/shop_id/state
    // ----------------------------------------------------
    echo "Test 1: callback without params...";
    $info = [];
    $res = sendRequest("http://127.0.0.1:8080/api/shopee/callback", "GET", [], null, $info);
    $data = json_decode($res, true);

    if ($info['http_code'] === 400 && isset($data['success']) && $data['success'] === false && strpos($data['message'], 'Missing code') !== false) {
        echo " PASSED\n";
    } else {
        echo " FAILED (Code: {$info['http_code']}, Response: {$res})\n";
        exit(1);
    }

    // ----------------------------------------------------
    // Test 2: connect when not logged in (no token) returns 401 Unauthorized
    // ----------------------------------------------------
    echo "Test 2: connect without token...";
    $info = [];
    $res = sendRequest("http://127.0.0.1:8080/api/admin/shopee/connect", "GET", [], null, $info);
    $data = json_decode($res, true);

    if ($info['http_code'] === 401 && isset($data['success']) && $data['success'] === false) {
        echo " PASSED\n";
    } else {
        echo " FAILED (Code: {$info['http_code']}, Response: {$res})\n";
        exit(1);
    }

    // ----------------------------------------------------
    // Test 3: connect with valid admin token returns authorizeUrl
    // ----------------------------------------------------
    echo "Test 3: connect with valid token...";
    // Create transient test admin user
    $userModel = new AdminUser();
    $sessionModel = new AdminSession();
    $adminEmail = "shopee-test-" . mt_rand(1000, 9999) . "@3f-test.vn";
    $adminId = $userModel->createUser("Shopee Test Admin", $adminEmail, "password123");
    $token = $sessionModel->createSession($adminId);

    $headers = [
        "Authorization: Bearer {$token}",
        "Content-Type: application/json"
    ];

    $info = [];
    $res = sendRequest("http://127.0.0.1:8080/api/admin/shopee/connect", "GET", $headers, null, $info);
    $data = json_decode($res, true);

    if ($info['http_code'] === 200 && isset($data['success']) && $data['success'] === true && !empty($data['data']['authorizeUrl'])) {
        echo " PASSED\n";
    } else {
        echo " FAILED (Code: {$info['http_code']}, Response: {$res})\n";
        exit(1);
    }

    $authorizeUrl = $data['data']['authorizeUrl'];

    // ----------------------------------------------------
    // Test 4: verify state is created in DB and matches parameters
    // ----------------------------------------------------
    echo "Test 4: verify state stored in DB...";
    // Extract state from authorizeUrl
    $parsedUrl = parse_url($authorizeUrl);
    parse_str($parsedUrl['query'], $queryParams);
    $state = $queryParams['state'] ?? '';

    if (empty($state)) {
        echo " FAILED (No state in authorizeUrl: {$authorizeUrl})\n";
        exit(1);
    }

    $stmtState = $db->prepare("SELECT * FROM shopee_oauth_states WHERE state = :state LIMIT 1");
    $stmtState->execute([':state' => $state]);
    $stateRecord = $stmtState->fetch(PDO::FETCH_ASSOC);

    if ($stateRecord && $stateRecord['used_at'] === null && strtotime($stateRecord['expires_at']) > time()) {
        echo " PASSED\n";
    } else {
        echo " FAILED (State record invalid or missing in DB: " . json_encode($stateRecord) . ")\n";
        exit(1);
    }

    // ----------------------------------------------------
    // Test 5: callback with invalid state gets rejected (redirects to /admin/3f-club?shopee=error)
    // ----------------------------------------------------
    echo "Test 5: callback with invalid state...";
    $info = [];
    $res = sendRequest("http://127.0.0.1:8080/api/shopee/callback?code=mock_code&shop_id=9999&state=fake_state", "GET", [], null, $info);

    if ($info['http_code'] === 302 && isset($info['redirect_url']) && strpos($info['redirect_url'], 'shopee=error') !== false) {
        echo " PASSED\n";
    } else {
        echo " FAILED (Code: {$info['http_code']}, Redirect: " . ($info['redirect_url'] ?? 'none') . ")\n";
        exit(1);
    }

    // ----------------------------------------------------
    // Test 6: callback with valid state but invalid exchange code (fails API exchange) -> redirects to ?shopee=error and marks state used
    // ----------------------------------------------------
    echo "Test 6: callback with valid state but invalid code...";
    $info = [];
    $res = sendRequest("http://127.0.0.1:8080/api/shopee/callback?code=invalid_code&shop_id=9999&state={$state}", "GET", [], null, $info);

    // Verify redirect
    $redirectSuccess = ($info['http_code'] === 302 && isset($info['redirect_url']) && strpos($info['redirect_url'], 'shopee=error') !== false);

    // Verify state used
    $stmtState->execute([':state' => $state]);
    $stateRecordUpdated = $stmtState->fetch(PDO::FETCH_ASSOC);
    $stateMarkedUsed = ($stateRecordUpdated && $stateRecordUpdated['used_at'] !== null);

    if ($redirectSuccess && $stateMarkedUsed) {
        echo " PASSED\n";
    } else {
        echo " FAILED (Redirect: " . ($info['redirect_url'] ?? 'none') . ", StateMarkedUsed: " . ($stateMarkedUsed ? 'yes' : 'no') . ")\n";
        exit(1);
    }

    // ----------------------------------------------------
    // Test 7: Verify token saving database operations directly
    // ----------------------------------------------------
    echo "Test 7: Direct token save operations...";
    $tokenModel = new \App\Models\ShopeeTokenModel();
    $mockShopId = "shopee-test-shop-" . mt_rand(1000, 9999);
    $mockAccessToken = "mock_access_token_" . bin2hex(random_bytes(16));
    $mockRefreshToken = "mock_refresh_token_" . bin2hex(random_bytes(16));
    $expireAt = date('Y-m-d H:i:s', time() + 3600);

    $saveSuccess = $tokenModel->upsertToken([
        'shop_id'                 => $mockShopId,
        'shop_name'               => "Mock Test Shop",
        'access_token'            => $mockAccessToken,
        'refresh_token'           => $mockRefreshToken,
        'access_token_expire_at'  => $expireAt,
        'refresh_token_expire_at' => $expireAt,
        'is_active'               => 1
    ]);

    $savedToken = $tokenModel->findByShopId($mockShopId);

    if ($saveSuccess && $savedToken && $savedToken['access_token'] === $mockAccessToken && $savedToken['shop_name'] === "Mock Test Shop") {
        echo " PASSED\n";
    } else {
        echo " FAILED (Save: " . ($saveSuccess ? 'yes' : 'no') . ", Token retrieved: " . json_encode($savedToken) . ")\n";
        exit(1);
    }

    // Clean up test data
    $db->exec("DELETE FROM admin_users WHERE email = '{$adminEmail}'");
    $db->exec("DELETE FROM shopee_oauth_states WHERE state = '{$state}'");
    $db->exec("DELETE FROM shopee_tokens WHERE shop_id = '{$mockShopId}'");

    // Close process
    proc_terminate($process);
    echo "=== ALL SHOPEE OAUTH INTEGRATION TESTS PASSED ===\n";

} catch (\Throwable $e) {
    if (isset($process) && is_resource($process)) {
        proc_terminate($process);
    }
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
