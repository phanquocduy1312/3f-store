<?php
namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use PDO;

class AdminAnalyticsController
{
    private function getFilterDates($filter)
    {
        switch ($filter) {
            case 'today':
                $start = date('Y-m-d 00:00:00');
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
                $prevEnd = date('Y-m-d 23:59:59', strtotime('-1 day'));
                break;
            case 'this_week':
                $start = date('Y-m-d 00:00:00', strtotime('monday this week'));
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-m-d 00:00:00', strtotime('monday last week'));
                $prevEnd = date('Y-m-d 23:59:59', strtotime('sunday last week'));
                break;
            case 'this_month':
                $start = date('Y-m-01 00:00:00');
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-m-01 00:00:00', strtotime('last month'));
                $prevEnd = date('Y-m-t 23:59:59', strtotime('last month'));
                break;
            case 'this_year':
                $start = date('Y-01-01 00:00:00');
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-01-01 00:00:00', strtotime('-1 year'));
                $prevEnd = date('Y-12-31 23:59:59', strtotime('-1 year'));
                break;
            case '7_days':
                $start = date('Y-m-d 00:00:00', strtotime('-6 days'));
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-m-d 00:00:00', strtotime('-13 days'));
                $prevEnd = date('Y-m-d 23:59:59', strtotime('-7 days'));
                break;
            case '30_days':
                $start = date('Y-m-d 00:00:00', strtotime('-29 days'));
                $end = date('Y-m-d 23:59:59');
                $prevStart = date('Y-m-d 00:00:00', strtotime('-59 days'));
                $prevEnd = date('Y-m-d 23:59:59', strtotime('-30 days'));
                break;
            case 'all_time':
            default:
                $start = '1970-01-01 00:00:00';
                $end = date('Y-m-d 23:59:59');
                $prevStart = '1970-01-01 00:00:00';
                $prevEnd = '1970-01-01 00:00:00';
                break;
        }
        return [$start, $end, $prevStart, $prevEnd];
    }

    public function getOverviewStats()
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();
        $filter = Request::query('filter', '30_days');
        list($start, $end, $prevStart, $prevEnd) = $this->getFilterDates($filter);

        // 1. KPI overview (Revenue, Orders, AOV, Cancelled/Returned Rates)
        // Valid paid statuses: confirmed, packing, preparing, awaiting_pickup_or_booking, shipping, delivered, completed, paid_or_cod
        $sqlRev = "SELECT SUM(total) FROM orders WHERE order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment') AND created_at BETWEEN :start AND :end";
        $sqlOrd = "SELECT COUNT(*) FROM orders WHERE created_at BETWEEN :start AND :end";
        $sqlCancel = "SELECT COUNT(*) FROM orders WHERE order_status = 'cancelled' AND created_at BETWEEN :start AND :end";
        $sqlReturn = "SELECT COUNT(*) FROM orders WHERE order_status IN ('return_requested', 'return_completed') AND created_at BETWEEN :start AND :end";

        // Current period
        $stmt = $db->prepare($sqlRev); $stmt->execute([':start' => $start, ':end' => $end]);
        $rev = (float)$stmt->fetchColumn();

        $stmt = $db->prepare($sqlOrd); $stmt->execute([':start' => $start, ':end' => $end]);
        $orders = (int)$stmt->fetchColumn();

        $stmt = $db->prepare($sqlCancel); $stmt->execute([':start' => $start, ':end' => $end]);
        $cancelled = (int)$stmt->fetchColumn();

        $stmt = $db->prepare($sqlReturn); $stmt->execute([':start' => $start, ':end' => $end]);
        $returned = (int)$stmt->fetchColumn();

        $aov = $orders > 0 ? round($rev / $orders, 2) : 0;
        $cancelRate = $orders > 0 ? round(($cancelled / $orders) * 100, 2) : 0;
        $returnRate = $orders > 0 ? round(($returned / $orders) * 100, 2) : 0;

        // Previous period
        $stmt = $db->prepare($sqlRev); $stmt->execute([':start' => $prevStart, ':end' => $prevEnd]);
        $prevRev = (float)$stmt->fetchColumn();

        $stmt = $db->prepare($sqlOrd); $stmt->execute([':start' => $prevStart, ':end' => $prevEnd]);
        $prevOrders = (int)$stmt->fetchColumn();

        $prevAov = $prevOrders > 0 ? round($prevRev / $prevOrders, 2) : 0;

