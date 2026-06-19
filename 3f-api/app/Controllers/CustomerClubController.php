<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use App\Models\CustomerPointTransactionModel;
use App\Models\LoyaltyProductionModel;
use App\Models\ShopeePointRequest;
use App\Services\PointService;
use App\Services\ValidationService;
use App\Core\Database;
use PDO;

class CustomerClubController {

    /**
     * GET /api/customer/club/summary
     */
    public function summary() {
        $customer = AuthMiddleware::requireCustomer();
        if (empty($customer['phone'])) {
            Response::json(['success' => true, 'data' => null]);
        }

        $phone = $customer['phone'];
        $model = new LoyaltyProductionModel();
        
        // Ensure loyalty profile exists and calculate stats
        $profile = $model->ensureCustomerProfile($phone, $customer['full_name'] ?? $customer['name']);
        $pointsBalance = (new CustomerPointTransactionModel())->getBalance($phone);
        $totalEarned = $model->sumEarnedPoints($phone);
        $totalSpent = $model->sumSpentPoints($phone);

        // Map tiers Silver/Gold/Platinum
        $nextTier = null;
        if ($profile['tier_name'] === 'Silver') {
            $nextTier = ['name' => 'Gold', 'minPoints' => 5000];
        } elseif ($profile['tier_name'] === 'Gold') {
            $nextTier = ['name' => 'Platinum', 'minPoints' => 15000];
        }

        Response::json([
            'success' => true,
            'data' => [
                'pointsBalance' => $pointsBalance,
                'tier' => [
                    'name' => $profile['tier_name'] ?: 'Silver',
                    'multiplier' => (float)($profile['tier_multiplier'] ?: 1.0),
                    'color' => $profile['tier_color'] ?: '#94A3B8',
                    'minPoints' => (int)($profile['min_points'] ?? 0)
                ],
                'nextTier' => $nextTier,
                'totalEarned' => $totalEarned,
                'totalSpent' => $totalSpent
            ]
        ]);
    }

    /**
     * GET /api/customer/club/transactions
     */
    public function transactions() {
        $customer = AuthMiddleware::requireCustomer();
        if (empty($customer['phone'])) {
            Response::json(['success' => true, 'data' => []]);
        }

        $model = new CustomerPointTransactionModel();
        $rows = $model->getCustomerTransactions($customer['phone']);
        Response::json(['success' => true, 'data' => $rows]);
    }

    /**
     * GET /api/customer/club/shopee-requests
     */
    public function shopeeRequests() {
        $customer = AuthMiddleware::requireCustomer();
        if (empty($customer['phone'])) {
            Response::json(['success' => true, 'data' => []]);
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT r.*, i.file_url AS imageUrl 
            FROM shopee_point_requests r
            LEFT JOIN uploaded_order_images i ON r.image_id = i.id
            WHERE r.phone = ? 
            ORDER BY r.id DESC
        ");
        $stmt->execute([$customer['phone']]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json(['success' => true, 'data' => $rows]);
    }

    /**
     * POST /api/customer/club/shopee-requests
     */
    public function createShopeeRequest() {
        // Forward the logic directly to ShopeePointRequestController to prevent logic duplication
        $controller = new \App\Controllers\ShopeePointRequestController();
        return $controller->create();
    }

    /**
     * GET /api/customer/vouchers
     */
    public function vouchers() {
        $customer = AuthMiddleware::requireCustomer();
        $status = Request::query('status', 'available'); // available, used, expired

        $db = Database::getInstance()->getConnection();
        $vouchers = [];

        // 1. Fetch loyalty reward vouchers from voucher_pools assigned to customer phone
        if (!empty($customer['phone'])) {
            $sql = "
                SELECT v.*, r.name AS title, r.description, r.reward_value, r.reward_type
                FROM voucher_pools v
                JOIN loyalty_rewards r ON v.reward_id = r.id
                WHERE v.assigned_customer_id = ?
            ";
            if ($status === 'available') {
                $sql .= " AND v.status = 'assigned' AND (v.expired_at IS NULL OR v.expired_at > NOW())";
            } elseif ($status === 'used') {
                $sql .= " AND v.status = 'used'";
            } elseif ($status === 'expired') {
                $sql .= " AND (v.status = 'expired' OR (v.status = 'assigned' AND v.expired_at <= NOW()))";
            }
            $stmt = $db->prepare($sql);
            $stmt->execute([$customer['phone']]);
            $poolVouchers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($poolVouchers as $pv) {
                $vouchers[] = [
                    'id' => 'pool-' . $pv['id'],
                    'code' => $pv['voucher_code'],
                    'title' => $pv['title'],
                    'description' => $pv['description'] ?: 'Voucher đổi quà 3F Club',
                    'discountType' => 'fixed',
                    'discountValue' => (float)($pv['voucher_value'] ?: 0.00),
                    'minOrderAmount' => 0.00,
                    'expiresAt' => $pv['expired_at'],
                    'status' => $status,
                    'source' => 'reward'
                ];
            }
        }

        // 2. Fetch general public coupons if status is 'available'
        if ($status === 'available') {
            $stmtC = $db->prepare("
                SELECT c.* FROM coupons c 
                WHERE c.is_active = 1 AND (c.ends_at IS NULL OR c.ends_at > NOW())
            ");
            $stmtC->execute();
            $coupons = $stmtC->fetchAll(PDO::FETCH_ASSOC);

            foreach ($coupons as $cp) {
                // Check if already used by this customer
                $stmtUsed = $db->prepare("
                    SELECT COUNT(*) FROM coupon_usages u
                    JOIN orders o ON u.order_id = o.id
                    WHERE u.coupon_id = ? AND (o.customer_id = ? " . (!empty($customer['phone']) ? "OR o.phone = ?" : "") . ")
                ");
                if (!empty($customer['phone'])) {
                    $stmtUsed->execute([$cp['id'], $customer['id'], $customer['phone']]);
                } else {
                    $stmtUsed->execute([$cp['id'], $customer['id']]);
                }
                $usedCount = (int)$stmtUsed->fetchColumn();

                if ($usedCount === 0) {
                    $vouchers[] = [
                        'id' => 'coupon-' . $cp['id'],
                        'code' => $cp['code'],
                        'title' => $cp['name'],
                        'description' => $cp['description'] ?: 'Mã giảm giá mua hàng',
                        'discountType' => $cp['discount_type'],
                        'discountValue' => (float)$cp['discount_value'],
                        'minOrderAmount' => (float)($cp['min_order_amount'] ?? 0.00),
                        'expiresAt' => $cp['ends_at'],
                        'status' => 'available',
                        'source' => 'coupon'
                    ];
                }
            }
        }

        Response::json(['success' => true, 'data' => $vouchers]);
    }
}
