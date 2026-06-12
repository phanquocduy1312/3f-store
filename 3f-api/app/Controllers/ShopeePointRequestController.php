<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Core\Database;
use App\Services\ValidationService;
use App\Services\PointService;
use App\Models\ShopeePointRequest;
use App\Models\UploadedOrderImage;
use App\Models\OrderImageScan;
use Exception;

class ShopeePointRequestController {
    /**
     * Handles POST /api/shopee/requests
     */
    public function create() {
        $input = Request::json();
        
        $phoneRaw = isset($input['phone']) ? $input['phone'] : '';
        $phone = ValidationService::normalizePhone($phoneRaw);
        
        $email = ValidationService::sanitizeText(isset($input['email']) ? $input['email'] : '');
        $customerName = ValidationService::sanitizeText(isset($input['customerName']) ? $input['customerName'] : '');
        $zalo = ValidationService::sanitizeText(isset($input['zalo']) ? $input['zalo'] : '');
        $shopeeOrderCode = ValidationService::sanitizeText(isset($input['shopeeOrderCode']) ? $input['shopeeOrderCode'] : '');
        $orderAmountRaw = isset($input['orderAmount']) ? $input['orderAmount'] : 0;
        $imageId = !empty($input['imageId']) ? (int)$input['imageId'] : null;
        $scanId = !empty($input['scanId']) ? (int)$input['scanId'] : null;

        // Validation
        if (empty($phoneRaw) || !ValidationService::isValidVietnamPhone($phoneRaw)) {
            Response::json(["success" => false, "message" => "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có từ 9 đến 11 chữ số."], 400);
        }

        if (!ValidationService::isValidEmailOptional($email)) {
            Response::json(["success" => false, "message" => "Email không đúng định dạng."], 400);
        }

        if (empty($shopeeOrderCode)) {
            Response::json(["success" => false, "message" => "Mã đơn Shopee không được để trống."], 400);
        }

        $amount = ValidationService::normalizeMoney($orderAmountRaw);
        if ($amount <= 0) {
            Response::json(["success" => false, "message" => "Số tiền đơn hàng phải lớn hơn 0."], 400);
        }

        $expectedPoints = PointService::calculateShopeePoints($amount);

        try {
            $requestModel = new ShopeePointRequest();

            // Check duplicate
            $duplicate = $requestModel->findDuplicateActiveOrderCode($shopeeOrderCode);
            if ($duplicate) {
                Response::json([
                    "success" => false,
                    "message" => "Mã đơn Shopee này đã được gửi yêu cầu tích điểm trước đó.",
                    "code"    => "DUPLICATE_ORDER_CODE"
                ], 400);
            }

            // Create Request
            $requestId = $requestModel->create([
                "customer_name"     => $customerName,
                "phone"              => $phone,
                "email"              => $email,
                "zalo"               => $zalo,
                "shopee_order_code" => $shopeeOrderCode,
                "order_amount"      => $amount,
                "expected_points"   => $expectedPoints,
                "image_id"           => $imageId,
                "scan_id"            => $scanId,
                "source"             => "customer_form"
            ]);

            Response::json([
                "success"          => true,
                "message"          => "3F đã nhận yêu cầu tích điểm từ đơn Shopee của bạn.",
                "requestId"        => $requestId,
                "expectedPoints"   => $expectedPoints,
                "processingStatus" => "pending"
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Handles GET /api/admin/shopee/requests
     */
    public function list() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1) $page = 1;
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        if ($limit < 1) $limit = 20;
        if ($limit > 100) $limit = 100;
        
        $offset = ($page - 1) * $limit;

        $filters = [
            "status"       => Request::query('status'),
            "verification" => Request::query('verification'),
            "phone"        => Request::query('phone') ? ValidationService::normalizePhone(Request::query('phone')) : null,
            "keyword"      => Request::query('keyword'),
            "limit"        => $limit,
            "offset"       => $offset
        ];

        try {
            $requestModel = new ShopeePointRequest();
            $total = $requestModel->count($filters);
            $rows = $requestModel->list($filters);

            $data = [];
            foreach ($rows as $row) {
                $data[] = [
                    "id"                 => (int)$row['id'],
                    "customerName"       => $row['customer_name'] ?? null,
                    "phone"              => $row['phone'] ?? null,
                    "email"              => $row['email'] ?? null,
                    "zalo"               => $row['zalo'] ?? null,
                    "shopeeOrderCode"    => $row['shopee_order_code'] ?? null,
                    "orderAmount"        => isset($row['order_amount']) ? (int)$row['order_amount'] : 0,
                    "expectedPoints"     => isset($row['expected_points']) ? (int)$row['expected_points'] : 0,
                    "approvedPoints"     => isset($row['approved_points']) ? (int)$row['approved_points'] : 0,
                    "processingStatus"   => $row['processing_status'] ?? null,
                    "verificationStatus" => $row['verification_status'] ?? null,
                    "imageUrl"           => $row['imageUrl'] ?? null,
                    "createdAt"          => $row['created_at'] ?? null
                ];
            }

            $totalPages = (int)ceil($total / $limit);

            Response::json([
                "success"    => true,
                "data"       => $data,
                "pagination" => [
                    "page"       => $page,
                    "limit"      => $limit,
                    "total"      => $total,
                    "totalPages" => $totalPages
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Handles GET /api/admin/shopee/requests/detail
     */
    public function detail() {
        $id = (int)Request::query('id', 0);
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID yêu cầu không hợp lệ"], 400);
        }

        try {
            $requestModel = new ShopeePointRequest();
            $request = $requestModel->findById($id);

            if (!$request) {
                Response::json(["success" => false, "message" => "Yêu cầu tích điểm không tồn tại"], 404);
            }

            $requestData = [
                "id"                 => (int)$request['id'],
                "customerName"       => $request['customer_name'] ?? null,
                "phone"              => $request['phone'] ?? null,
                "email"              => $request['email'] ?? null,
                "zalo"               => $request['zalo'] ?? null,
                "shopeeOrderCode"    => $request['shopee_order_code'] ?? null,
                "orderAmount"        => isset($request['order_amount']) ? (int)$request['order_amount'] : 0,
                "expectedPoints"     => isset($request['expected_points']) ? (int)$request['expected_points'] : 0,
                "approvedPoints"     => isset($request['approved_points']) ? (int)$request['approved_points'] : 0,
                "processingStatus"   => $request['processing_status'] ?? null,
                "verificationStatus" => $request['verification_status'] ?? null,
                "adminNote"          => $request['admin_note'] ?? null,
                "rejectedReason"     => $request['rejected_reason'] ?? null,
                "createdAt"          => $request['created_at'] ?? null,
                "updatedAt"          => $request['updated_at'] ?? null,
                "approvedAt"         => $request['approved_at'] ?? null,
                "rejectedAt"         => $request['rejected_at'] ?? null,
                "image"              => null,
                "scan"               => null
            ];

            if (!empty($request['image_id'])) {
                $imageModel = new UploadedOrderImage();
                $image = $imageModel->findById($request['image_id']);
                if ($image) {
                    $requestData['image'] = [
                        "id"               => (int)$image['id'],
                        "originalFilename" => $image['original_filename'],
                        "storedFilename"   => $image['stored_filename'],
                        "filePath"         => $image['file_path'],
                        "fileUrl"          => $image['file_url'],
                        "mimeType"         => $image['mime_type'],
                        "fileSize"         => (int)$image['file_size']
                    ];
                }
            }

            if (!empty($request['scan_id'])) {
                $scanModel = new OrderImageScan();
                $scan = $scanModel->findById($request['scan_id']);
                if ($scan) {
                    $warnings = json_decode($scan['warnings'], true) ?: [];
                    $requestData['scan'] = [
                        "id"                        => (int)$scan['id'],
                        "scanStatus"                => $scan['scan_status'],
                        "rawText"                   => $scan['raw_text'],
                        "extractedCustomerName"     => $scan['extracted_customer_name'],
                        "extractedPhone"            => $scan['extracted_phone'],
                        "extractedEmail"            => $scan['extracted_email'],
                        "extractedOrderCode"        => $scan['extracted_order_code'],
                        "extractedOrderAmount"      => $scan['extracted_order_amount'] !== null ? (int)$scan['extracted_order_amount'] : null,
                        "extractedOrderDate"        => $scan['extracted_order_date'],
                        "extractedOrderStatus"      => $scan['extracted_order_status'],
                        "extractedShippingProvider" => $scan['extracted_shipping_provider'],
                        "extractedTrackingCode"     => $scan['extracted_tracking_code'],
                        "confidence"                => (int)$scan['confidence'],
                        "warnings"                  => $warnings,
                        "ocrProvider"               => $scan['ocr_provider']
                    ];
                }
            }

            Response::json(["success" => true, "data" => $requestData], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Handles POST /api/admin/shopee/requests/approve
     */
    public function approve() {
        $input = Request::json();
        $requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;
        $adminNote = ValidationService::sanitizeText(isset($input['adminNote']) ? $input['adminNote'] : '');

        if ($requestId <= 0) {
            Response::json(["success" => false, "message" => "ID yêu cầu không hợp lệ"], 400);
        }

        $dbConnection = Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $requestModel = new ShopeePointRequest();
            $request = $requestModel->findById($requestId);

            if (!$request) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Yêu cầu tích điểm không tồn tại"], 404);
            }

            if ($request['processing_status'] === 'approved') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Yêu cầu này đã được duyệt trước đó"], 400);
            }

            if ($request['processing_status'] === 'rejected') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Không thể duyệt yêu cầu đã bị từ chối"], 400);
            }

            // Check approved duplicate
            $approvedDuplicate = $requestModel->hasApprovedOrderCode($request['shopee_order_code']);
            if ($approvedDuplicate && $approvedDuplicate['id'] != $requestId) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Mã đơn Shopee này đã được duyệt ở yêu cầu khác."], 400);
            }

            $verificationStatus = $request['verification_status'];
            if ($verificationStatus === 'not_checked') {
                $verificationStatus = 'valid';
            }

            $requestModel->approve($requestId, [
                "verification_status" => $verificationStatus,
                "approved_points"     => $request['expected_points'],
                "admin_note"          => $adminNote
            ]);

            $dbConnection->commit();

            Response::json([
                "success"        => true,
                "message"        => "Đã duyệt yêu cầu và cộng điểm.",
                "approvedPoints" => (int)$request['expected_points']
            ], 200);

        } catch (Exception $e) {
            if ($dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Handles POST /api/admin/shopee/requests/reject
     */
    public function reject() {
        $input = Request::json();
        $requestId = isset($input['requestId']) ? (int)$input['requestId'] : 0;
        $reason = ValidationService::sanitizeText(isset($input['reason']) ? $input['reason'] : '');

        if ($requestId <= 0) {
            Response::json(["success" => false, "message" => "ID yêu cầu không hợp lệ"], 400);
        }

        if (empty($reason)) {
            Response::json(["success" => false, "message" => "Lý do từ chối không được để trống"], 400);
        }

        $dbConnection = Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $requestModel = new ShopeePointRequest();
            $request = $requestModel->findById($requestId);

            if (!$request) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Yêu cầu tích điểm không tồn tại"], 404);
            }

            if ($request['processing_status'] === 'approved') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Không thể từ chối yêu cầu đã được duyệt"], 400);
            }

            $requestModel->reject($requestId, $reason);

            $dbConnection->commit();

            Response::json(["success" => true, "message" => "Đã từ chối yêu cầu tích điểm."], 200);

        } catch (Exception $e) {
            if ($dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }
}
