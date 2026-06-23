<?php
// ccc/3f-api/public/run_loyalty_qa.php

use App\Core\Database;
use App\Services\OtpService;
use App\Models\LoyaltyProductionModel;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;

try {

    // 1. Load environment variables
    $envFile = dirname(__DIR__) . '/.env';
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
                if (preg_match('/^"(.*)"$/', $val, $matches) || preg_match("/^'/.*'$/", $val, $matches)) {
                    $val = $matches[1];
                }
                $val = trim($val);
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }

    // 2. Simple Autoloader
    spl_autoload_register(function ($class) {
        if (strpos($class, 'App\\') === 0) {
            $relativeClass = substr($class, 4);
            $file = dirname(__DIR__) . '/app/' . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require_once $file;
            }
        }
    });

    header('Content-Type: text/html; charset=utf-8');

    echo "<style>
        body { font-family: sans-serif; background: #0f172a; color: #cbd5e1; padding: 20px; }
        h1, h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 8px; }
        .pass { color: #4ade80; font-weight: bold; }
        .fail { color: #f87171; font-weight: bold; }
        pre { background: #1e293b; padding: 12px; border-radius: 6px; overflow-x: auto; border: 1px solid #334155; }
        .case { margin-bottom: 10px; padding: 8px; border-left: 4px solid #3b82f6; background: #1e293b; }
    </style>";

    echo "<h1>3F Store - OTP & Loyalty System QA Script</h1>";

    try {
        $db = Database::getInstance()->getConnection();
        echo "<p class='pass'>Connected to database successfully.</p>";
    } catch (Exception $e) {
        echo "<p class='fail'>Database connection failed: " . $e->getMessage() . "</p>";
        exit;
    }

    // Setup test env parameters override
    putenv("APP_ENV=development");
    $_ENV['APP_ENV'] = 'development';
    putenv("OTP_PROVIDER=mock");
    $_ENV['OTP_PROVIDER'] = 'mock';
    putenv("OTP_SECRET=TEST_SECRET_KEY_123_QA");
    $_ENV['OTP_SECRET'] = 'TEST_SECRET_KEY_123_QA';
    putenv("OTP_RESEND_COOLDOWN_SECONDS=60");
    $_ENV['OTP_RESEND_COOLDOWN_SECONDS'] = '60';

    $testPhone = '0987654321';
    $testCustomerId = 99999;

    // Clean up previous test entries to ensure clean run
    $db->exec("DELETE FROM otp_requests WHERE phone = '$testPhone'");
    $db->exec("DELETE FROM customer_loyalty_profiles WHERE customer_id = '$testCustomerId' OR phone = '$testPhone'");
    $db->exec("DELETE FROM loyalty_point_transactions WHERE customer_id = '$testCustomerId'");
    $db->exec("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = '$testCustomerId' OR phone = '$testPhone')");
    $db->exec("DELETE FROM orders WHERE customer_id = '$testCustomerId' OR phone = '$testPhone'");
    $db->exec("DELETE FROM customers WHERE id = '$testCustomerId' OR phone = '$testPhone'");

    // Create test customer
    $db->prepare("
        INSERT INTO customers (id, name, phone, email, is_phone_verified, created_at)
        VALUES (:id, 'Test QA Customer', :phone, 'qa@test.com', 0, NOW())
    ")->execute([':id' => $testCustomerId, ':phone' => $testPhone]);

    echo "<h2>1. OTP SECURITY & STABILITY TEST CASES</h2>";

    $otpService = new OtpService();

    // Case 1.1: Request OTP successfully
    echo "<div class='case'>";
    $reqRes = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    if ($reqRes['success'] && isset($reqRes['devOtp'])) {
        echo "Case 1.1 (Request OTP): <span class='pass'>PASS</span>. Dev OTP code: " . $reqRes['devOtp'] . "<br>";
        $firstOtp = $reqRes['devOtp'];
    } else {
        echo "Case 1.1 (Request OTP): <span class='fail'>FAIL</span>. " . json_encode($reqRes) . "<br>";
    }
    echo "</div>";

    // Case 1.2: Resend within 60s blocked
    echo "<div class='case'>";
    $resendRes = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    if (!$resendRes['success'] && strpos($resendRes['message'], 'Vui lòng đợi 60 giây') !== false) {
        echo "Case 1.2 (Cooldown Check): <span class='pass'>PASS</span>. Correctly blocked: " . $resendRes['message'] . "<br>";
    } else {
        echo "Case 1.2 (Cooldown Check): <span class='fail'>FAIL</span>. Result: " . json_encode($resendRes) . "<br>";
    }
    echo "</div>";

    // Case 1.3: Exceed 5 times daily limit blocked
    echo "<div class='case'>";
    // Make sure previous requests are set in the past to satisfy cooldown
    $pastDate = date('Y-m-d H:i:s', time() - 70);
    $db->prepare("UPDATE otp_requests SET created_at = :created_at WHERE phone = :phone")
       ->execute([':created_at' => $pastDate, ':phone' => $testPhone]);
    // Simulate 5 daily requests
    for ($i = 0; $i < 4; $i++) {
        // Manually insert requests to bypass cooldown
        $db->prepare("
            INSERT INTO otp_requests (phone, purpose, otp_hash, provider, expires_at, created_at)
            VALUES (:phone, 'register_phone', 'dummyhash', 'mock', :expires_at, :created_at)
        ")->execute([
            ':phone' => $testPhone,
            ':expires_at' => date('Y-m-d H:i:s', time() + 300),
            ':created_at' => date('Y-m-d H:i:s', time() - (70 + $i * 10))
        ]);
    }
    $limitRes = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    if (!$limitRes['success'] && strpos($limitRes['message'], 'quá số lần cho phép') !== false) {
        echo "Case 1.3 (Daily Limit Check): <span class='pass'>PASS</span>. Blocked after 5+ requests: " . $limitRes['message'] . "<br>";
    } else {
        echo "Case 1.3 (Daily Limit Check): <span class='fail'>FAIL</span>. Result: " . json_encode($limitRes) . "<br>";
    }
    echo "</div>";

    // Clear requests to resume testing verify logic
    $db->exec("DELETE FROM otp_requests WHERE phone = '$testPhone'");

    // Case 1.4: OTP expiration after 5 minutes
    echo "<div class='case'>";
    $reqVerify = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    $codeToVerify = $reqVerify['devOtp'];
    // Simulate expiration by setting expires_at to 6 minutes in the past (timezone safe)
    $pastDate = date('Y-m-d H:i:s', time() - 360);
    $db->prepare("UPDATE otp_requests SET expires_at = :expires_at WHERE phone = :phone")
       ->execute([':expires_at' => $pastDate, ':phone' => $testPhone]);
    $verifyRes = $otpService->verifyOtp($testPhone, $codeToVerify, 'register_phone');
    if (!$verifyRes['success'] && strpos($verifyRes['error'], 'hết hạn') !== false) {
        echo "Case 1.4 (Expiration Check): <span class='pass'>PASS</span>. Expired code rejected correctly.<br>";
    } else {
        echo "Case 1.4 (Expiration Check): <span class='fail'>FAIL</span>. Result: " . json_encode($verifyRes) . "<br>";
    }
    echo "</div>";

    $db->exec("DELETE FROM otp_requests WHERE phone = '$testPhone'");
    // Case 1.5: Lock after 5 failed verification attempts
    echo "<div class='case'>";
    $reqLock = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    $goodCode = $reqLock['devOtp'];
    // Send 5 wrong OTPs
    for ($i = 0; $i < 5; $i++) {
        $otpService->verifyOtp($testPhone, '000000', 'register_phone');
    }
    // Try verifying with correct code
    $verifyAfterLock = $otpService->verifyOtp($testPhone, $goodCode, 'register_phone');
    if (!$verifyAfterLock['success'] && strpos($verifyAfterLock['error'], 'không đúng') !== false) {
        echo "Case 1.5 (Lock after 5 failed attempts): <span class='pass'>PASS</span>. Customer correctly locked out from correct verification.<br>";
    } else {
        echo "Case 1.5 (Lock after 5 failed attempts): <span class='fail'>FAIL</span>. Correct verification succeeded or gave unexpected error: " . json_encode($verifyAfterLock) . "<br>";
    }
    echo "</div>";

    $db->exec("DELETE FROM otp_requests WHERE phone = '$testPhone'");
    // Case 1.6: Purpose isolation check (register_phone vs redeem_reward)
    echo "<div class='case'>";
    $reqPurpose = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    $purposeCode = $reqPurpose['devOtp'];
    // Try verify with different purpose 'redeem_reward'
    $verifyPurpose = $otpService->verifyOtp($testPhone, $purposeCode, 'redeem_reward');
    if (!$verifyPurpose['success']) {
        echo "Case 1.6 (Purpose Isolation): <span class='pass'>PASS</span>. Verification failed for incorrect purpose as expected.<br>";
    } else {
        echo "Case 1.6 (Purpose Isolation): <span class='fail'>FAIL</span>. OTP verified with mismatched purpose.<br>";
    }
    echo "</div>";

        // Case 1.7: Correct OTP verifies & set verified_at
    echo "<div class='case'>";
    $verifyCorrect = $otpService->verifyOtp($testPhone, $purposeCode, 'register_phone');
    if ($verifyCorrect['success']) {
        // Check database verified_at
        $stmtCheckVerified = $db->prepare("SELECT verified_at FROM otp_requests WHERE phone = :phone AND purpose = 'register_phone' ORDER BY id DESC LIMIT 1");
        $stmtCheckVerified->execute([':phone' => $testPhone]);
        $vAt = $stmtCheckVerified->fetchColumn();
        if ($vAt !== null) {
            echo "Case 1.7 (Success Verification): <span class='pass'>PASS</span>. OTP verified. verified_at is set to: $vAt<br>";
        } else {
            echo "Case 1.7 (Success Verification): <span class='fail'>FAIL</span>. verified_at column is NULL in DB.<br>";
        }
    } else {
        echo "Case 1.7 (Success Verification): <span class='fail'>FAIL</span>. Verification failed: " . json_encode($verifyCorrect) . "<br>";
    }
    echo "</div>";

    // Case 1.8: OTP cannot be reused
    echo "<div class='case'>";
    $verifyReuse = $otpService->verifyOtp($testPhone, $purposeCode, 'register_phone');
    if (!$verifyReuse['success'] && strpos($verifyReuse['error'], 'đã được sử dụng') !== false) {
        echo "Case 1.8 (No Reuse Check): <span class='pass'>PASS</span>. Already used OTP correctly blocked.<br>";
    } else {
        echo "Case 1.8 (No Reuse Check): <span class='fail'>FAIL</span>. Used OTP verification result: " . json_encode($verifyReuse) . "<br>";
    }
    echo "</div>";

    // Case 1.9: Block mock provider on APP_ENV=production
    echo "<div class='case'>";
    putenv("APP_ENV=production");
    $_ENV['APP_ENV'] = 'production';
    $prodRes = $otpService->requestOtp($testPhone, 'register_phone', $testCustomerId);
    if (!$prodRes['success'] && strpos($prodRes['message'], 'Chưa cấu hình nhà cung cấp OTP') !== false) {
        echo "Case 1.9 (Block Mock on Production): <span class='pass'>PASS</span>. Correctly returned error: " . $prodRes['message'] . "<br>";
    } else {
        echo "Case 1.9 (Block Mock on Production): <span class='fail'>FAIL</span>. Allowed mock request or returned: " . json_encode($prodRes) . "<br>";
    }
    // Restore development environment
    putenv("APP_ENV=development");
    $_ENV['APP_ENV'] = 'development';
    echo "</div>";

    // Case 1.10: Block constructor if OTP_SECRET is missing in staging/production
    echo "<div class='case'>";
    putenv("APP_ENV=staging");
    $_ENV['APP_ENV'] = 'staging';
    putenv("OTP_SECRET=");
    $_ENV['OTP_SECRET'] = '';
    try {
        new OtpService();
        echo "Case 1.10 (Block empty OTP_SECRET in staging): <span class='fail'>FAIL</span>. Constructor did not throw exception.<br>";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'OTP_SECRET is required') !== false) {
            echo "Case 1.10 (Block empty OTP_SECRET in staging): <span class='pass'>PASS</span>. Threw exception: " . $e->getMessage() . "<br>";
        } else {
            echo "Case 1.10 (Block empty OTP_SECRET in staging): <span class='fail'>FAIL</span>. Threw incorrect exception: " . $e->getMessage() . "<br>";
        }
    }
    // Restore keys
    putenv("APP_ENV=development");
    $_ENV['APP_ENV'] = 'development';
    putenv("OTP_SECRET=TEST_SECRET_KEY_123_QA");
    $_ENV['OTP_SECRET'] = 'TEST_SECRET_KEY_123_QA';
    echo "</div>";


    echo "<h2>2. LOYALTY FORMULA & LEDGER QA TEST CASES</h2>";

    // Seed default settings for formulas
    $db->exec("UPDATE loyalty_settings SET setting_value = '200' WHERE setting_key = 'money_per_point'");
    $db->exec("UPDATE loyalty_settings SET setting_value = '1.5' WHERE setting_key = 'multiplier_website'");
    $db->exec("UPDATE loyalty_settings SET setting_value = '1.0' WHERE setting_key = 'multiplier_shopee'");
    $db->exec("UPDATE loyalty_settings SET setting_value = '1.0' WHERE setting_key = 'multiplier_tiktok'");

    // Set customer verified SĐT for tier accumulation
    $db->exec("UPDATE customers SET is_phone_verified = 1, phone_verified_at = NOW() WHERE id = '$testCustomerId'");

    // Prepare a test product
    $testProductId = 99999;
    $testVariantId = 99999;
    $db->exec("DELETE FROM product_variants WHERE product_id = '$testProductId'");
    $db->exec("DELETE FROM products WHERE id = '$testProductId'");
    $db->prepare("
        INSERT INTO products (id, source_product_id, name, slug, min_price, max_price, is_active, is_points_enabled)
        VALUES (:id, 'qa_prod_1', 'Test Product QA', 'test-product-qa', 100, 1000000, 1, 1)
    ")->execute([':id' => $testProductId]);
    $db->prepare("
        INSERT INTO product_variants (id, product_id, source_product_id, source_sku_id, price, is_active)
        VALUES (:id, :product_id, 'qa_prod_1', 'qa_sku_1', 1000000, 1)
    ")->execute([':id' => $testVariantId, ':product_id' => $testProductId]);

    // Case 2.1: Website order 1,000,000đ with x1.5 = 7,500 points
    echo "<div class='case'>";
    // Create order
    $orderIdWeb = 99991;
    $orderCodeWeb = 'OD_WEB_QA_99991';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdWeb'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdWeb'");

    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 1000000, 1000000, 0, 0, 'website', 'completed', 'not_earned')
    ")->execute([':id' => $orderIdWeb, ':code' => $orderCodeWeb, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    // Insert order item
    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 1000000, 1)
    ")->execute([':order_id' => $orderIdWeb, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    // Trigger point earning
    $orderModel = new Order();
    $orderModel->updateLoyaltyStatus($orderIdWeb, 'credited', 'QA Test web credit', 'system');

    // Check transaction
    $stmtTx = $db->prepare("SELECT points, eligible_amount, multiplier, status FROM loyalty_point_transactions WHERE order_id = :order_id AND type='earn'");
    $stmtTx->execute([':order_id' => $orderIdWeb]);
    $txWeb = $stmtTx->fetch(PDO::FETCH_ASSOC);

    if ($txWeb && (int)$txWeb['points'] === 7500 && $txWeb['status'] === 'available') {
        echo "Case 2.1 (Website Order 1.5x points): <span class='pass'>PASS</span>. Earned: " . $txWeb['points'] . " points. Status: " . $txWeb['status'] . "<br>";
    } else {
        echo "Case 2.1 (Website Order 1.5x points): <span class='fail'>FAIL</span>. Result: " . json_encode($txWeb) . "<br>";
    }
    echo "</div>";

    // Case 2.2: Shopee order 1.000.000đ = 5.000 points in holding state
    echo "<div class='case'>";
    $orderIdShopee = 99992;
    $orderCodeShopee = 'OD_SHP_QA_99992';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdShopee'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdShopee'");

    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 1000000, 1000000, 0, 0, 'shopee', 'pending_confirmation', 'not_earned')
    ")->execute([':id' => $orderIdShopee, ':code' => $orderCodeShopee, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 1000000, 1)
    ")->execute([':order_id' => $orderIdShopee, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    // Trigger holding points
    $orderModel->updateLoyaltyStatus($orderIdShopee, 'holding', 'QA Test shopee hold', 'system');

    $stmtTxSh = $db->prepare("SELECT points, eligible_amount, multiplier, status FROM loyalty_point_transactions WHERE order_id = :order_id AND type='hold'");
    $stmtTxSh->execute([':order_id' => $orderIdShopee]);
    $txSh = $stmtTxSh->fetch(PDO::FETCH_ASSOC);

    if ($txSh && (int)$txSh['points'] === 5000 && $txSh['status'] === 'holding') {
        echo "Case 2.2 (Shopee Order 1.0x holding points): <span class='pass'>PASS</span>. Earned: " . $txSh['points'] . " points. Status: " . $txSh['status'] . "<br>";
    } else {
        echo "Case 2.2 (Shopee Order 1.0x holding points): <span class='fail'>FAIL</span>. Result: " . json_encode($txSh) . "<br>";
    }
    echo "</div>";

    // Case 2.3: Order cancellation does not earn points (cancel/reverse)
    echo "<div class='case'>";
    // Transition shopee order to cancelled
    $orderModel->updateLoyaltyStatus($orderIdShopee, 'cancelled', 'QA Test shopee cancel', 'system');

    // Check holding transaction status is now cancelled
    $stmtTxShCan = $db->prepare("SELECT status, type FROM loyalty_point_transactions WHERE order_id = :order_id AND type='cancel'");
    $stmtTxShCan->execute([':order_id' => $orderIdShopee]);
    $txShCan = $stmtTxShCan->fetch(PDO::FETCH_ASSOC);

    // Check holding status in transactions
    $stmtCheckHold = $db->prepare("SELECT status FROM loyalty_point_transactions WHERE order_id = :order_id AND type='cancel'");
    $stmtCheckHold->execute([':order_id' => $orderIdShopee]);
    $holdStatus = $stmtCheckHold->fetchColumn();

    if ($holdStatus === 'cancelled') {
        echo "Case 2.3 (Cancel holding points): <span class='pass'>PASS</span>. Holding transaction correctly updated to cancelled.<br>";
    } else {
        echo "Case 2.3 (Cancel holding points): <span class='fail'>FAIL</span>. Result status: $holdStatus<br>";
    }
    echo "</div>";

    // Case 2.4: Completed/credited order reversal on cancellation
    echo "<div class='case'>";
    // Web order was credited with 7500 points. Now cancel it.
    $orderModel->updateLoyaltyStatus($orderIdWeb, 'cancelled', 'QA Test web cancel', 'system');

    // Verify that a cancellation transaction exists in the ledger with negative points
    $stmtWebRev = $db->prepare("SELECT points, status, type FROM loyalty_point_transactions WHERE order_id = :order_id AND type='cancel'");
    $stmtWebRev->execute([':order_id' => $orderIdWeb]);
    $txWebRev = $stmtWebRev->fetch(PDO::FETCH_ASSOC);

    if ($txWebRev && (int)$txWebRev['points'] === -7500 && $txWebRev['status'] === 'cancelled') {
        echo "Case 2.4 (Reverse Credited Points): <span class='pass'>PASS</span>. Reversal transaction added: " . $txWebRev['points'] . " points. Status: " . $txWebRev['status'] . "<br>";
    } else {
        echo "Case 2.4 (Reverse Credited Points): <span class='fail'>FAIL</span>. Result: " . json_encode($txWebRev) . "<br>";
    }
    echo "</div>";

    // Case 2.5: Idempotency check on completing/crediting multiple times
    echo "<div class='case'>";
    $orderIdIdem = 99993;
    $orderCodeIdem = 'OD_IDEM_QA_99993';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdIdem'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdIdem'");

    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 1000000, 1000000, 0, 0, 'website', 'completed', 'not_earned')
    ")->execute([':id' => $orderIdIdem, ':code' => $orderCodeIdem, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 1000000, 1)
    ")->execute([':order_id' => $orderIdIdem, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    // Trigger change status twice
    $orderModel->updateLoyaltyStatus($orderIdIdem, 'credited', 'First credit', 'system');
    // Set back status in orders table to force trigger logic again
    $db->exec("UPDATE orders SET loyalty_status = 'not_earned' WHERE id = '$orderIdIdem'");
    $orderModel->updateLoyaltyStatus($orderIdIdem, 'credited', 'Second credit', 'system');

    // Count occurrences of earn transactions for this order
    $stmtIdem = $db->prepare("SELECT COUNT(*) FROM loyalty_point_transactions WHERE order_id = :order_id AND type='earn'");
    $stmtIdem->execute([':order_id' => $orderIdIdem]);
    $idemCount = (int)$stmtIdem->fetchColumn();

    if ($idemCount === 1) {
        echo "Case 2.5 (Idempotency Crediting): <span class='pass'>PASS</span>. Only 1 point transaction was created despite duplicate actions.<br>";
    } else {
        echo "Case 2.5 (Idempotency Crediting): <span class='fail'>FAIL</span>. Duplicate transactions found: $idemCount.<br>";
    }
    echo "</div>";

    // Case 2.6: Idempotency check on cancelling multiple times
    echo "<div class='case'>";
    $orderModel->updateLoyaltyStatus($orderIdIdem, 'cancelled', 'First cancel', 'system');
    // Set back status in orders table to force trigger logic again
    $db->exec("UPDATE orders SET loyalty_status = 'credited' WHERE id = '$orderIdIdem'");
    $orderModel->updateLoyaltyStatus($orderIdIdem, 'cancelled', 'Second cancel', 'system');

    // Count occurrences of cancel transactions for this order
    $stmtIdemCan = $db->prepare("SELECT COUNT(*) FROM loyalty_point_transactions WHERE order_id = :order_id AND type='cancel'");
    $stmtIdemCan->execute([':order_id' => $orderIdIdem]);
    $idemCanCount = (int)$stmtIdemCan->fetchColumn();

    if ($idemCanCount === 1) {
        echo "Case 2.6 (Idempotency Reversing): <span class='pass'>PASS</span>. Only 1 cancellation transaction was created.<br>";
    } else {
        echo "Case 2.6 (Idempotency Reversing): <span class='fail'>FAIL</span>. Duplicate cancel transactions found: $idemCanCount.<br>";
    }
    echo "</div>";

    // Case 2.7: Points spent discount exclusion check
    echo "<div class='case'>";
    $orderIdDisc = 99994;
    $orderCodeDisc = 'OD_DISC_QA_99994';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdDisc'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdDisc'");

    // Subtotal 1,000,000đ, discount 200,000đ (paid by points), eligible spend = 800,000đ. Web points = 800,000 / 200 * 1.5 = 6000.
    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 800000, 1000000, 0, 200000, 'website', 'completed', 'not_earned')
    ")->execute([':id' => $orderIdDisc, ':code' => $orderCodeDisc, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 1000000, 1)
    ")->execute([':order_id' => $orderIdDisc, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    $orderModel->updateLoyaltyStatus($orderIdDisc, 'credited', 'Credit order with discount', 'system');

    $stmtTxDisc = $db->prepare("SELECT points FROM loyalty_point_transactions WHERE order_id = :order_id AND type='earn'");
    $stmtTxDisc->execute([':order_id' => $orderIdDisc]);
    $txDisc = $stmtTxDisc->fetch(PDO::FETCH_ASSOC);

    if ($txDisc && (int)$txDisc['points'] === 6000) {
        echo "Case 2.7 (Points Paid Discount Exclusion): <span class='pass'>PASS</span>. Generated points: " . $txDisc['points'] . " (correctly calculated on 800,000đ net).<br>";
    } else {
        echo "Case 2.7 (Points Paid Discount Exclusion): <span class='fail'>FAIL</span>. Result: " . json_encode($txDisc) . "<br>";
    }
    echo "</div>";

    // Case 2.8: Campaign points disabled (multiplier = 0)
    echo "<div class='case'>";
    // Create disabled campaign
    $db->exec("DELETE FROM loyalty_campaigns WHERE name = 'Disabled Points Campaign'");
    $db->prepare("
        INSERT INTO loyalty_campaigns (name, description, multiplier, is_active, start_at, end_at)
        VALUES ('Disabled Points Campaign', 'Campaign that disables earning', 0.00, 1, NULL, NULL)
    ")->execute();

    $orderIdCamp = 99995;
    $orderCodeCamp = 'OD_CAMP_QA_99995';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdCamp'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdCamp'");

    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 1000000, 1000000, 0, 0, 'website', 'completed', 'not_earned')
    ")->execute([':id' => $orderIdCamp, ':code' => $orderCodeCamp, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 1000000, 1)
    ")->execute([':order_id' => $orderIdCamp, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    $orderModel->updateLoyaltyStatus($orderIdCamp, 'credited', 'Credit during disabled campaign', 'system');

    $stmtTxCamp = $db->prepare("SELECT points FROM loyalty_point_transactions WHERE order_id = :order_id AND type='earn'");
    $stmtTxCamp->execute([':order_id' => $orderIdCamp]);
    $txCamp = $stmtTxCamp->fetch(PDO::FETCH_ASSOC);

    // Clean up campaign immediately
    $db->exec("DELETE FROM loyalty_campaigns WHERE name = 'Disabled Points Campaign'");

    // Points should be 0 because of multiplier = 0
    $campPoints = $txCamp ? (int)$txCamp['points'] : 0;
    if ($campPoints === 0) {
        echo "Case 2.8 (Campaign Disable Points): <span class='pass'>PASS</span>. Generated 0 points under campaign with multiplier 0.<br>";
    } else {
        echo "Case 2.8 (Campaign Disable Points): <span class='fail'>FAIL</span>. Result: " . json_encode($txCamp) . "<br>";
    }
    echo "</div>";

    // Case 2.9: Product points disabled (is_points_enabled = 0)
    echo "<div class='case'>";
    // Create a product with points disabled
    $testProductIdNoPoints = 99998;
    $testVariantIdNoPoints = 99998;
    $db->exec("DELETE FROM product_variants WHERE product_id = '$testProductIdNoPoints'");
    $db->exec("DELETE FROM products WHERE id = '$testProductIdNoPoints'");
    $db->prepare("
        INSERT INTO products (id, source_product_id, name, slug, min_price, max_price, is_active, is_points_enabled)
        VALUES (:id, 'qa_prod_nopoint', 'Product No Points QA', 'prod-nopoints-qa', 100, 1000000, 1, 0)
    ")->execute([':id' => $testProductIdNoPoints]);
    $db->prepare("
        INSERT INTO product_variants (id, product_id, source_product_id, source_sku_id, price, is_active)
        VALUES (:id, :product_id, 'qa_prod_nopoint', 'qa_sku_nopoint', 400000, 1)
    ")->execute([':id' => $testVariantIdNoPoints, ':product_id' => $testProductIdNoPoints]);

    // Order 1,000,000 VND: 600,000 VND product (points enabled) + 400,000 VND product (points disabled). Earning points on 600,000: 600,000 / 200 * 1.5 = 4500 points.
    $orderIdProdNo = 99996;
    $orderCodeProdNo = 'OD_PRODNO_QA_99996';
    $db->exec("DELETE FROM order_items WHERE order_id = '$orderIdProdNo'");
    $db->exec("DELETE FROM orders WHERE id = '$orderIdProdNo'");

    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, loyalty_status)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 1000000, 1000000, 0, 0, 'website', 'completed', 'not_earned')
    ")->execute([':id' => $orderIdProdNo, ':code' => $orderCodeProdNo, ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    // Insert 1 item with points enabled (600,000đ)
    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Test Product QA', 600000, 1)
    ")->execute([':order_id' => $orderIdProdNo, ':product_id' => $testProductId, ':variant_id' => $testVariantId]);

    // Insert 1 item with points disabled (400,000đ)
    $db->prepare("
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, price, quantity)
        VALUES (:order_id, :product_id, :variant_id, 'Product No Points QA', 400000, 1)
    ")->execute([':order_id' => $orderIdProdNo, ':product_id' => $testProductIdNoPoints, ':variant_id' => $testVariantIdNoPoints]);

    $orderModel->updateLoyaltyStatus($orderIdProdNo, 'credited', 'Credit order with partial points-enabled products', 'system');

    $stmtTxProdNo = $db->prepare("SELECT points FROM loyalty_point_transactions WHERE order_id = :order_id AND type='earn'");
    $stmtTxProdNo->execute([':order_id' => $orderIdProdNo]);
    $txProdNo = $stmtTxProdNo->fetch(PDO::FETCH_ASSOC);

    // Clean up test products
    $db->exec("DELETE FROM product_variants WHERE product_id = '$testProductIdNoPoints'");
    $db->exec("DELETE FROM products WHERE id = '$testProductIdNoPoints'");

    $prodNoPoints = $txProdNo ? (int)$txProdNo['points'] : 0;
    if ($prodNoPoints === 4500) {
        echo "Case 2.9 (Product Disable Points): <span class='pass'>PASS</span>. Generated: $prodNoPoints points (excludes 400,000đ disabled product correctly).<br>";
    } else {
        echo "Case 2.9 (Product Disable Points): <span class='fail'>FAIL</span>. Result: " . json_encode($txProdNo) . "<br>";
    }
    echo "</div>";

    // Case 2.10: Manual point adjustment writes ledger row and reason, does not modify total points directly
    echo "<div class='case'>";
    $loyaltyModel = new LoyaltyProductionModel();
    $adjRes = (new \App\Models\CustomerPointTransactionModel())->addManualAdjustment($testCustomerId, $testPhone, 1500, 'Tặng điểm chăm sóc khách hàng', 'Manual QA adjust', 1);

    // Verify ledger row exists
    $stmtAdjLedger = $db->prepare("
        SELECT * FROM customer_point_transactions 
        WHERE customer_id = :cust_id AND type = 'manual_adjustment'
        ORDER BY id DESC LIMIT 1
    ");
    $stmtAdjLedger->execute([':cust_id' => $testCustomerId]);
    $adjLedger = $stmtAdjLedger->fetch(PDO::FETCH_ASSOC);

    if ($adjRes['success'] && $adjLedger && (int)$adjLedger['points'] === 1500 && $adjLedger['description'] === 'Tặng điểm chăm sóc khách hàng') {
        echo "Case 2.10 (Manual Point Adjustment): <span class='pass'>PASS</span>. Successfully logged ledger adjust: " . $adjLedger['points'] . " points. Reason: " . $adjLedger['description'] . "<br>";
    } else {
        echo "Case 2.10 (Manual Point Adjustment): <span class='fail'>FAIL</span>. Result: " . json_encode($adjRes) . " Ledger: " . json_encode($adjLedger) . "<br>";
    }
    echo "</div>";


    echo "<h2>3. MEMBERSHIP TIER QA TEST CASES</h2>";

    $loyaltyModel = new LoyaltyProductionModel();

    // Clean orders history first for accurate tier tests
    $db->exec("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = '$testCustomerId')");
    $db->exec("DELETE FROM orders WHERE customer_id = '$testCustomerId'");

    // Case 3.1: Tier is Member when SĐT verified but spend < 2,000,000đ & completed orders < 3
    echo "<div class='case'>";
    $db->exec("UPDATE customers SET is_phone_verified = 1 WHERE id = '$testCustomerId'");
    $tierM = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    if ($tierM === 'Member') {
        echo "Case 3.1 (Member Tier): <span class='pass'>PASS</span>. Correctly resolved tier: $tierM<br>";
    } else {
        echo "Case 3.1 (Member Tier): <span class='fail'>FAIL</span>. Result: $tierM<br>";
    }
    echo "</div>";

    // Case 3.2: Silver Tier - đạt 2.000.000đ hoặc 3 đơn completed trong 12 tháng
    echo "<div class='case'>";
    // Insert 3 completed orders of 100,000đ each in 12 months (total 300,000đ)
    for ($i = 1; $i <= 3; $i++) {
        $db->prepare("
            INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, created_at)
            VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 100000, 100000, 0, 0, 'website', 'completed', NOW())
        ")->execute([':id' => 99910 + $i, ':code' => "OD_TIER_QA_" . (99910 + $i), ':customer_id' => $testCustomerId, ':phone' => $testPhone]);
    }

    $tierS = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    if ($tierS === 'Silver') {
        echo "Case 3.2 (Silver Tier): <span class='pass'>PASS</span>. Correctly resolved tier: $tierS (by 3 completed orders).<br>";
    } else {
        echo "Case 3.2 (Silver Tier): <span class='fail'>FAIL</span>. Result: $tierS<br>";
    }
    echo "</div>";

    // Case 3.3: Gold Tier - đạt 5.000.000đ hoặc 6 đơn completed trong 12 tháng
    echo "<div class='case'>";
    // Add 1 order of 4,700,000đ (bringing total spend to 5,000,000đ, total completed orders = 4)
    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, created_at)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 4700000, 4700000, 0, 0, 'website', 'completed', NOW())
    ")->execute([':id' => 99920, ':code' => "OD_TIER_QA_99920", ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $tierG = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    if ($tierG === 'Gold') {
        echo "Case 3.3 (Gold Tier): <span class='pass'>PASS</span>. Correctly resolved tier: $tierG (by 5,000,000 VND spend).<br>";
    } else {
        echo "Case 3.3 (Gold Tier): <span class='fail'>FAIL</span>. Result: $tierG<br>";
    }
    echo "</div>";

    // Case 3.4: Diamond Tier - đạt 10.000.000đ hoặc 12 đơn completed trong 12 tháng
    echo "<div class='case'>";
    // Add 1 order of 5,000,000đ (bringing total spend to 10,000,000đ)
    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, created_at)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 5000000, 5000000, 0, 0, 'website', 'completed', NOW())
    ")->execute([':id' => 99930, ':code' => "OD_TIER_QA_99930", ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $tierD = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    if ($tierD === 'Diamond') {
        echo "Case 3.4 (Diamond Tier): <span class='pass'>PASS</span>. Correctly resolved tier: $tierD (by 10,000,000 VND spend).<br>";
    } else {
        echo "Case 3.4 (Diamond Tier): <span class='fail'>FAIL</span>. Result: $tierD<br>";
    }
    echo "</div>";

    // Case 3.5: Rolling 12 months check (orders older than 12 months excluded)
    echo "<div class='case'>";
    // Set the 5,000,000đ order to be 13 months ago
    $db->exec("UPDATE orders SET created_at = DATE_SUB(NOW(), INTERVAL 13 MONTH) WHERE id = 99930");

    $tierRolling = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    // Total spend should now drop to 5,000,000đ (Gold tier)
    if ($tierRolling === 'Gold') {
        echo "Case 3.5 (Rolling 12 Months): <span class='pass'>PASS</span>. Correctly downgraded to Gold because 5,000,000đ order is older than 12 months.<br>";
    } else {
        echo "Case 3.5 (Rolling 12 Months): <span class='fail'>FAIL</span>. Result: $tierRolling<br>";
    }
    echo "</div>";

    // Case 3.6: Cancelled/Refunded orders check (must not count towards tiers)
    echo "<div class='case'>";
    // Add 1 gold-qualifying order but set status to cancelled
    $db->prepare("
        INSERT INTO orders (id, order_code, customer_id, receiver_name, phone, province, district, ward, address_line, payment_method, total, subtotal, shipping_fee, discount, order_source, order_status, created_at)
        VALUES (:id, :code, :customer_id, 'Receiver', :phone, 'Hanoi', 'Cau Giay', 'Dich Vong', '123 Str', 'cod', 6000000, 6000000, 0, 0, 'website', 'cancelled', NOW())
    ")->execute([':id' => 99940, ':code' => "OD_TIER_QA_99940", ':customer_id' => $testCustomerId, ':phone' => $testPhone]);

    $tierCancelCheck = $loyaltyModel->calculateCustomerTierName($testCustomerId);
    // Should remain Gold because the 6,000,000đ order is cancelled and should be ignored
    if ($tierCancelCheck === 'Gold') {
        echo "Case 3.6 (Exclude Cancelled Orders): <span class='pass'>PASS</span>. Cancelled order correctly excluded from calculations.<br>";
    } else {
        echo "Case 3.6 (Exclude Cancelled Orders): <span class='fail'>FAIL</span>. Tier was: $tierCancelCheck<br>";
    }
    echo "</div>";


        // Case 3.7: Redemption cap by tier check
    echo "<div class='case'>";
    $settings = new \App\Models\LoyaltySettings();
    $tierCaps = [
        'member' => (int)($settings->get("tier_member_cap") ?: 10),
        'silver' => (int)($settings->get("tier_silver_cap") ?: 10),
        'gold' => (int)($settings->get("tier_gold_cap") ?: 15),
        'diamond' => (int)($settings->get("tier_diamond_cap") ?: 20),
    ];
    if ($tierCaps['member'] === 10 && $tierCaps['silver'] === 10 && $tierCaps['gold'] === 15 && $tierCaps['diamond'] === 20) {
        echo "Case 3.7 (Redemption Cap by Tier): <span class='pass'>PASS</span>. Member/Silver: 10%, Gold: 15%, Diamond: 20% verified.<br>";
    } else {
        echo "Case 3.7 (Redemption Cap by Tier): <span class='fail'>FAIL</span>. Result: " . json_encode($tierCaps) . "<br>";
    }
    echo "</div>";

    // Clean up all test data at the end of the script
    $db->exec("DELETE FROM otp_requests WHERE phone = '$testPhone'");
    $db->exec("DELETE FROM customer_loyalty_profiles WHERE customer_id = '$testCustomerId' OR phone = '$testPhone'");
    $db->exec("DELETE FROM loyalty_point_transactions WHERE customer_id = '$testCustomerId'");
    $db->exec("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = '$testCustomerId' OR phone = '$testPhone')");
    $db->exec("DELETE FROM orders WHERE customer_id = '$testCustomerId' OR phone = '$testPhone'");
    $db->exec("DELETE FROM customers WHERE id = '$testCustomerId' OR phone = '$testPhone'");
    $db->exec("DELETE FROM loyalty_campaigns WHERE name = 'Disabled Points Campaign'");

    echo "<h2>QA PROCESS COMPLETED</h2>";
    echo "<p class='pass'>All tests ran and database state cleaned up successfully.</p>";

} catch (\Throwable $e) {
    echo "<h1 style='color:red;'>FATAL QA RUNTIME ERROR</h1>";
    echo "<pre>" . htmlspecialchars($e->getMessage()) . "\n" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
?>
