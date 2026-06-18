<?php
namespace App\Models;

use App\Core\Database;
use PDO;
use Exception;

class Coupon {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get active coupon by code
     */
    public function getCouponByCode($code) {
        $code = strtoupper(trim($code));
        $stmt = $this->db->prepare("
            SELECT * FROM coupons 
            WHERE code = :code AND is_active = 1 
            LIMIT 1
        ");
        $stmt->execute([':code' => $code]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Validate coupon rules and compute discount
     */
    public function validateCoupon($code, $subtotal, $customerPhone = null) {
        $coupon = $this->getCouponByCode($code);
        if (!$coupon) {
            return [
                "success" => false,
                "message" => "Mã giảm giá không hợp lệ."
            ];
        }

        // Check date ranges
        $now = date('Y-m-d H:i:s');
        if (!empty($coupon['starts_at']) && $coupon['starts_at'] > $now) {
            return [
                "success" => false,
                "message" => "Mã giảm giá không hợp lệ."
            ];
        }
        if (!empty($coupon['ends_at']) && $coupon['ends_at'] < $now) {
            return [
                "success" => false,
                "message" => "Mã giảm giá không hợp lệ."
            ];
        }

        // Check min order amount
        if ($subtotal < (float)$coupon['min_order_amount']) {
            return [
                "success" => false,
                "message" => "Đơn hàng chưa đủ điều kiện áp dụng mã."
            ];
        }

        // Check overall usage limit
        if ($coupon['usage_limit'] !== null && $coupon['used_count'] >= (int)$coupon['usage_limit']) {
            return [
                "success" => false,
                "message" => "Mã giảm giá đã hết lượt sử dụng."
            ];
        }

        // Check per customer limit
        if ($coupon['per_customer_limit'] !== null && !empty($customerPhone)) {
            $stmtUsages = $this->db->prepare("
                SELECT COUNT(*) AS cnt FROM coupon_usages 
                WHERE coupon_id = :coupon_id AND customer_phone = :phone
            ");
            $stmtUsages->execute([
                ':coupon_id' => $coupon['id'],
                ':phone' => trim($customerPhone)
            ]);
            $usageRow = $stmtUsages->fetch(PDO::FETCH_ASSOC);
            $userUsageCount = (int)($usageRow['cnt'] ?? 0);

            if ($userUsageCount >= (int)$coupon['per_customer_limit']) {
                return [
                    "success" => false,
                    "message" => "Bạn đã sử dụng mã giảm giá này tối đa số lần cho phép."
                ];
            }
        }

        // Compute discount amount
        $discountAmount = 0.00;
        $val = (float)$coupon['discount_value'];
        if ($coupon['discount_type'] === 'fixed') {
            $discountAmount = min($val, $subtotal);
        } else if ($coupon['discount_type'] === 'percent') {
            $discountAmount = $subtotal * ($val / 100);
            if (!empty($coupon['max_discount_amount'])) {
                $discountAmount = min($discountAmount, (float)$coupon['max_discount_amount']);
            }
        }

        // Final sanity checks
        $discountAmount = max(0.00, min($discountAmount, $subtotal));

        return [
            "success" => true,
            "data" => [
                "id" => (int)$coupon['id'],
                "code" => $coupon['code'],
                "name" => $coupon['name'],
                "description" => $coupon['description'],
                "discountType" => $coupon['discount_type'],
                "discountValue" => $val,
                "discountAmount" => $discountAmount
            ]
        ];
    }

    /**
     * Record coupon usage
     */
    public function recordUsage($couponId, $orderId, $customerPhone, $discountAmount) {
        $stmt = $this->db->prepare("
            INSERT INTO coupon_usages (coupon_id, order_id, customer_phone, discount_amount) 
            VALUES (:coupon_id, :order_id, :customer_phone, :discount_amount)
        ");
        $stmt->execute([
            ':coupon_id' => (int)$couponId,
            ':order_id' => (int)$orderId,
            ':customer_phone' => $customerPhone ? trim($customerPhone) : null,
            ':discount_amount' => (float)$discountAmount
        ]);

        $stmtInc = $this->db->prepare("
            UPDATE coupons 
            SET used_count = used_count + 1 
            WHERE id = :id
        ");
        $stmtInc->execute([':id' => (int)$couponId]);
    }
}