        // Growth rates
        $calcGrowth = function($curr, $prev) {
            if ($prev == 0) return $curr > 0 ? 100 : 0;
            return round((($curr - $prev) / $prev) * 100, 1);
        };

        $revGrowth = $calcGrowth($rev, $prevRev);
        $ordersGrowth = $calcGrowth($orders, $prevOrders);
        $aovGrowth = $calcGrowth($aov, $prevAov);

        // 2. Order Funnel
        // Retrieve count of all order statuses
        $funnelSql = "
            SELECT order_status, COUNT(*) as count 
            FROM orders 
            WHERE created_at BETWEEN :start AND :end 
            GROUP BY order_status
        ";
        $stmt = $db->prepare($funnelSql);
        $stmt->execute([':start' => $start, ':end' => $end]);
        $funnelRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $funnelStages = [
            'pending_confirmation' => ['name' => '1. Chờ xác nhận', 'count' => 0],
            'confirmed' => ['name' => '2. Đã xác nhận', 'count' => 0],
            'preparing' => ['name' => '3. Chuẩn bị hàng', 'count' => 0],
            'awaiting_pickup_or_booking' => ['name' => '4. Chờ shipper', 'count' => 0],
            'shipping' => ['name' => '5. Đang giao', 'count' => 0],
            'delivered' => ['name' => '6. Giao thành công', 'count' => 0],
            'completed' => ['name' => '7. Hoàn tất', 'count' => 0]
        ];

        foreach ($funnelRows as $row) {
            $status = $row['order_status'];
            // Normalize old statuses
            if ($status === 'pending') $status = 'pending_confirmation';
            if ($status === 'packing') $status = 'preparing';
            
            if (isset($funnelStages[$status])) {
                $funnelStages[$status]['count'] += (int)$row['count'];
            }
        }
        $funnel = array_values($funnelStages);

        // 3. Operational Mixes (Shipping, Payment, Source)
        $mixesSql = "
            SELECT 
                shipping_method, 
                payment_method, 
                order_source, 
                COUNT(*) as count, 
                SUM(total) as revenue 
            FROM orders 
            WHERE created_at BETWEEN :start AND :end 
              AND order_status != 'cancelled'
            GROUP BY shipping_method, payment_method, order_source
        ";
        $stmt = $db->prepare($mixesSql);
        $stmt->execute([':start' => $start, ':end' => $end]);
        $mixRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $shippingMix = [];
        $paymentMix = [];
        $sourceMix = [];

        foreach ($mixRows as $row) {
            $cnt = (int)$row['count'];
            $revenue = (float)$row['revenue'];

            $ship = $row['shipping_method'] ?: 'Standard';
            $pay = $row['payment_method'] ?: 'COD';
            $src = $row['order_source'] ?: 'website';

            // Shipping
            if (!isset($shippingMix[$ship])) $shippingMix[$ship] = ['name' => $ship, 'value' => 0, 'revenue' => 0];
            $shippingMix[$ship]['value'] += $cnt;
            $shippingMix[$ship]['revenue'] += $revenue;

            // Payment
            if (!isset($paymentMix[$pay])) $paymentMix[$pay] = ['name' => $pay, 'value' => 0, 'revenue' => 0];
            $paymentMix[$pay]['value'] += $cnt;
            $paymentMix[$pay]['revenue'] += $revenue;

            // Source
            if (!isset($sourceMix[$src])) $sourceMix[$src] = ['name' => $src, 'value' => 0, 'revenue' => 0];
            $sourceMix[$src]['value'] += $cnt;
            $sourceMix[$src]['revenue'] += $revenue;
        }

        // 4. Sales Timeline Curve
        $timelineSql = "";
        $timelineParams = [':start' => $start, ':end' => $end];
        
        if ($filter === 'today') {
            $timelineSql = "
                SELECT HOUR(created_at) as time_key, SUM(total) as revenue, COUNT(*) as count 
                FROM orders 
                WHERE order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment') 
                  AND created_at BETWEEN :start AND :end 
                GROUP BY HOUR(created_at)
            ";
        } else if ($filter === 'this_year') {
            $timelineSql = "
                SELECT MONTH(created_at) as time_key, SUM(total) as revenue, COUNT(*) as count 
                FROM orders 
                WHERE order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment') 
                  AND created_at BETWEEN :start AND :end 
                GROUP BY MONTH(created_at)
            ";
        } else {
            $timelineSql = "
                SELECT DATE(created_at) as time_key, SUM(total) as revenue, COUNT(*) as count 
                FROM orders 
                WHERE order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment') 
                  AND created_at BETWEEN :start AND :end 
                GROUP BY DATE(created_at)
            ";
        }

