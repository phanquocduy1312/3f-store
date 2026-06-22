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
        
        $db = Database::getInstance()->getConnection();
        
        $phone = $customer['phone'] ?? '';
        $customerId = $customer['id'];
        $isPhoneVerified = (int)($customer['is_phone_verified'] ?? 0);

        if ($isPhoneVerified !== 1) {
            Response::json([
                'success' => true,
                'data' => [
                    'phone_verified' => false,
                    'locked' => true
                ]
            ]);
            return;
        }

        $model = new LoyaltyProductionModel();
        
        // Ensure loyalty profile exists and calculate stats
        $profile = $model->ensureCustomerProfile($customerId, $customer['full_name'] ?? $customer['name']);
        
        $transModel = new \App\Models\LoyaltyPointTransaction();
        $pointsBalance = $transModel->getAvailableBalance($customerId);
        $holdingPoints = $transModel->getHoldingBalance($customerId);
        $usedPoints = $transModel->getUsedBalance($customerId);
        $expiredPoints = $transModel->getExpiredBalance($customerId);
        
        // Get rolling 12 months stats for tier progress
        $currentOrders = 0;
        $currentSpend = 0.00;
        if (!empty($phone)) {
            $stmtStats = $db->prepare("
                SELECT 
                    COUNT(*) as order_count,
                    COALESCE(SUM(subtotal - discount), 0) as total_spend
                FROM orders
                WHERE (customer_id = :cust_id OR phone = :phone)
                  AND order_status = 'completed'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            ");
            $stmtStats->execute([':cust_id' => $customerId, ':phone' => $phone]);
            $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);
            $currentOrders = (int)($stats['order_count'] ?? 0);
            $currentSpend = (float)($stats['total_spend'] ?? 0);
        }

        $settings = new \App\Models\LoyaltySettings();
        $diamondSpend = (float)($settings->get('tier_diamond_spend') ?: 10000000);
        $diamondOrders = (int)($settings->get('tier_diamond_orders') ?: 12);
        
        $goldSpend = (float)($settings->get('tier_gold_spend') ?: 5000000);
        $goldOrders = (int)($settings->get('tier_gold_orders') ?: 6);
        
        $silverSpend = (float)($settings->get('tier_silver_spend') ?: 2000000);
        $silverOrders = (int)($settings->get('tier_silver_orders') ?: 3);

        $nextTier = null;
        $tierName = $profile['tier_name'] ?: 'Member';
        if ($tierName === 'Member') {
            $nextTier = [
                'name' => 'Silver',
                'minSpend' => $silverSpend,
                'minOrders' => $silverOrders,
                'currentSpend' => $currentSpend,
                'currentOrders' => $currentOrders,
            ];
        } elseif ($tierName === 'Silver') {
            $nextTier = [
                'name' => 'Gold',
                'minSpend' => $goldSpend,
                'minOrders' => $goldOrders,
                'currentSpend' => $currentSpend,
                'currentOrders' => $currentOrders,
            ];
        } elseif ($tierName === 'Gold') {
            $nextTier = [
                'name' => 'Diamond',
                'minSpend' => $diamondSpend,
                'minOrders' => $diamondOrders,
                'currentSpend' => $currentSpend,
                'currentOrders' => $currentOrders,
            ];
        }

        // Get tier redemption cap percentage
        $tierKey = strtolower($tierName);
        $capPercent = (int)($settings->get("tier_{$tierKey}_cap") ?: 10);
        $otpRequired = (int)($settings->get('otp_required_redemption') ?: 1) === 1;

        Response::json([
            'success' => true,
            'data' => [
                'pointsBalance' => $pointsBalance,
                'holdingPoints' => $holdingPoints,
                'usedPoints' => $usedPoints,
                'expiredPoints' => $expiredPoints,
                'phoneVerified' => $isPhoneVerified === 1,
                'phone' => $phone,
                'otpRequired' => $otpRequired,
                'tier' => [
                    'name' => $tierName,
                    'multiplier' => (float)($profile['tier_multiplier'] ?: 1.0),
                    'color' => $profile['tier_color'] ?: '#64748B',
                    'benefits' => $profile['tier_benefits'] ?: 'Tích điểm cơ bản',
                    'capPercent' => $capPercent
                ],
                'nextTier' => $nextTier,
                'totalEarned' => $pointsBalance + $usedPoints,
                'totalSpent' => $usedPoints
            ]
        ]);
    }

    /**
     * GET /api/customer/club/transactions
     */
    public function transactions() {
        $customer = AuthMiddleware::requireCustomer();
        
        $model = new \App\Models\LoyaltyPointTransaction();
        $rows = $model->getCustomerTransactions($customer['id']);
        
        if (empty($rows) && !empty($customer['phone'])) {
            // fallback to legacy
            $legacyModel = new CustomerPointTransactionModel();
            $legacyRows = $legacyModel->getCustomerTransactions($customer['phone']);
            // map legacy format to new format
            $rows = array_map(function($r) {
                return [
                    'id' => (int)$r['id'],
                    'customer_id' => null,
                    'order_id' => $r['reference_type'] === 'order' ? $r['reference_id'] : null,
                    'source' => strpos($r['type'], 'shopee') !== false ? 'shopee' : 'website',
                    'type' => strpos($r['type'], 'spend') !== false ? 'redeem' : 'earn',
                    'status' => 'available',
                    'points' => (int)$r['points'],
                    'eligible_amount' => 0,
                    'multiplier' => 1.0,
                    'balance_after' => (int)$r['balance_after'],
                    'expires_at' => null,
                    'reference_type' => $r['reference_type'],
                    'reference_id' => $r['reference_id'],
                    'reason' => $r['note'],
                    'created_at' => $r['created_at']
                ];
            }, $legacyRows);
        }
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
