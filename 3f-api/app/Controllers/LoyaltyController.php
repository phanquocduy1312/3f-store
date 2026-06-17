<?php
namespace App\Controllers;

use App\Core\Response;
use App\Core\Request;
use App\Models\LoyaltyPointRuleModel;
use App\Models\LoyaltyProductionModel;
use App\Services\LoyaltyPointService;
use App\Services\UploadService;
use App\Models\AuditLog;
use App\Helpers\AuthMiddleware;
use Exception;

class LoyaltyController {
    /**
     * Helper to map DB row to API JSON format.
     */
    private function mapRowToRule($row) {
        if (!$row) return null;
        return [
            "id"                => (int)$row['id'],
            "name"              => $row['name'],
            "source"            => $row['source'],
            "moneyPerPoint"     => (int)$row['money_per_point'],
            "roundingMode"      => $row['rounding_mode'],
            "minOrderAmount"    => (int)$row['min_order_amount'],
            "maxPointsPerOrder" => $row['max_points_per_order'] !== null ? (int)$row['max_points_per_order'] : null,
            "multiplier"        => (float)$row['multiplier'],
            "isActive"          => (int)$row['is_active'],
            "startsAt"          => $row['starts_at'],
            "endsAt"            => $row['ends_at'],
            "createdAt"         => $row['created_at'],
            "updatedAt"         => $row['updated_at']
        ];
    }