        $stmt = $db->prepare($timelineSql);
        $stmt->execute($timelineParams);
        $timelineRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $timeline = [];
        if ($filter === 'today') {
            for ($h = 0; $h < 24; $h++) {
                $lbl = sprintf("%02d:00", $h);
                $timeline[$h] = ['name' => $lbl, 'Doanh thu' => 0, 'Đơn hàng' => 0];
            }
            foreach ($timelineRows as $row) {
                $h = (int)$row['time_key'];
                if (isset($timeline[$h])) {
                    $timeline[$h]['Doanh thu'] = (float)$row['revenue'];
                    $timeline[$h]['Đơn hàng'] = (int)$row['count'];
                }
            }
        } else if ($filter === 'this_year') {
            for ($m = 1; $m <= 12; $m++) {
                $lbl = "Tháng " . $m;
                $timeline[$m] = ['name' => $lbl, 'Doanh thu' => 0, 'Đơn hàng' => 0];
            }
            foreach ($timelineRows as $row) {
                $m = (int)$row['time_key'];
                if (isset($timeline[$m])) {
                    $timeline[$m]['Doanh thu'] = (float)$row['revenue'];
                    $timeline[$m]['Đơn hàng'] = (int)$row['count'];
                }
            }
        } else {
            // Generate all days in range
            $startTs = strtotime($start);
            $endTs = strtotime($end);
            $curr = $startTs;
            while ($curr <= $endTs) {
                $dateStr = date('Y-m-d', $curr);
                $lbl = date('d/m', $curr);
                $timeline[$dateStr] = ['name' => $lbl, 'Doanh thu' => 0, 'Đơn hàng' => 0];
                $curr = strtotime('+1 day', $curr);
            }
            foreach ($timelineRows as $row) {
                $dt = $row['time_key'];
                if (isset($timeline[$dt])) {
                    $timeline[$dt]['Doanh thu'] = (float)$row['revenue'];
                    $timeline[$dt]['Đơn hàng'] = (int)$row['count'];
                }
            }
        }

