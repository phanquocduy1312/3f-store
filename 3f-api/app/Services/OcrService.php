<?php
namespace App\Services;

use Exception;
use CURLFile;

class OcrService {
    /**
     * Scans order image and extracts text & fields using OCR.space API.
     *
     * @param string $imagePath Absolute path to the image file.
     * @return array Extracted field mapping.
     */
    public function scanShopeeOrderImage(string $imagePath): array {
        try {
            // 1. Verify file exists
            if (!file_exists($imagePath)) {
                throw new Exception("File ảnh không tồn tại.");
            }

            // 1b. Optimize image if too large for OCR.space free tier (1MB limit)
            $ocrImagePath = $imagePath;
            $tmpPath = $imagePath . '_ocr.jpg';
            $isOptimized = false;

            if (filesize($imagePath) > 1000000) {
                if ($this->optimizeImageForOcr($imagePath, $tmpPath)) {
                    $ocrImagePath = $tmpPath;
                    $isOptimized = true;
                }
            }

            // 2. Call OCR.space API
            try {
                $response = $this->callOcrSpace($ocrImagePath);
            } finally {
                if ($isOptimized && file_exists($tmpPath)) {
                    @unlink($tmpPath);
                }
            }

            $rawText = "";
            if (
                isset($response["ParsedResults"][0]["ParsedText"]) &&
                is_string($response["ParsedResults"][0]["ParsedText"])
            ) {
                $rawText = $response["ParsedResults"][0]["ParsedText"];
            }

            // If rawText is empty, trigger fallback warnings instead of throwing exception
            if (trim($rawText) === "") {
                return [
                    "status"           => "failed",
                    "rawText"          => "",
                    "customerName"     => "",
                    "phone"            => "",
                    "email"            => "",
                    "shopeeOrderCode"  => "",
                    "orderAmount"      => 0,
                    "orderDate"        => "",
                    "orderStatus"      => "",
                    "shippingProvider" => "",
                    "trackingCode"     => "",
                    "confidence"       => 0,
                    "warnings"         => ["OCR không đọc được nội dung ảnh. Vui lòng nhập thủ công."],
                    "errorMessage"     => null
                ];
            }

            // 3. Parse fields
            return $this->parseShopeeOrderText($rawText);

        } catch (Exception $e) {
            // Log or print the error for backend debugging if necessary, but do not crash.
            // Return fallback structure so the user can enter manually.
            return [
                "status"           => "failed",
                "rawText"          => "",
                "customerName"     => "",
                "phone"            => "",
                "email"            => "",
                "shopeeOrderCode"  => "",
                "orderAmount"      => 0,
                "orderDate"        => "",
                "orderStatus"      => "",
                "shippingProvider" => "",
                "trackingCode"     => "",
                "confidence"       => 0,
                "warnings"         => ["Không quét được ảnh. Vui lòng nhập thủ công. (Chi tiết: " . $e->getMessage() . ")"],
                "errorMessage"     => $e->getMessage()
            ];
        }
    }

