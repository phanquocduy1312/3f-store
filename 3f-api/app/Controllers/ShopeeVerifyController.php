<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Services\ShopeeApiService;
use App\Models\ShopeePointRequest;
use Exception;

class ShopeeVerifyController {
    private $shopeeApi;
    private $requestModel;

    public function __construct() {
        $this->shopeeApi = new ShopeeApiService();
        $this->requestModel = new ShopeePointRequest();
    }

    /**
     * Handles POST /api/admin/shopee/requests/verify
     */
    public function verify() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;

        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID yêu cầu không hợp lệ"], 400);
        }

        try {
            $request = $this->requestModel->findById($id);

            if (!$request) {
                Response::json(["success" => false, "message" => "Yêu cầu tích điểm không tồn tại"], 404);
            }

            if ($request['processing_status'] !== 'pending') {
                Response::json(["success" => false, "message" => "Chỉ có thể đối chiếu các yêu cầu đang ở trạng thái chờ duyệt (pending)"], 400);
            }

            $verificationStatus = $this->performVerification($request);
            $updatedRequest = $this->requestModel->findById($id);

            Response::json([
                "success" => true,
                "message" => "Shopee order verified successfully",
                "data" => [
                    "requestId"            => (int)$updatedRequest['id'],
                    "verificationStatus"   => $updatedRequest['verification_status'],
                    "matchedShopeeOrderId" => $updatedRequest['matched_shopee_order_id'] ?? null,
                    "shopeeOrderCode"      => $updatedRequest['shopee_order_code'],
                    "orderAmountInput"     => (int)$updatedRequest['order_amount'],
                    "orderAmountShopee"    => $updatedRequest['shopee_api_order_amount'] !== null ? (int)$updatedRequest['shopee_api_order_amount'] : null
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Handles POST /api/admin/shopee/requests/verify-bulk
     */
    public function verifyBulk() {
        $input = Request::json();
        $ids = isset($input['ids']) && is_array($input['ids']) ? $input['ids'] : null;

        try {
            $requests = $this->requestModel->getPendingVerificationRequests($ids);
            
            $total = count($requests);
            $valid = 0;
            $notFound = 0;
            $mismatch = 0;
            $duplicate = 0;
            $invalidStatus = 0;
            $manualReview = 0;
            $items = [];

            foreach ($requests as $request) {
                $status = $this->performVerification($request);
                
                switch ($status) {
                    case 'valid':
                        $valid++;
                        break;
                    case 'not_found':
                        $notFound++;
                        break;
                    case 'mismatch':
                        $mismatch++;
                        break;
                    case 'duplicate':
                        $duplicate++;
                        break;
                    case 'invalid_order_status':
                        $invalidStatus++;
                        break;
                    case 'manual_review':
                    default:
                        $manualReview++;
                        break;
                }

                $updated = $this->requestModel->findById($request['id']);
                $items[] = [
                    "requestId"          => (int)$request['id'],
                    "shopeeOrderCode"    => $request['shopee_order_code'],
                    "verificationStatus" => $status,
                    "verificationNote"   => $updated['verification_note'] ?? null
                ];
            }

            Response::json([
                "success" => true,
                "message" => "Bulk verification completed",
                "data" => [
                    "total"         => $total,
                    "valid"         => $valid,
                    "notFound"      => $notFound,
                    "mismatch"      => $mismatch,
                    "duplicate"     => $duplicate,
                    "invalidStatus" => $invalidStatus,
                    "manualReview"  => $manualReview,
                    "items"         => $items
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Helper to perform verification logic on a single request.
     */
    private function performVerification($request) {
        $id = $request['id'];
        $shopeeOrderCode = $request['shopee_order_code'];
        
        // 1. Check duplicate
        $duplicate = $this->requestModel->checkDuplicateOrderCode($shopeeOrderCode, $id);
        if ($duplicate) {
            $data = [
                'verification_status' => 'duplicate',
                'verification_note'   => 'Trùng mã đơn hàng với một yêu cầu hợp lệ hoặc đã duyệt khác.'
            ];
            $this->requestModel->updateVerification($id, $data);
            return 'duplicate';
        }
        
        // 2. Call Shopee API
        try {
            $shopeeOrder = $this->shopeeApi->getOrderDetail($shopeeOrderCode);
            
            if (!$shopeeOrder) {
                $data = [
                    'verification_status' => 'not_found',
                    'verification_note'   => 'Không tìm thấy đơn hàng trên Shopee.'
                ];
                $this->requestModel->updateVerification($id, $data);
                return 'not_found';
            }
            
            $shopeeStatus = $shopeeOrder['order_status'];
            $shopeeAmount = $shopeeOrder['total_amount'];
            $shopeeAmountInt = (int)round($shopeeAmount);
            $inputAmount = (int)$request['order_amount'];
            
            // Check status first
            $shopeeEnv = getenv('SHOPEE_ENV') ?: 'sandbox';
            $validStatuses = ($shopeeEnv === 'sandbox') ? ['COMPLETED', 'TO_CONFIRM_RECEIVE'] : ['COMPLETED'];
            
            if (!in_array($shopeeStatus, $validStatuses)) {
                $data = [
                    'verification_status'     => 'invalid_order_status',
                    'matched_shopee_order_id' => $shopeeOrder['order_sn'],
                    'shopee_api_status'       => $shopeeStatus,
                    'shopee_api_order_amount' => $shopeeAmountInt,
                    'shopee_api_raw_json'     => json_encode($shopeeOrder, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'verification_note'       => 'Trạng thái đơn hàng trên Shopee là ' . $shopeeStatus . ' (chưa hoàn thành).'
                ];
                $this->requestModel->updateVerification($id, $data);
                return 'invalid_order_status';
            }
            
            // Check amount discrepancy (allow +/- 100 VND)
            if (abs($inputAmount - $shopeeAmountInt) > 100) {
                $data = [
                    'verification_status'     => 'mismatch',
                    'matched_shopee_order_id' => $shopeeOrder['order_sn'],
                    'shopee_api_status'       => $shopeeStatus,
                    'shopee_api_order_amount' => $shopeeAmountInt,
                    'shopee_api_raw_json'     => json_encode($shopeeOrder, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'verification_note'       => 'Lệch tổng tiền: Khách nhập ' . number_format($inputAmount) . ' VND, Shopee trả ' . number_format($shopeeAmountInt) . ' VND.'
                ];
                $this->requestModel->updateVerification($id, $data);
                return 'mismatch';
            }
            
            // Valid
            $data = [
                'verification_status'     => 'valid',
                'matched_shopee_order_id' => $shopeeOrder['order_sn'],
                'shopee_api_status'       => $shopeeStatus,
                'shopee_api_order_amount' => $shopeeAmountInt,
                'shopee_api_raw_json'     => json_encode($shopeeOrder, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'verification_note'       => 'Đối chiếu thành công.'
            ];
            $this->requestModel->updateVerification($id, $data);
            return 'valid';
            
        } catch (Exception $e) {
            $data = [
                'verification_status' => 'manual_review',
                'verification_note'   => 'Lỗi API Shopee: ' . $e->getMessage()
            ];
            $this->requestModel->updateVerification($id, $data);
            return 'manual_review';
        }
    }
}