        Response::json([
            'success' => true,
            'data' => [
                'kpis' => [
                    'revenue' => ['value' => $rev, 'growth' => $revGrowth, 'label' => number_format($rev, 0, ',', '.') . 'đ'],
                    'orders' => ['value' => $orders, 'growth' => $ordersGrowth, 'label' => (string)$orders],
                    'aov' => ['value' => $aov, 'growth' => $aovGrowth, 'label' => number_format($aov, 0, ',', '.') . 'đ'],
                    'cancelRate' => ['value' => $cancelRate, 'label' => $cancelRate . '%'],
                    'returnRate' => ['value' => $returnRate, 'label' => $returnRate . '%']
                ],
                'funnel' => $funnel,
                'shippingMix' => array_values($shippingMix),
                'paymentMix' => array_values($paymentMix),
                'sourceMix' => array_values($sourceMix),
                'timeline' => array_values($timeline)
            ]
        ]);
    }

    public function getProductStats()
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();
        $filter = Request::query('filter', '30_days');
        list($start, $end) = $this->getFilterDates($filter);

        // 1. Sales by category
        $catSql = "
            SELECT 
                c.id, 
                c.name as category_name, 
                SUM(oi.price * oi.quantity) as revenue, 
                SUM(oi.quantity) as quantity
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            JOIN product_categories c ON c.id = p.category_id
            WHERE o.order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment')
              AND o.created_at BETWEEN :start AND :end
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
        ";
        $stmt = $db->prepare($catSql);
        $stmt->execute([':start' => $start, ':end' => $end]);
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Top Selling Products
        $topSql = "
            SELECT 
                oi.product_id, 
                p.name, 
                p.main_image_url as image,
                SUM(oi.quantity) as sold, 
                SUM(oi.price * oi.quantity) as revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE o.order_status NOT IN ('cancelled', 'pending_confirmation', 'pending_payment')
              AND o.created_at BETWEEN :start AND :end
            GROUP BY oi.product_id, p.name, p.main_image_url
            ORDER BY sold DESC, revenue DESC
            LIMIT 10
        ";
        $stmt = $db->prepare($topSql);
        $stmt->execute([':start' => $start, ':end' => $end]);
        $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Low stock alerts
        $stockSql = "
            SELECT id, name, total_stock as stock, total_stock <= 0 as out_of_stock
            FROM products
            WHERE is_active = 1 AND total_stock <= 10
            ORDER BY total_stock ASC
            LIMIT 15
        ";
        $lowStock = $db->query($stockSql)->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'topProducts' => $topProducts,
                'lowStock' => $lowStock
            ]
        ]);
    }

    public function getCustomerStats()
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();

        // 1. Member Tiers Mix
        $tierSql = "
            SELECT 
                t.name as tier_name, 
                t.color as tier_color,
                COUNT(*) as count 
            FROM customer_loyalty_profiles p
            JOIN loyalty_tiers t ON p.current_tier_id = t.id
            GROUP BY t.id, t.name, t.color
        ";
        $tiersMix = $db->query($tierSql)->fetchAll(PDO::FETCH_ASSOC);

        // 2. Pet Species Distribution
        $petSql = "
            SELECT species, COUNT(*) as count 
            FROM customer_pets 
            WHERE deleted_at IS NULL 
            GROUP BY species
        ";
        $speciesRows = $db->query($petSql)->fetchAll(PDO::FETCH_ASSOC);
        
        $speciesLabels = [
            'dog' => 'Chó',
            'cat' => 'Mèo',
            'other' => 'Khác'
        ];
        $speciesMix = [];
        foreach ($speciesRows as $row) {
            $key = $row['species'] ?: 'other';
            $speciesMix[] = [
                'name' => $speciesLabels[$key] ?? 'Khác',
                'value' => (int)$row['count']
            ];
        }

        // 3. Pet Health Issues / Needs parsed from AI advisor JSON
        $consultationsSql = "
            SELECT ai_result 
            FROM customer_pets 
            WHERE ai_result IS NOT NULL 
              AND ai_result <> '' 
              AND deleted_at IS NULL
        ";
        $consultations = $db->query($consultationsSql)->fetchAll(PDO::FETCH_ASSOC);

        $counts = [
            'Kén ăn' => 0,
            'Tiêu hóa' => 0,
            'Da lông' => 0,
            'Tiết niệu' => 0,
            'Hairball' => 0,
            'Tăng cân' => 0
        ];
        foreach ($consultations as $row) {
            $parsed = json_decode($row['ai_result'] ?? '', true);
            if ($parsed) {
                $needs = $parsed['detected_needs'] ?? $parsed['pet_profile']['detected_needs'] ?? [];
                if (!is_array($needs)) {
                    $needs = [];
                }
                foreach ($needs as $need) {
                    if (empty($need)) continue;
                    if (!isset($counts[$need])) {
                        $counts[$need] = 0;
                    }
                    $counts[$need]++;
                }
            }
        }
        $petNeeds = [];
        foreach ($counts as $name => $count) {
            $petNeeds[] = ['name' => $name, 'value' => $count];
        }
        usort($petNeeds, function($a, $b) {
            return $b['value'] <=> $a['value'];
        });

        // 4. Loyalty points stats (Timeline of Earned vs Redeemed)
        $loyaltyTimelineSql = "
            SELECT 
                DATE(created_at) as date,
                SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as earned,
                SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as redeemed
            FROM customer_point_transactions
            GROUP BY DATE(created_at)
            ORDER BY date ASC
            LIMIT 60
        ";
        $loyaltyTimeline = $db->query($loyaltyTimelineSql)->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'success' => true,
            'data' => [
                'tiers' => $tiersMix,
                'species' => $speciesMix,
                'petNeeds' => $petNeeds,
                'loyaltyTimeline' => $loyaltyTimeline
            ]
        ]);
    }

    public function getMarketingStats()
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();

        // 1. Banners CTR analysis
        $bannerSql = "
            SELECT 
                id, 
                placement, 
                title, 
                image_url,
                impression_count as views, 
                click_count as clicks
            FROM banners
            WHERE deleted_at IS NULL
            ORDER BY views DESC, clicks DESC
        ";
        $banners = $db->query($bannerSql)->fetchAll(PDO::FETCH_ASSOC);
        foreach ($banners as &$b) {
            $v = (int)$b['views'];
            $c = (int)$b['clicks'];
            $b['ctr'] = $v > 0 ? round(($c / $v) * 100, 2) : 0;
        }

        // 2. Voucher campaign efficiency
        $voucherSql = "
            SELECT 
                code, 
                name, 
                discount_type, 
                discount_value,
                usage_limit, 
                used_count,
                is_active
            FROM coupons
            ORDER BY used_count DESC, code ASC
        ";
        $vouchers = $db->query($voucherSql)->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'success' => true,
            'data' => [
                'banners' => $banners,
                'vouchers' => $vouchers
            ]
        ]);
    }
}
