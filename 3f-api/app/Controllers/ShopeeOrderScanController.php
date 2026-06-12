<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Core\Database;
use App\Services\UploadService;
use App\Services\OcrService;
use App\Models\UploadedOrderImage;
use App\Models\OrderImageScan;
use Exception;

class ShopeeOrderScanController {
    /**
     * Handles POST /api/shopee/order-scan
     */
    public function scan() {
        $file = Request::file('image');
        if (!$file) {
            Response::json(["success" => false, "message" => "Thiếu file ảnh đơn hàng"], 400);
        }

        $dbConnection = Database::getInstance()->getConnection();

        try {
            // 1. Upload receipt to storage
            $uploadResult = UploadService::uploadOrderImage($file);

            $dbConnection->beginTransaction();

            // 2. Insert image metadata
            $imageModel = new UploadedOrderImage();
            $imageId = $imageModel->create([
                "original_filename" => $uploadResult['original_filename'],
                "stored_filename"   => $uploadResult['stored_filename'],
                "file_path"         => $uploadResult['file_path'],
                "file_url"          => $uploadResult['file_url'],
                "mime_type"         => $uploadResult['mime_type'],
                "file_size"         => $uploadResult['file_size']
            ]);

            // 3. Scan image via OCR.space API
            $ocrService = new OcrService();
            $ocrResult = $ocrService->scanShopeeOrderImage($uploadResult['file_path']);

            // 4. Save scan result (even if failed, we commit the image metadata and failed log for admin debugging)
            $scanModel = new OrderImageScan();
            $scanId = $scanModel->create([
                "image_id"                    => $imageId,
                "scan_status"                 => $ocrResult['status'],
                "raw_text"                    => $ocrResult['rawText'],
                "extracted_customer_name"     => $ocrResult['customerName'],
                "extracted_phone"             => $ocrResult['phone'],
                "extracted_email"             => $ocrResult['email'],
                "extracted_order_code"        => $ocrResult['shopeeOrderCode'],
                "extracted_order_amount"      => $ocrResult['orderAmount'],
                "extracted_order_date"        => !empty($ocrResult['orderDate']) ? $ocrResult['orderDate'] : null,
                "extracted_order_status"      => $ocrResult['orderStatus'],
                "extracted_shipping_provider" => $ocrResult['shippingProvider'],
                "extracted_tracking_code"     => $ocrResult['trackingCode'],
                "confidence"                  => $ocrResult['confidence'],
                "warnings"                    => json_encode($ocrResult['warnings'], JSON_UNESCAPED_UNICODE),
                "error_message"               => $ocrResult['errorMessage'],
                "ocr_provider"                => "ocr_space"
            ]);

            $dbConnection->commit();

            $isSuccess = ($ocrResult['status'] === 'success');
            
            Response::json([
                "success"    => $isSuccess,
                "message"    => $isSuccess ? "Quét ảnh thành công" : "Không quét được ảnh. Vui lòng nhập thủ công.",
                "imageId"    => $imageId,
                "scanId"     => $scanId,
                "imageUrl"   => $uploadResult['file_url'],
                "fields"     => [
                    "customerName"     => $ocrResult['customerName'],
                    "phone"            => $ocrResult['phone'],
                    "email"            => $ocrResult['email'],
                    "shopeeOrderCode"  => $ocrResult['shopeeOrderCode'],
                    "orderAmount"      => $ocrResult['orderAmount'],
                    "orderDate"        => $ocrResult['orderDate'],
                    "orderStatus"      => $ocrResult['orderStatus'],
                    "shippingProvider" => $ocrResult['shippingProvider'],
                    "trackingCode"     => $ocrResult['trackingCode']
                ],
                "confidence" => $ocrResult['confidence'],
                "warnings"   => $ocrResult['warnings']
            ], 200);

        } catch (Exception $e) {
            if ($dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 400);
        }
    }
}
