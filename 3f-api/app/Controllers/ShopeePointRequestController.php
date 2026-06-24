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
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;
use Exception;

class ShopeePointRequestController {
    /**
     * Handles POST /api/shopee/requests
     */
    public function create() {
        $input = Request::json();
        
        $token = AuthMiddleware::extractBearerToken();
        
        $phone = null;
        $customerId = null;
        $source = "guest";
        $customerName = ValidationService::sanitizeText(isset($input['customerName']) ? $input['customerName'] : '');
        
        if (!empty($token)) {
            // Logged-in Customer Flow
            $customer = AuthMiddleware::requireCustomer();
            
            $phoneRaw = isset($input['phone']) ? $input['phone'] : '';
            $phone = !empty($customer['phone']) ? $customer['phone'] : ValidationService::normalizePhone($phoneRaw);
            
            if (empty($phone)) {
                Response::json(["success" => false, "message" => "Vui lòng cung cấp số điện thoại"], 400);
            }

            $customerId = $customer['id'];
            $source = "customer";
            // Use customer's name from profile
            $customerName = $customer['full_name'] ?? $customer['name'] ?? $customerName;
        } else {
            // Guest Flow
            $phoneRaw = isset($input['phone']) ? $input['phone'] : '';
            
            if (empty($phoneRaw)) {
                Response::json(["success" => false, "message" => "Vui lòng nhập số điện thoại"], 400);
            }
            
            $phone = ValidationService::normalizePhone($phoneRaw);
            
            $source = "guest";
            $customerId = null;
        }
        
        $email = ValidationService::sanitizeText(isset($input['email']) ? $input['email'] : '');
        $zalo = ValidationService::sanitizeText(isset($input['zalo']) ? $input['zalo'] : '');
        $shopeeOrderCode = ValidationService::sanitizeText(isset($input['shopeeOrderCode']) ? $input['shopeeOrderCode'] : '');
        $shopeeOrderCode = strtoupper(trim($shopeeOrderCode));
        $orderAmountRaw = isset($input['orderAmount']) ? $input['orderAmount'] : 0;
        $imageId = !empty($input['imageId']) ? (int)$input['imageId'] : null;
        $scanId = !empty($input['scanId']) ? (int)$input['scanId'] : null;

        if (!empty($email) && !ValidationService::isValidEmailOptional($email)) {
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
                "phone"             => $phone,
                "customer_id"       => $customerId,
                "email"             => $email,
                "zalo"              => $zalo,
                "shopee_order_code" => $shopeeOrderCode,
                "order_amount"      => $amount,
                "expected_points"   => $expectedPoints,
                "image_id"          => $imageId,
                "scan_id"           => $scanId,
                "source"            => $source,
                "otp_verified"      => 0,
                "otp_verified_at"   => null,
                "otp_provider"      => null
            ]);

            try {
                (new \App\Models\AdminNotification())->createNotification(
                    "Yêu cầu Shopee mới",
                    "Khách hàng " . $customerName . " (" . $phone . ") vừa gửi yêu cầu tích điểm cho đơn Shopee #" . $shopeeOrderCode,
                    "shopee_request",
                    "shopee_point_request",
                    $requestId
                );
            } catch (\Throwable $notiEx) {
                error_log("Failed to create admin notification for shopee request: " . $notiEx->getMessage());
            }

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
                    "customerId"         => $row['customer_id'] ?? null,
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
                    "matchedShopeeOrderId" => $row['matched_shopee_order_id'] ?? null,
                    "shopeeApiStatus"      => $row['shopee_api_status'] ?? null,
                    "shopeeApiOrderAmount" => isset($row['shopee_api_order_amount']) ? (int)$row['shopee_api_order_amount'] : null,
                    "verifiedAt"           => $row['verified_at'] ?? null,
                    "verificationNote"     => $row['verification_note'] ?? null,
                    "source"             => $row['source'] ?? null,
                    "imageUrl"           => $row['imageUrl'] ?? null,
                    "createdAt"          => $row['created_at'] ?? null,
                    "otpVerified"        => isset($row['otp_verified']) ? (int)$row['otp_verified'] : 0,
                    "otpVerifiedAt"      => $row['otp_verified_at'] ?? null,
                    "otpProvider"        => $row['otp_provider'] ?? null
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
                "matchedShopeeOrderId" => $request['matched_shopee_order_id'] ?? null,
                "shopeeApiStatus"      => $request['shopee_api_status'] ?? null,
                "shopeeApiOrderAmount" => isset($request['shopee_api_order_amount']) ? (int)$request['shopee_api_order_amount'] : null,
                "shopeeApiRawJson"     => $request['shopee_api_raw_json'] ?? null,
                "verifiedAt"           => $request['verified_at'] ?? null,
                "verificationNote"     => $request['verification_note'] ?? null,
                "adminNote"          => $request['admin_note'] ?? null,
                "rejectedReason"     => $request['rejected_reason'] ?? null,
                "createdAt"          => $request['created_at'] ?? null,
                "updatedAt"          => $request['updated_at'] ?? null,
                "approvedAt"         => $request['approved_at'] ?? null,
                "rejectedAt"         => $request['rejected_at'] ?? null,
                "otpVerified"        => isset($request['otp_verified']) ? (int)$request['otp_verified'] : 0,
                "otpVerifiedAt"      => $request['otp_verified_at'] ?? null,
                "otpProvider"        => $request['otp_provider'] ?? null,
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