    /**
     * Calls OCR.space API using PHP cURL.
     */
    private function callOcrSpace(string $imagePath): array {
        $config = require dirname(__DIR__, 2) . "/config/config.php";
        
        if (empty($config["ocr"]) || empty($config["ocr"]["api_key"])) {
            throw new Exception("Chưa cấu hình OCR.space API key.");
        }
        
        $ocrConfig = $config["ocr"];

        $ch = curl_init($ocrConfig["endpoint"]);

        $postFields = [
            "file"              => new CURLFile($imagePath),
            "language"          => "vnm",
            "isOverlayRequired" => "false",
            "scale"             => "true",
            "detectOrientation" => "true",
            "OCREngine"         => "2"
        ];

        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_HTTPHEADER     => [
                "apikey: " . $ocrConfig["api_key"]
            ],
            CURLOPT_POSTFIELDS     => $postFields
        ]);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($curlError) {
            throw new Exception("OCR cURL error: " . $curlError);
        }

        if ($httpCode !== 200) {
            throw new Exception("OCR API HTTP error: " . $httpCode);
        }

        $decoded = json_decode($response, true);

        if (!$decoded) {
            throw new Exception("OCR API response is not valid JSON");
        }

        if (!empty($decoded["IsErroredOnProcessing"])) {
            $errorMessage = "OCR API processing error";

            if (!empty($decoded["ErrorMessage"])) {
                if (is_array($decoded["ErrorMessage"])) {
                    $errorMessage = implode(", ", $decoded["ErrorMessage"]);
                } else {
                    $errorMessage = $decoded["ErrorMessage"];
                }
            }

            throw new Exception($errorMessage);
        }

        return $decoded;
    }

    /**
     * Parses the raw OCR text into specific Shopee order fields.
     */
    private function isAddress(string $text): bool {
        $lower = mb_strtolower($text, 'UTF-8');
        $keywords = ['đường', 'phường', 'quận', 'huyện', 'tỉnh', 'thành', 'tp.', 'số', 'ngõ', 'hẻm', 'ấp', 'xã', 'đ/c', 'street', 'ward', 'district', 'city'];
        foreach ($keywords as $kw) {
            if (strpos($lower, $kw) !== false) {
                return true;
            }
        }
        if (preg_match('/\d+\/\d+/', $text)) {
            return true;
        }
        return false;
    }

    private function isExcludedLine(string $line): bool {
        $lower = mb_strtolower($line, 'UTF-8');
        $keywords = [
            'mã vận đơn', 'mã đơn hàng', 'ma van don', 'ma don hang', 
            'spx', 'barcode', 'tracking', 'hc-', 'sg', 'abc', 
            'mã vận', 'ma van', 'order id', 'mã đơn'
        ];
        foreach ($keywords as $kw) {
            if (strpos($lower, $kw) !== false) {
                return true;
            }
        }
        return false;
    }

    private function parseShopeeOrderText(string $rawText): array {
        // 1. Normalize text
        $lines = preg_split('/\r\n|\r|\n/', $rawText);
        $lines = array_values(array_filter(array_map('trim', $lines)));
        $normalizedText = preg_replace('/\s+/', ' ', $rawText);

        // 2. Parse trackingCode
        $trackingCode = "";
        foreach ($lines as $line) {
            if (preg_match('/(?:Mã\s*vận\s*đơn|Ma\s*van\s*don|Tracking)\s*[:-]?\s*([A-Z0-9]{8,30})/iu', $line, $matches)) {
                $trackingCode = trim($matches[1]);
                break;
            }
        }
        if (empty($trackingCode)) {
            if (preg_match('/(SPX[A-Z0-9]{8,30})/i', $normalizedText, $matches)) {
                $trackingCode = trim($matches[1]);
            }
        }

        // 3. Parse shopeeOrderCode
        $shopeeOrderCode = "";
        foreach ($lines as $line) {
            if (preg_match('/(?:Mã\s*đơn\s*hàng|Ma\s*don\s*hang|Mã\s*đơn\s*Shopee|Order\s*ID)\s*[:-]?\s*([A-Z0-9]{8,25})/iu', $line, $matches)) {
                $candidate = trim($matches[1]);
                $prefix = strtoupper(substr($candidate, 0, 3));
                if ($prefix !== 'SPX' && $prefix !== 'GHT' && $prefix !== 'GHN') {
                    $shopeeOrderCode = $candidate;
                    break;
                }
            }
        }
        if (empty($shopeeOrderCode)) {
            foreach ($lines as $idx => $line) {
                if (preg_match('/(?:Mã\s*đơn\s*hàng|Ma\s*don\s*hang|Mã\s*đơn\s*Shopee|Order\s*ID)/iu', $line)) {
                    $subStr = preg_split('/(?:Mã\s*đơn\s*hàng|Ma\s*don\s*hang|Mã\s*đơn\s*Shopee|Order\s*ID)/iu', $line, 2);
                    $searchArea = $subStr[1] ?? "";
                    if (trim($searchArea) === "" && isset($lines[$idx + 1])) {
                        $searchArea = $lines[$idx + 1];
                    }
                    if (preg_match_all('/([A-Z0-9]{8,25})/i', $searchArea, $tokens)) {
                        foreach ($tokens[1] as $token) {
                            $token = trim($token);
                            $prefix = strtoupper(substr($token, 0, 3));
                            if ($prefix !== 'SPX' && $prefix !== 'GHT' && $prefix !== 'GHN') {
                                $shopeeOrderCode = $token;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // 4. Recipient block detection for Phone and Customer Name
        $denIndex = -1;
        foreach ($lines as $idx => $line) {
            if (preg_match('/^(Đến|Den|Người nhận|Nguoi nhan)\b/iu', trim($line))) {
                $denIndex = $idx;
                break;
            }
        }

        $recipientBlock = [];
        if ($denIndex !== -1) {
            for ($i = 1; $i <= 6; $i++) {
                if (isset($lines[$denIndex + $i])) {
                    $recipientBlock[] = $lines[$denIndex + $i];
                }
            }
        }

        // 5. Parse Phone
        $phone = "";
        if (!empty($recipientBlock)) {
            foreach ($recipientBlock as $line) {
                if ($this->isExcludedLine($line)) {
                    continue;
                }
                if (preg_match_all('/(?:\+?84|0)[\d\s.-]{8,15}/', $line, $matches)) {
                    foreach ($matches[0] as $match) {
                        $normalized = $this->normalizePhone($match);
                        if (preg_match('/^0\d{8,10}$/', $normalized)) {
                            $phone = $normalized;
                            break 2;
                        }
                    }
                }
            }
        }
        if (empty($phone)) {
            foreach ($lines as $line) {
                if ($this->isExcludedLine($line)) {
                    continue;
                }
                if (preg_match_all('/(?:\+?84|0)[\d\s.-]{8,15}/', $line, $matches)) {
                    foreach ($matches[0] as $match) {
                        $normalized = $this->normalizePhone($match);
                        if (preg_match('/^0\d{8,10}$/', $normalized)) {
                            $phone = $normalized;
                            break 2;
                        }
                    }
                }
            }
        }

        // 6. Parse Customer Name
        $customerName = "";
        if ($denIndex !== -1) {
            $firstLine = $lines[$denIndex];
            $tempLine = preg_replace('/\([^)]*\)/', '', $firstLine);
            $tempLine = preg_replace('/^(Đến|Den)\s*[:-]?\s*/iu', '', $tempLine);
            $tempLine = trim(preg_replace('/\s+/', ' ', $tempLine));
            
            if ($tempLine !== "" && !$this->isAddress($tempLine) && !preg_match('/\d{8,}/', $tempLine)) {
                $customerName = $tempLine;
            } else {
                for ($i = 1; $i <= 3; $i++) {
                    if (isset($lines[$denIndex + $i])) {
                        $nextLine = $lines[$denIndex + $i];
                        $nextLineCleaned = preg_replace('/\([^)]*\)/', '', $nextLine);
                        $nextLineCleaned = trim(preg_replace('/\s+/', ' ', $nextLineCleaned));
                        
                        if ($nextLineCleaned !== "" && !$this->isAddress($nextLineCleaned) && !preg_match('/\d{8,}/', $nextLineCleaned)) {
                            $customerName = $nextLineCleaned;
                            break;
                        }
                    }
                }
            }
        }

        // 7. Parse Order Amount
        $orderAmount = 0;
        $amountLabels = [
            'tiền thu người nhận', 'tien thu nguoi nhan', 'tiền thu', 'tien thu',
            'cod', 'thu hộ', 'thu ho', 'thành tiền', 'thanh tien', 'tổng tiền',
            'tong tien', 'tổng cộng', 'tong cong', 'thanh toán', 'thanh toan'
        ];
        
        $amountLineIdx = -1;
        foreach ($lines as $idx => $line) {
            $lowerLine = mb_strtolower($line, 'UTF-8');
            foreach ($amountLabels as $label) {
                if (strpos($lowerLine, $label) !== false) {
                    $amountLineIdx = $idx;
                    break 2;
                }
            }
        }
        
        if ($amountLineIdx !== -1) {
            for ($i = 0; $i <= 3; $i++) {
                if (isset($lines[$amountLineIdx + $i])) {
                    $targetLine = $lines[$amountLineIdx + $i];
                    if (preg_match_all('/([0-9]{1,3}([.,][0-9]{3})+|[0-9]{5,9})\s*(VND|VNĐ|đ)?/iu', $targetLine, $matches)) {
                        foreach ($matches[0] as $match) {
                            $val = $this->normalizeMoney($match);
                            if ($val === 2022 || $val === 2023 || $val === 2024 || $val === 2025 || $val === 2026) {
                                continue;
                            }
                            if ($val > 0) {
                                $orderAmount = $val;
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // 8. Parse Order Date
        $orderDate = "";
        $dateLineIdx = -1;
        foreach ($lines as $idx => $line) {
            if (preg_match('/(?:Ngày đặt hàng|Ngay dat hang)/iu', $line)) {
                $dateLineIdx = $idx;
                break;
            }
        }
        
        if ($dateLineIdx !== -1) {
            for ($i = 0; $i <= 1; $i++) {
                if (isset($lines[$dateLineIdx + $i])) {
                    if (preg_match('/\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\b/', $lines[$dateLineIdx + $i], $matches)) {
                        $orderDate = $this->normalizeDate($matches[0]);
                        break;
                    }
                }
            }
        }
        if (empty($orderDate)) {
            if (preg_match('/\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\b/', $normalizedText, $matches)) {
                $orderDate = $this->normalizeDate($matches[0]);
            }
        }

        // 9. Parse Order Status
        $orderStatus = "";
        if (preg_match('/(?:COMPLETED|Hoàn thành|Đã giao)/iu', $normalizedText)) {
            $orderStatus = "COMPLETED";
        }

        // 10. Parse Shipping Provider
        $shippingProvider = "";
        if (preg_match('/(?:Shopee Express|SPX)/iu', $normalizedText)) {
            $shippingProvider = "Shopee Express";
        } elseif (preg_match('/(?:GiaoHangTietKiem|GHTK|Giao Hàng Tiết Kiệm)/iu', $normalizedText)) {
            $shippingProvider = "GHTK";
        } elseif (preg_match('/(?:GHN|Giao Hàng Nhanh)/iu', $normalizedText)) {
            $shippingProvider = "GHN";
        } elseif (!empty($trackingCode) && preg_match('/^\d+$/', $trackingCode)) {
            $shippingProvider = "GHTK";
        }

        // 11. Parse Email
        $email = "";
        if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $normalizedText, $matches)) {
            $email = trim($matches[0]);
        }

        // 12. Calculate Confidence
        $confidence = 30;
        if (!empty($phone)) $confidence += 25;
        if (!empty($shopeeOrderCode)) $confidence += 25;
        if ($orderAmount > 0) $confidence += 20;
        if (!empty($customerName)) $confidence += 10;
        if (!empty($trackingCode)) $confidence += 5;
        if (!empty($shippingProvider)) $confidence += 5;
        if ($confidence > 100) $confidence = 100;

        // 13. Build Warnings
        $warnings = [];
        if (empty($phone)) {
            $warnings[] = "Không nhận diện được SĐT người nhận. Vui lòng nhập thủ công.";
        }
        if (empty($shopeeOrderCode)) {
            $warnings[] = "Không nhận diện được mã đơn hàng Shopee.";
        }
        if ($orderAmount <= 0) {
            $warnings[] = "Không nhận diện được tiền thu người nhận/tổng tiền đơn.";
        }
        if (!empty($trackingCode) && empty($shopeeOrderCode)) {
            $warnings[] = "Đã nhận diện được mã vận đơn nhưng chưa nhận diện được mã đơn hàng Shopee.";
        }

        return [
            "status"           => "success",
            "rawText"          => $rawText,
            "customerName"     => $customerName,
            "phone"            => $phone,
            "email"            => $email,
            "shopeeOrderCode"  => $shopeeOrderCode,
            "orderAmount"      => $orderAmount,
            "orderDate"        => $orderDate,
            "orderStatus"      => $orderStatus,
            "shippingProvider" => $shippingProvider,
            "trackingCode"     => $trackingCode,
            "confidence"       => $confidence,
            "warnings"         => $warnings,
            "errorMessage"     => null
        ];
    }

    /**
     * Normalizes a phone string by stripping non-digit characters.
     */
    private function normalizePhone(?string $phone): string {
        if ($phone === null) return "";
        $cleaned = preg_replace('/[^\d]/', '', $phone);
        if (strpos($cleaned, '84') === 0 && (strlen($cleaned) === 11 || strlen($cleaned) === 12)) {
            $cleaned = '0' . substr($cleaned, 2);
        }
        return $cleaned;
    }

    /**
     * Normalizes money representation into a clean integer.
     */
    private function normalizeMoney(?string $money): int {
        if ($money === null || $money === "") return 0;
        $cleaned = preg_replace('/[^\d]/', '', $money);
        return (int)$cleaned;
    }

    /**
     * Converts dd/mm/yyyy or dd-mm-yyyy dates into yyyy-mm-dd format.
     */
    private function normalizeDate(?string $date): string {
        if ($date === null || $date === "") return "";
        $date = trim($date);
        if (preg_match('/(\d{1,2})[\\/-](\d{1,2})[\\/-](\d{4})/', $date, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
            $year = $matches[3];
            return "{$year}-{$month}-{$day}";
        }
        return "";
    }

    /**
     * Compresses the image for OCR to prevent 413 Payload Too Large.
     */
    private function optimizeImageForOcr(string $sourcePath, string $destinationPath): bool {
        if (!function_exists('imagecreatefromstring')) {
            return false;
        }

        $info = getimagesize($sourcePath);
        if (!$info) return false;

        $mime = $info['mime'];
        $image = null;

        if ($mime == 'image/jpeg') {
            $image = @imagecreatefromjpeg($sourcePath);
            if ($image && function_exists('exif_read_data')) {
                $exif = @exif_read_data($sourcePath);
                if (!empty($exif['Orientation'])) {
                    switch ($exif['Orientation']) {
                        case 3: $image = imagerotate($image, 180, 0); break;
                        case 6: $image = imagerotate($image, -90, 0); break;
                        case 8: $image = imagerotate($image, 90, 0); break;
                    }
                }
            }
        } elseif ($mime == 'image/png') {
            $image = @imagecreatefrompng($sourcePath);
        } elseif ($mime == 'image/webp') {
            $image = @imagecreatefromwebp($sourcePath);
        }

        if (!$image) return false;

        $width = imagesx($image);
        $height = imagesy($image);

        // Resize if width is larger than 1200px
        if ($width > 1200) {
            $newWidth = 1200;
            $newHeight = floor($height * ($newWidth / $width));
            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            if ($mime == 'image/png') {
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
            }
            
            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $newImage;
        }

        // Save as JPEG with 75% quality to significantly reduce size
        $success = false;
        if ($mime == 'image/png') {
             // Convert to jpeg to save space
             $bg = imagecreatetruecolor(imagesx($image), imagesy($image));
             imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
             imagealphablending($bg, TRUE);
             imagecopy($bg, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
             $success = imagejpeg($bg, $destinationPath, 75);
             imagedestroy($bg);
        } else {
             $success = imagejpeg($image, $destinationPath, 75);
        }
        
        imagedestroy($image);
        return $success;
    }
}
