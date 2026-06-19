<?php
namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Helpers\AuthMiddleware;
use PDO;

class AdminDashboardController {
    public function getStats() {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();

        // 1. Doanh thu hôm nay vs hôm qua
        $revToday = (float)$db->query("
            SELECT SUM(total) 
            FROM orders 
            WHERE order_status IN ('confirmed', 'packing', 'shipping', 'completed') 
              AND DATE(created_at) = CURDATE()
        ")->fetchColumn();

        $revYesterday = (float)$db->query("
            SELECT SUM(total) 
            FROM orders 
            WHERE order_status IN ('confirmed', 'packing', 'shipping', 'completed') 
              AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // 2. Số đơn hôm nay vs hôm qua
        $ordersToday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status != 'cancelled' 
              AND DATE(created_at) = CURDATE()
        ")->fetchColumn();

        $ordersYesterday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status != 'cancelled' 
              AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // 3. Đơn chờ xác nhận (pending) hôm nay vs hôm qua
        $pendingToday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status = 'pending'
        ")->fetchColumn();

        $pendingYesterday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status = 'pending' 
              AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // 4. Đơn đang giao (shipping) hôm nay vs hôm qua
        $shippingToday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status = 'shipping'
        ")->fetchColumn();

        $shippingYesterday = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status = 'shipping' 
              AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // 5. Khách hàng mới hôm nay vs hôm qua
        $customersToday = (int)$db->query("
            SELECT COUNT(*) 
            FROM customers 
            WHERE DATE(created_at) = CURDATE()
        ")->fetchColumn();

        $customersYesterday = (int)$db->query("
            SELECT COUNT(*) 
            FROM customers 
            WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // 6. Điểm 3F Club đã cộng hôm nay vs hôm qua
        $pointsToday = (int)$db->query("
            SELECT SUM(points) 
            FROM customer_point_transactions 
            WHERE points > 0 
              AND DATE(created_at) = CURDATE()
        ")->fetchColumn();

        $pointsYesterday = (int)$db->query("
            SELECT SUM(points) 
            FROM customer_point_transactions 
            WHERE points > 0 
              AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // Helper function for percentage change string
        $pctChange = function($today, $yesterday) {
            if ($yesterday == 0) {
                return $today > 0 ? "+100%" : "0%";
            }
            $diff = (($today - $yesterday) / $yesterday) * 100;
            return ($diff >= 0 ? "+" : "") . round($diff, 1) . "%";
        };

        $pctTrend = function($today, $yesterday) {
            return ($today >= $yesterday) ? "up" : "down";
        };

        // Format values
        $formatMoney = function($val) {
            return number_format($val, 0, ',', '.') . 'đ';
        };

        $data = [
            'revenue' => [
                'value' => $formatMoney($revToday),
                'change' => $pctChange($revToday, $revYesterday),
                'trend' => $pctTrend($revToday, $revYesterday)
            ],
            'orders' => [
                'value' => (string)$ordersToday,
                'change' => $pctChange($ordersToday, $ordersYesterday),
                'trend' => $pctTrend($ordersToday, $ordersYesterday)
            ],
            'pending' => [
                'value' => (string)$pendingToday,
                'change' => ($pendingToday - $pendingYesterday >= 0 ? "+" : "") . ($pendingToday - $pendingYesterday),
                'trend' => $pctTrend($pendingToday, $pendingYesterday)
            ],
            'shipping' => [
                'value' => (string)$shippingToday,
                'change' => $pctChange($shippingToday, $shippingYesterday),
                'trend' => $pctTrend($shippingToday, $shippingYesterday)
            ],
            'newCustomers' => [
                'value' => (string)$customersToday,
                'change' => $pctChange($customersToday, $customersYesterday),
                'trend' => $pctTrend($customersToday, $customersYesterday)
            ],
            'points' => [
                'value' => number_format($pointsToday, 0, ',', '.'),
                'change' => $pctChange($pointsToday, $pointsYesterday),
                'trend' => $pctTrend($pointsToday, $pointsYesterday)
            ]
        ];

        Response::json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getRevenueChart() {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();

        $days = (int)Request::input('days', 7);
        if ($days <= 0 || $days > 90) {
            $days = 7;
        }

        // Initialize empty calendar days
        $chartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dateStr = date('Y-m-d', strtotime("-$i days"));
            $displayDate = date('d/m', strtotime("-$i days"));
            $chartData[$dateStr] = [
                'name' => $displayDate,
                'Doanh thu' => 0,
                'Đơn hàng' => 0
            ];
        }

        // Fetch actual stats grouped by day
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as order_date,
                SUM(total) as daily_revenue,
                COUNT(*) as daily_orders
            FROM orders
            WHERE order_status IN ('confirmed', 'packing', 'shipping', 'completed')
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $stmt->bindValue(':days', $days - 1, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as $row) {
            $dateStr = $row['order_date'];
            if (isset($chartData[$dateStr])) {
                $chartData[$dateStr]['Doanh thu'] = (float)$row['daily_revenue'];
                $chartData[$dateStr]['Đơn hàng'] = (int)$row['daily_orders'];
            }
        }

        Response::json([
            'success' => true,
            'data' => array_values($chartData)
        ]);
    }

    public function getTaskQueue() {
        AuthMiddleware::requireAdmin();
        $db = Database::getInstance()->getConnection();

        // 1. Yêu cầu Shopee đang chờ duyệt
        $shopeePending = (int)$db->query("
            SELECT COUNT(*) 
            FROM shopee_point_requests 
            WHERE processing_status = 'pending'
        ")->fetchColumn();

        // 2. Yêu cầu Shopee quá 48h
        $shopeeOverdue = (int)$db->query("
            SELECT COUNT(*) 
            FROM shopee_point_requests 
            WHERE processing_status = 'pending' 
              AND created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)
        ")->fetchColumn();

        // 3. Đơn hàng cần xác nhận
        $ordersPending = (int)$db->query("
            SELECT COUNT(*) 
            FROM orders 
            WHERE order_status = 'pending'
        ")->fetchColumn();

        // 4. Sản phẩm sắp hết hàng
        $productsLowStock = (int)$db->query("
            SELECT COUNT(*) 
            FROM products 
            WHERE total_stock <= 10 
              AND is_active = 1
        ")->fetchColumn();

        Response::json([
            'success' => true,
            'data' => [
                'shopeePending' => $shopeePending,
                'shopeeOverdue' => $shopeeOverdue,
                'ordersPending' => $ordersPending,
                'productsLowStock' => $productsLowStock
            ]
        ]);
    }
}
