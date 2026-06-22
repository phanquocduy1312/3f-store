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

// Load environment variables manually
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            putenv(trim($parts[0]) . "=" . trim($parts[1]));
        }
    }
}

header('Content-Type: text/plain; charset=utf-8');

$phone = "0909913889";
$message = "Ma OTP 3F Store cua ban la: 888888. Hieu luc trong 5 phut. Khong chia se ma nay cho bat ky ai.";

echo "--- Stringee Real OTP Test ---\n";
echo "Phone: " . $phone . "\n";
echo "Message: " . $message . "\n\n";

try {
    $provider = new \App\Services\Otp\StringeeOtpProvider();
    $result = $provider->sendOtp($phone, $message);

    echo "Success: " . ($result->success ? "YES" : "NO") . "\n";
    echo "Provider: " . $result->provider . "\n";
    echo "Message ID: " . ($result->messageId ?: "NULL") . "\n";
    echo "Error Message: " . ($result->errorMessage ?: "NULL") . "\n";
    echo "Raw Response: " . ($result->rawResponse ?: "NULL") . "\n";
} catch (Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