    /**
     * GET /api/admin/loyalty/point-rules
     */
    public function list() {
        try {
            $model = new LoyaltyPointRuleModel();
            $rules = $model->listRules();
            $mapped = array_map([$this, 'mapRowToRule'], $rules);

            Response::json([
                "success" => true,
                "data"    => $mapped
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/point-rules
     */
    public function create() {
        $input = Request::json();
        
        $name = isset($input['name']) ? trim($input['name']) : '';
        $source = isset($input['source']) ? trim($input['source']) : 'shopee';
        $moneyPerPoint = isset($input['moneyPerPoint']) ? (int)$input['moneyPerPoint'] : 10000;
        $roundingMode = isset($input['roundingMode']) ? trim($input['roundingMode']) : 'floor';
        $minOrderAmount = isset($input['minOrderAmount']) ? (int)$input['minOrderAmount'] : 0;
        $maxPointsPerOrder = (isset($input['maxPointsPerOrder']) && $input['maxPointsPerOrder'] !== '' && $input['maxPointsPerOrder'] !== null) ? (int)$input['maxPointsPerOrder'] : null;
        $multiplier = isset($input['multiplier']) ? (float)$input['multiplier'] : 1.00;
        $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 1;
        $startsAt = !empty($input['startsAt']) ? $input['startsAt'] : null;
        $endsAt = !empty($input['endsAt']) ? $input['endsAt'] : null;

        if (empty($name)) {
            Response::json(["success" => false, "message" => "Tên cấu hình không được trống."], 400);
        }
        if ($moneyPerPoint <= 0) {
            Response::json(["success" => false, "message" => "Số tiền quy đổi mỗi điểm phải lớn hơn 0."], 400);
        }
        if ($multiplier <= 0) {
            Response::json(["success" => false, "message" => "Hệ số nhân điểm phải lớn hơn 0."], 400);
        }

        try {
            $model = new LoyaltyPointRuleModel();
            
            // Deactivate other rules for same source if active
            if ($isActive === 1) {
                $model->deactivateOthersForSource($source);
            }

            $id = $model->createRule([
                'name'                 => $name,
                'source'               => $source,
                'money_per_point'      => $moneyPerPoint,
                'rounding_mode'        => $roundingMode,
                'min_order_amount'     => $minOrderAmount,
                'max_points_per_order' => $maxPointsPerOrder,
                'multiplier'           => $multiplier,
                'is_active'            => $isActive,
                'starts_at'            => $startsAt,
                'ends_at'              => $endsAt
            ]);

            Response::json([
                "success" => true,
                "message" => "Tạo quy tắc tích điểm thành công.",
                "id"      => $id
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/point-rules/update
     */
    public function update() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;

        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID cấu hình không hợp lệ"], 400);
        }

        $data = [];
        if (isset($input['name'])) $data['name'] = trim($input['name']);
        if (isset($input['source'])) $data['source'] = trim($input['source']);
        if (isset($input['moneyPerPoint'])) $data['money_per_point'] = (int)$input['moneyPerPoint'];
        if (isset($input['roundingMode'])) $data['rounding_mode'] = trim($input['roundingMode']);
        if (isset($input['minOrderAmount'])) $data['min_order_amount'] = (int)$input['minOrderAmount'];
        if (isset($input['maxPointsPerOrder'])) $data['max_points_per_order'] = $input['maxPointsPerOrder'];
        if (isset($input['multiplier'])) $data['multiplier'] = (float)$input['multiplier'];
        if (isset($input['isActive'])) $data['is_active'] = (int)$input['isActive'];
        if (isset($input['startsAt'])) $data['starts_at'] = $input['startsAt'];
        if (isset($input['endsAt'])) $data['ends_at'] = $input['endsAt'];

        if (isset($data['money_per_point']) && $data['money_per_point'] <= 0) {
            Response::json(["success" => false, "message" => "Số tiền quy đổi mỗi điểm phải lớn hơn 0."], 400);
        }
        if (isset($data['multiplier']) && $data['multiplier'] <= 0) {
            Response::json(["success" => false, "message" => "Hệ số nhân điểm phải lớn hơn 0."], 400);
        }

        try {
            $model = new LoyaltyPointRuleModel();
            
            // If active, deactivate others
            if (isset($data['is_active']) && $data['is_active'] === 1) {
                $source = isset($data['source']) ? $data['source'] : '';
                if (empty($source)) {
                    // Fetch current rule to know its source
                    $current = $model->listRules();
                    foreach ($current as $r) {
                        if ((int)$r['id'] === $id) {
                            $source = $r['source'];
                            break;
                        }
                    }
                }
                if (!empty($source)) {
                    $model->deactivateOthersForSource($source, $id);
                }
            }

            $success = $model->updateRule($id, $data);

            Response::json([
                "success" => $success,
                "message" => $success ? "Cập nhật cấu hình thành công." : "Không thể cập nhật cấu hình hoặc không có thay đổi."
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/point-rules/deactivate
     */
    public function deactivate() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : (int)Request::query('id', 0);

        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID cấu hình không hợp lệ"], 400);
        }

        try {
            $model = new LoyaltyPointRuleModel();
            $success = $model->deactivateRule($id);

            Response::json([
                "success" => $success,
                "message" => $success ? "Đã tắt kích hoạt quy tắc." : "Không thể tắt kích hoạt quy tắc."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/calculate-preview
     */
    public function calculatePreview() {
        $input = Request::json();
        $amount = isset($input['amount']) ? (int)$input['amount'] : 0;
        $source = isset($input['source']) ? trim($input['source']) : 'shopee';

        try {
            $points = LoyaltyPointService::calculatePoints($amount, $source);
            
            $ruleModel = new LoyaltyPointRuleModel();
            $activeRule = $ruleModel->getActiveRule($source);

            Response::json([
                "success" => true,
                "data"    => [
                    "amount" => $amount,
                    "points" => $points,
                    "rule"   => $this->mapRowToRule($activeRule)
                ]
            ], 200);

        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * Helper to map Reward row to JSON.
     */
    private function mapReward($row) {
        if (!$row) return null;
        return [
            "id" => (int)$row['id'],
            "name" => $row['name'],
            "description" => $row['description'],
            "rewardType" => $row['reward_type'],
            "imageUrl" => $row['image_url'],
            "sku" => $row['sku'] ?? null,
            "pointsRequired" => (int)$row['points_required'],
            "rewardValue" => $row['reward_value'] !== null ? (int)$row['reward_value'] : null,
            "stockQuantity" => isset($row['stock']) && $row['stock'] !== null ? (int)$row['stock'] : ($row['stock_quantity'] !== null ? (int)$row['stock_quantity'] : null),
            "stock" => isset($row['stock']) && $row['stock'] !== null ? (int)$row['stock'] : null,
            "reservedStock" => isset($row['reserved_stock']) ? (int)$row['reserved_stock'] : 0,
            "weight" => isset($row['weight']) && $row['weight'] !== null ? (float)$row['weight'] : null,
            "dimensions" => $row['dimensions'] ?? null,
            "limitPerCustomer" => $row['limit_per_customer'] !== null ? (int)$row['limit_per_customer'] : null,
            "isActive" => (int)$row['is_active'],
            "startsAt" => $row['starts_at'],
            "endsAt" => $row['ends_at'],
            "createdAt" => $row['created_at'],
            "updatedAt" => $row['updated_at']
        ];
    }

    /**
     * GET /api/admin/loyalty/rewards
     */
    public function listRewards() {
        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $productionModel = new LoyaltyProductionModel();
            $filters = [
                'status' => Request::query('status'),
                'type' => Request::query('type'),
                'search' => Request::query('search')
            ];
            $rows = $model->listRewards($filters);
            $mapped = array_map(function ($row) use ($productionModel) {
                $reward = $this->mapReward($row);
                if (($row['reward_type'] ?? '') === 'voucher') {
                    $reward['voucherStats'] = $productionModel->getVoucherStats((int)$row['id']);
                }
                return $reward;
            }, $rows);

            Response::json([
                "success" => true,
                "data"    => $mapped
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    public function rewardDetail() {
        $id = (int)Request::query('id', 0);
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID quà tặng không hợp lệ."], 400);
        }

        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $productionModel = new LoyaltyProductionModel();
            $row = $model->getRewardById($id);
            if (!$row) {
                Response::json(["success" => false, "message" => "Không tìm thấy quà tặng."], 404);
            }

            $reward = $this->mapReward($row);
            if (($row['reward_type'] ?? '') === 'voucher') {
                $reward['vouchers'] = $productionModel->listVouchers(['rewardId' => $id]);
                $reward['voucherStats'] = $productionModel->getVoucherStats($id);
            }

            Response::json(["success" => true, "data" => $reward], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/rewards
     */
    public function createReward() {
        $input = Request::json();
        
        $name = isset($input['name']) ? trim($input['name']) : '';
        $pointsRequired = isset($input['pointsRequired']) ? (int)$input['pointsRequired'] : 0;

        if (empty($name)) {
            Response::json(["success" => false, "message" => "Tên quà tặng không được để trống."], 400);
        }
        if ($pointsRequired <= 0) {
            Response::json(["success" => false, "message" => "Điểm yêu cầu đổi quà phải lớn hơn 0."], 400);
        }

        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $id = $model->createReward($input);

            Response::json([
                "success" => true,
                "message" => "Tạo quà đổi điểm thành công.",
                "id"      => $id
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/rewards/update
     */
    public function updateReward() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;

        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID quà tặng không hợp lệ"], 400);
        }

        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $success = $model->updateReward($id, $input);

            Response::json([
                "success" => true,
                "message" => $success ? "Cập nhật quà tặng thành công." : "Không thể cập nhật hoặc không có thay đổi."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/rewards/deactivate
     */
    public function deactivateReward() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;

        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID quà tặng không hợp lệ"], 400);
        }

        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $success = $model->deactivateReward($id);

            Response::json([
                "success" => $success,
                "message" => $success ? "Đã tắt kích hoạt quà tặng." : "Không thể tắt kích hoạt quà tặng."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    public function toggleRewardActive() {
        $input = Request::json();
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $isActive = isset($input['isActive']) ? (int)$input['isActive'] : 0;
        if ($id <= 0) {
            Response::json(["success" => false, "message" => "ID quà tặng không hợp lệ"], 400);
        }

        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $success = $model->updateReward($id, ['is_active' => $isActive]);
            Response::json([
                "success" => (bool)$success,
                "message" => $isActive === 1 ? "Đã kích hoạt quà tặng." : "Đã tắt quà tặng."
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/rewards/upload-image
     */
    public function uploadRewardImage() {
        try {
            if (!isset($_FILES['image'])) {
                Response::json([
                    "success" => false,
                    "message" => "Vui long chon file anh reward de upload."
                ], 400);
            }

            $upload = UploadService::uploadRewardImage($_FILES['image']);

            Response::json([
                "success" => true,
                "data" => [
                    "imageUrl" => $upload['image_url']
                ]
            ], 200);
        } catch (Exception $e) {
            Response::json([
                "success" => false,
                "message" => $e->getMessage()
            ], 400);
        }
    }

    /**
     * GET /api/loyalty/rewards
     */
    public function listActiveRewards() {
        try {
            $model = new \App\Models\LoyaltyRewardModel();
            $all = $model->listRewards(['status' => 'active']);
            
            // Filter by start and end dates
            $now = date('Y-m-d H:i:s');
            $active = array_filter($all, function($row) use ($now) {
                if ($row['starts_at'] !== null && $row['starts_at'] > $now) return false;
                if ($row['ends_at'] !== null && $row['ends_at'] < $now) return false;
                return true;
            });

            $mapped = array_map([$this, 'mapReward'], array_values($active));

            Response::json([
                "success" => true,
                "data"    => $mapped
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/loyalty/rewards/redeem
     */
    public function redeem() {
        $input = Request::json();
        
        $phoneRaw = isset($input['phone']) ? trim($input['phone']) : '';
        $phone = \App\Services\ValidationService::normalizePhone($phoneRaw);
        $customerName = isset($input['customerName']) ? trim($input['customerName']) : '';
        $rewardId = isset($input['rewardId']) ? (int)$input['rewardId'] : 0;

        if (empty($phoneRaw) || !\App\Services\ValidationService::isValidVietnamPhone($phoneRaw)) {
            Response::json(["success" => false, "message" => "Số điện thoại không hợp lệ."], 400);
        }
        if ($rewardId <= 0) {
            Response::json(["success" => false, "message" => "Quà tặng không hợp lệ."], 400);
        }

        $dbConnection = \App\Core\Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $rewardModel = new \App\Models\LoyaltyRewardModel();
            $reward = $rewardModel->getRewardById($rewardId);

            if (!$reward || (int)$reward['is_active'] !== 1) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Quà đổi điểm này không tồn tại hoặc đã bị khóa."], 400);
            }

            // Check validity date
            $now = date('Y-m-d H:i:s');
            if ($reward['starts_at'] !== null && $reward['starts_at'] > $now) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Chương trình đổi quà chưa bắt đầu."], 400);
            }
            if ($reward['ends_at'] !== null && $reward['ends_at'] < $now) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Chương trình đổi quà đã kết thúc."], 400);
            }

            $availableStock = isset($reward['stock']) && $reward['stock'] !== null ? (int)$reward['stock'] : ($reward['stock_quantity'] !== null ? (int)$reward['stock_quantity'] : null);

            // Check stock
            if ($availableStock !== null && $availableStock <= 0) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Quà tặng đã hết hàng."], 400);
            }

            $productionModel = new LoyaltyProductionModel();
            if ($reward['reward_type'] === 'voucher') {
                $availableVouchers = $productionModel->listVouchers(['rewardId' => $rewardId, 'status' => 'available']);
                if (count($availableVouchers) === 0) {
                    $dbConnection->rollBack();
                    Response::json(["success" => false, "message" => "Hết mã voucher khả dụng"], 400);
                }
            }

            // Check point balance
            $transModel = new \App\Models\CustomerPointTransactionModel();
            $currentBalance = $transModel->getBalance($phone);
            $pointsSpent = (int)$reward['points_required'];

            if ($currentBalance < $pointsSpent) {
                $dbConnection->rollBack();
                Response::json([
                    "success" => false, 
                    "message" => "Bạn không đủ điểm để đổi quà này. Điểm hiện tại: $currentBalance, Điểm cần: $pointsSpent"
                ], 400);
            }

            // Check limit per customer
            if ($reward['limit_per_customer'] !== null) {
                $redemptionModel = new \App\Models\LoyaltyRewardRedemptionModel();
                $claimedCount = $redemptionModel->countCustomerRedemptions($phone, $rewardId);
                if ($claimedCount >= (int)$reward['limit_per_customer']) {
                    $dbConnection->rollBack();
                    Response::json(["success" => false, "message" => "Bạn đã đạt giới hạn đổi quà này (Tối đa: " . $reward['limit_per_customer'] . " lần)."], 400);
                }
            }

            // Proceed with redemption
            $redemptionModel = new \App\Models\LoyaltyRewardRedemptionModel();
            $redemptionId = $redemptionModel->createRedemption([
                'phone' => $phone,
                'customerName' => $customerName,
                'rewardId' => $rewardId,
                'pointsSpent' => $pointsSpent,
                'status' => 'pending',
                'note' => 'Khách hàng đổi điểm'
            ]);

            $assignedVoucher = null;
            if ($reward['reward_type'] === 'voucher') {
                $assignedVoucher = $productionModel->assignAvailableVoucher($rewardId, $phone, $redemptionId);
                if (!$assignedVoucher) {
                    $dbConnection->rollBack();
                    Response::json(["success" => false, "message" => "Hết mã voucher khả dụng"], 400);
                }
            }

            // Decrement Stock
            if ($availableStock !== null) {
                $stockUpdated = $rewardModel->decrementStock($rewardId);
                if (!$stockUpdated) {
                    $dbConnection->rollBack();
                    Response::json(["success" => false, "message" => "Qua tang da het hang."], 400);
                }
            }

            // Deduct Points
            $transModel->addTransaction(
                $phone,
                'spend_reward',
                -$pointsSpent,
                $currentBalance - $pointsSpent,
                'loyalty_reward_redemption',
                $redemptionId,
                'Đổi quà: ' . $reward['name']
            );

            $dbConnection->commit();

            Response::json([
                "success" => true,
                "message" => "Đổi quà thành công. Yêu cầu đang được xử lý.",
                "redemptionId" => $redemptionId,
                "voucherCode" => $assignedVoucher ? $assignedVoucher['voucher_code'] : null,
                "pointsSpent" => $pointsSpent,
                "remainingPoints" => $currentBalance - $pointsSpent
            ], 200);

        } catch (Exception $e) {
            if ($dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/admin/loyalty/redemptions
     */
    public function listRedemptions() {
        try {
            $model = new \App\Models\LoyaltyRewardRedemptionModel();
            $filters = [
                'status' => Request::query('status'),
                'phone' => Request::query('phone'),
                'search' => Request::query('search')
            ];
            $rows = $model->listRedemptions($filters);

            Response::json([
                "success" => true,
                "data"    => $rows
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/redemptions/approve
     */
    public function approveRedemption() {
        $input = Request::json();
        $id = $input['id'] ?? $input['redemptionId'] ?? null;
        
        if (!$id) {
            Response::json(["success" => false, "message" => "Missing redemption id"], 400);
        }
        $id = (int)$id;

        $processedBy = isset($input['processedBy']) ? trim($input['processedBy']) : 'admin';
        $note = isset($input['note']) ? trim($input['note']) : 'Đã duyệt';

        $dbConnection = \App\Core\Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $model = new \App\Models\LoyaltyRewardRedemptionModel();
            $redemption = $model->getRedemptionById($id);

            if (!$redemption) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Redemption not found"], 404);
            }

            if ($redemption['status'] !== 'pending') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Chỉ có thể duyệt các yêu cầu đang chờ xử lý (status = pending)."], 400);
            }

            $model->updateStatus($id, 'approved', $processedBy, $note);

            $dbConnection->commit();

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'approve_loyalty_redemption', 'loyalty_reward_redemptions', $id, [
                'phone' => $redemption['customer_phone'],
                'reward_name' => $redemption['reward_name'],
                'points_spent' => $redemption['points_spent']
            ]);

            Response::json([
                "success" => true,
                "message" => "Redemption approved successfully",
                "data" => [
                    "id" => $id,
                    "status" => "approved"
                ]
            ], 200);
        } catch (\Throwable $e) {
            if (isset($dbConnection) && $dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            error_log("approveRedemption Error [ID: $id]: " . $e->getMessage());
            Response::json(["success" => false, "message" => "Internal server error"], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/redemptions/reject
     */
    public function rejectRedemption() {
        $input = Request::json();
        $id = $input['id'] ?? $input['redemptionId'] ?? null;
        if (!$id) {
            Response::json(["success" => false, "message" => "Missing redemption id"], 400);
        }
        $id = (int)$id;

        $reason = $input['reason'] ?? $input['note'] ?? '';
        $processedBy = isset($input['processedBy']) ? trim($input['processedBy']) : 'admin';
        $note = $reason ?: 'Bị từ chối';

        $dbConnection = \App\Core\Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $model = new \App\Models\LoyaltyRewardRedemptionModel();
            $redemption = $model->getRedemptionById($id);

            if (!$redemption) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Redemption not found"], 404);
            }

            if (!in_array($redemption['status'], ['pending', 'approved'], true)) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Yêu cầu này đã bị từ chối hoặc hủy bỏ trước đó."], 400);
            }

            // Refund points
            $transModel = new \App\Models\CustomerPointTransactionModel();
            
            $stmt = $dbConnection->prepare("
                SELECT id FROM customer_point_transactions
                WHERE type = 'refund_reward'
                AND reference_type = 'loyalty_reward_redemption'
                AND reference_id = ?
                LIMIT 1
            ");
            $stmt->execute([$id]);
            $existingRefund = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$existingRefund) {
                $currentBalance = $transModel->getBalance($redemption['customer_phone']);
                $pointsSpent = abs((int)$redemption['points_spent']);

                $transModel->addTransaction(
                    $redemption['customer_phone'],
                    'refund_reward',
                    $pointsSpent,
                    $currentBalance + $pointsSpent,
                    'loyalty_reward_redemption',
                    $id,
                    'Từ chối đổi quà, hoàn điểm: ' . $redemption['reward_name']
                );
            }

            // Increment Stock back
            $hasStock = false;
            if (array_key_exists('stock_quantity', $redemption) && $redemption['stock_quantity'] !== null) {
                $hasStock = true;
            } elseif (array_key_exists('stock', $redemption) && $redemption['stock'] !== null) {
                $hasStock = true;
            }
            
            if ($hasStock) {
                $rewardModel = new \App\Models\LoyaltyRewardModel();
                $rewardModel->incrementStock((int)$redemption['reward_id']);
            }

            $productionModel = new LoyaltyProductionModel();
            $productionModel->releaseVoucherForRedemption($id);

            $model->updateStatus($id, 'rejected', $processedBy, $note);

            $dbConnection->commit();

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'reject_loyalty_redemption', 'loyalty_reward_redemptions', $id, [
                'phone' => $redemption['customer_phone'],
                'reward_name' => $redemption['reward_name'],
                'points_spent' => $redemption['points_spent'],
                'reason' => $reason
            ]);

            Response::json([
                "success" => true,
                "message" => "Redemption rejected successfully",
                "data" => [
                    "id" => $id,
                    "status" => "rejected"
                ]
            ], 200);
        } catch (\Throwable $e) {
            if (isset($dbConnection) && $dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            error_log("rejectRedemption Error [ID: $id]: " . $e->getMessage());
            Response::json(["success" => false, "message" => "Internal server error"], 500);
        }
    }

    /**
     * POST /api/admin/loyalty/redemptions/fulfill
     */
    public function fulfillRedemption() {
        $input = Request::json();
        $id = $input['id'] ?? $input['redemptionId'] ?? null;
        if (!$id) {
            Response::json(["success" => false, "message" => "Missing redemption id"], 400);
        }
        $id = (int)$id;

        $processedBy = isset($input['processedBy']) ? trim($input['processedBy']) : 'admin';
        $note = isset($input['note']) ? trim($input['note']) : 'Đã giao quà';

        $dbConnection = \App\Core\Database::getInstance()->getConnection();

        try {
            $dbConnection->beginTransaction();

            $model = new \App\Models\LoyaltyRewardRedemptionModel();
            $redemption = $model->getRedemptionById($id);

            if (!$redemption) {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Redemption not found"], 404);
            }

            if ($redemption['status'] !== 'approved') {
                $dbConnection->rollBack();
                Response::json(["success" => false, "message" => "Chỉ có thể fulfill yêu cầu đã được approve (status = approved)."], 400);
            }

            if ($redemption['reward_type'] === 'voucher') {
                $productionModel = new LoyaltyProductionModel();
                
                $stmt = $dbConnection->prepare("SELECT id FROM voucher_pools WHERE assigned_redemption_id = ? LIMIT 1");
                $stmt->execute([$id]);
                $hasVoucher = $stmt->fetch(\PDO::FETCH_ASSOC);

                if (!$hasVoucher) {
                    $assignedVoucher = $productionModel->assignAvailableVoucher($redemption['reward_id'], $redemption['customer_phone'], $id);
                    if (!$assignedVoucher) {
                        $dbConnection->rollBack();
                        Response::json(["success" => false, "message" => "Hết mã voucher khả dụng."], 400);
                    }
                }
            }

            $model->updateStatus($id, 'fulfilled', $processedBy, $note);

            $dbConnection->commit();

            // Write Audit Log
            $currentAdmin = AuthMiddleware::getCurrentAdmin();
            $adminId = $currentAdmin ? $currentAdmin['id'] : null;
            AuditLog::write($adminId, 'fulfill_loyalty_redemption', 'loyalty_reward_redemptions', $id, [
                'phone' => $redemption['customer_phone'],
                'reward_name' => $redemption['reward_name'],
                'points_spent' => $redemption['points_spent']
            ]);

            Response::json([
                "success" => true,
                "message" => "Redemption fulfilled successfully",
                "data" => [
                    "id" => $id,
                    "status" => "fulfilled"
                ]
            ], 200);
        } catch (\Throwable $e) {
            if (isset($dbConnection) && $dbConnection->inTransaction()) {
                $dbConnection->rollBack();
            }
            error_log("fulfillRedemption Error [ID: $id]: " . $e->getMessage());
            Response::json(["success" => false, "message" => "Internal server error"], 500);
        }
    }

    /**
     * GET /api/admin/loyalty/transactions
     */
    public function listTransactionsAdmin() {
        try {
            $model = new \App\Models\CustomerPointTransactionModel();
            $filters = [
                'phone' => Request::query('phone'),
                'type' => Request::query('type'),
                'dateFrom' => Request::query('dateFrom'),
                'dateTo' => Request::query('dateTo')
            ];
            $rows = $model->listTransactions($filters);

            Response::json([
                "success" => true,
                "data"    => $rows
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/loyalty/transactions
     */
    public function listTransactionsClient() {
        $phoneRaw = Request::query('phone', '');
        $phone = \App\Services\ValidationService::normalizePhone($phoneRaw);

        if (empty($phone)) {
            Response::json(["success" => false, "message" => "Số điện thoại không được để trống"], 400);
        }

        try {
            $model = new \App\Models\CustomerPointTransactionModel();
            $rows = $model->getCustomerTransactions($phone);

            Response::json([
                "success" => true,
                "data"    => $rows
            ], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }

    public function listVoucherPool() {
        try {
            $model = new LoyaltyProductionModel();
            Response::json(["success" => true, "data" => $model->listVouchers([
                'rewardId' => Request::query('rewardId'),
                'status' => Request::query('status')
            ])], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function importVoucherPool() {
        $input = Request::json();
        $rewardId = isset($input['rewardId']) ? (int)$input['rewardId'] : 0;
        if ($rewardId <= 0) Response::json(["success" => false, "message" => "rewardId khong hop le."], 400);
        $codes = [];
        if (!empty($input['codes']) && is_array($input['codes'])) $codes = $input['codes'];
        elseif (!empty($input['text'])) $codes = preg_split('/[\r\n,;]+/', $input['text']);
        elseif (!empty($input['csv'])) $codes = preg_split('/[\r\n,;]+/', $input['csv']);
        try {
            $result = (new LoyaltyProductionModel())->importVouchers($rewardId, $codes, $input['voucherValue'] ?? null);
            Response::json(["success" => true, "data" => $result], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function importRewardVouchers() {
        $input = Request::json();
        $rewardId = isset($input['rewardId']) ? (int)$input['rewardId'] : 0;
        if ($rewardId <= 0) {
            Response::json(["success" => false, "message" => "rewardId không hợp lệ."], 400);
        }

        $rewardModel = new \App\Models\LoyaltyRewardModel();
        $reward = $rewardModel->getRewardById($rewardId);
        if (!$reward) {
            Response::json(["success" => false, "message" => "Quà tặng không tồn tại."], 404);
        }
        if (($reward['reward_type'] ?? '') !== 'voucher') {
            Response::json(["success" => false, "message" => "Chỉ quà loại voucher mới được import mã."], 400);
        }

        $codes = [];
        if (!empty($input['codes']) && is_array($input['codes'])) {
            $codes = $input['codes'];
        }
        if (empty($codes)) {
            Response::json(["success" => false, "message" => "Chưa có mã voucher để import."], 400);
        }

        try {
            $result = (new LoyaltyProductionModel())->importVouchers(
                $rewardId,
                $codes,
                $input['voucherValue'] ?? null,
                $input['expiredAt'] ?? null
            );
            Response::json(["success" => true, "data" => $result], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function listRewardVouchers() {
        $rewardId = (int)Request::query('rewardId', 0);
        if ($rewardId <= 0) {
            Response::json(["success" => false, "message" => "rewardId không hợp lệ."], 400);
        }

        try {
            $data = (new LoyaltyProductionModel())->listVouchers(['rewardId' => $rewardId]);
            Response::json(["success" => true, "data" => $data], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function listTiers() {
        try {
            Response::json(["success" => true, "data" => (new LoyaltyProductionModel())->listTiers()], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function saveTier() {
        $input = Request::json();
        if (empty($input['name'])) Response::json(["success" => false, "message" => "Ten hang khong duoc trong."], 400);
        try {
            $id = (new LoyaltyProductionModel())->upsertTier($input);
            Response::json(["success" => true, "id" => $id], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function setTierActive() {
        $input = Request::json();
        try {
            (new LoyaltyProductionModel())->setTierActive((int)$input['id'], (int)$input['isActive']);
            Response::json(["success" => true], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function previewTier() {
        try {
            $model = new LoyaltyProductionModel();
            $customerId = Request::query('customerId');
            $tier = $customerId ? $model->ensureCustomerProfile($customerId) : $model->getTierForPoints((int)Request::query('points', 0));
            Response::json(["success" => true, "data" => $tier], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function listCampaigns() {
        try {
            Response::json(["success" => true, "data" => (new LoyaltyProductionModel())->listCampaigns()], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function saveCampaign() {
        $input = Request::json();
        if (empty($input['name'])) Response::json(["success" => false, "message" => "Ten chien dich khong duoc trong."], 400);
        try {
            $id = (new LoyaltyProductionModel())->upsertCampaign($input);
            Response::json(["success" => true, "id" => $id], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function setCampaignActive() {
        $input = Request::json();
        try {
            (new LoyaltyProductionModel())->setCampaignActive((int)$input['id'], (int)$input['isActive']);
            Response::json(["success" => true], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function previewPointsProduction() {
        $input = Request::json();
        $amount = isset($input['amount']) ? (int)$input['amount'] : 0;
        $customerId = $input['customer_id'] ?? $input['customerId'] ?? null;
        try {
            Response::json(["success" => true, "data" => LoyaltyPointService::previewPoints($amount, $customerId, "shopee", false)], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function customerTier() {
        $customerId = Request::query('customer_id', Request::query('customerId', Request::query('phone', '')));
        if (empty($customerId)) Response::json(["success" => false, "message" => "customer_id khong duoc trong."], 400);
        try {
            Response::json(["success" => true, "data" => (new LoyaltyProductionModel())->ensureCustomerProfile($customerId)], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function customerRewardHistory() {
        $customerId = Request::query('customer_id', Request::query('customerId', Request::query('phone', '')));
        if (empty($customerId)) Response::json(["success" => false, "message" => "customer_id khong duoc trong."], 400);
        try {
            $profile = (new LoyaltyProductionModel())->getCustomerProfile($customerId);
            Response::json(["success" => true, "data" => $profile['redemptions']], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function customerLoyaltyProfile() {
        $customerId = Request::query('customer_id', Request::query('customerId', Request::query('id', '')));
        if (empty($customerId)) Response::json(["success" => false, "message" => "customer_id khong duoc trong."], 400);
        try {
            Response::json(["success" => true, "data" => (new LoyaltyProductionModel())->getCustomerProfile($customerId)], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }

    public function analytics() {
        try {
            Response::json(["success" => true, "data" => (new LoyaltyProductionModel())->getAnalytics()], 200);
        } catch (Exception $e) {
            Response::json(["success" => false, "message" => $e->getMessage()], 500);
        }
    }
}