            // Lock request row FOR UPDATE
            $stmt = $dbConnection->prepare("SELECT * FROM shopee_point_requests WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $requestId]);
            $request = $stmt->fetch();

            if (!$request) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Yêu cầu tích điểm không tồn tại"], 404);
            }

            if ($request['processing_status'] === 'approved') {
                $dbConnection->rollBack();
                Response::json(["success" => true, "message" => "Yêu cầu đã được duyệt trước đó"], 200);
            }

            if ($request['processing_status'] === 'rejected') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Không thể duyệt yêu cầu đã bị từ chối"], 400);
            }

            // Check if valid
            $verificationStatus = $request['verification_status'];
            // Bỏ qua check valid cứng để admin có thể duyệt thủ công các đơn test (hoặc khi Shopee API lỗi)
            // if ($verificationStatus !== 'valid') {
            //     $dbConnection->rollBack();
            //     Response::json(["success" => false, "message" => "Chỉ có thể duyệt những yêu cầu đã được xác thực (valid)."], 400);
            // }

            // Check shopee_point_awards duplicate to enforce global order code uniqueness
            $stmtAwards = $dbConnection->prepare("SELECT id FROM shopee_point_awards WHERE shopee_order_code = :code LIMIT 1");
            $stmtAwards->execute([':code' => $request['shopee_order_code']]);
            if ($stmtAwards->fetch()) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Đơn Shopee này đã được cộng điểm."], 400);
            }

            // Dùng số tiền từ Shopee nếu có, không thì fallback về số tiền người dùng nhập
            $verifiedAmount = isset($request['shopee_api_order_amount']) && (int)$request['shopee_api_order_amount'] > 0 
                                ? (int)$request['shopee_api_order_amount'] 
                                : (int)$request['order_amount'];
                                
            if ($verifiedAmount <= 0) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Không tìm thấy số tiền hợp lệ để tính điểm."], 400);
            }

            // Strict point calculation: FLOOR(verifiedAmount / 10000)
            $approvedPoints = (int)floor($verifiedAmount / 10000);
            $pointPreview = ['finalPoints' => $approvedPoints, 'note' => 'Strict FLOOR(verified_amount / 10000)'];

            $requestModel = new ShopeePointRequest();
            $requestModel->approve($requestId, [
                "verification_status" => $verificationStatus,
                "approved_points"     => $approvedPoints,
                "admin_note"          => $adminNote
            ]);

            // Ghi nhận transaction lịch sử điểm
            $transactionModel = new \App\Models\CustomerPointTransactionModel();
            $transactionId = $transactionModel->addTransaction(
                $request['phone'],
                'earn_shopee_order',
                $approvedPoints,
                null,
                'shopee_point_request',
                $requestId,
                'Tích điểm từ đơn Shopee #' . $request['shopee_order_code']
            );

            // Insert into shopee_point_awards
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;

            $stmtInsertAward = $dbConnection->prepare("
                INSERT INTO shopee_point_awards (
                    request_id, shopee_order_code, customer_id, phone, 
                    verified_amount, points_awarded, point_transaction_id,
                    approved_by_admin_id, environment, is_legacy
                ) VALUES (
                    :request_id, :code, :customer_id, :phone, 
                    :verified_amount, :points_awarded, :point_tx_id,
                    :admin_id, :environment, 0
                )
            ");
            $stmtInsertAward->execute([
                ':request_id'      => $requestId,
                ':code'            => $request['shopee_order_code'],
                ':customer_id'     => $request['customer_id'] ?? null,
                ':phone'           => $request['phone'],
                ':verified_amount' => $verifiedAmount,
                ':points_awarded'  => $approvedPoints,
                ':point_tx_id'     => $transactionId,
                ':admin_id'        => $adminId,
                ':environment'     => getenv('SHOPEE_ENV') ?: 'sandbox'
            ]);

            $dbConnection->commit();

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'approve_shopee_request', 'shopee_point_requests', $requestId, [
                'shopee_order_code' => $request['shopee_order_code'],
                'phone' => $request['phone'],
                'approved_points' => $approvedPoints
            ]);

            Response::json([
                "success"        => true,
                "message"        => "Đã duyệt yêu cầu và cộng điểm.",
                "approvedPoints" => $approvedPoints,
                "pointBreakdown" => $pointPreview
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
        $reasonCode = ValidationService::sanitizeText(isset($input['reasonCode']) ? $input['reasonCode'] : 'other');
        $reasonText = ValidationService::sanitizeText(isset($input['reason']) ? $input['reason'] : '');

        if ($requestId <= 0) {
            Response::json(["success" => false, "message" => "ID yêu cầu không hợp lệ"], 400);
        }

        if (empty($reasonText) || empty($reasonCode)) {
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

            $requestModel->reject($requestId, $reasonCode, $reasonText);

            $dbConnection->commit();

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'reject_shopee_request', 'shopee_point_requests', $requestId, [
                'shopee_order_code' => $request['shopee_order_code'],
                'phone' => $request['phone'],
                'reason_code' => $reasonCode,
                'reason' => $reasonText
            ]);

            Response::json(["success" => true, "message" => "Đã từ chối yêu cầu tích điểm."], 200);

        } catch (Exception $e) {
            if ($dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }
}
