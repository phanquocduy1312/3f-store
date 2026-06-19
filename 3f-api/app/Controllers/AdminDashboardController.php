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

        $filter = Request::input('filter', 'today');

        switch ($filter) {
            case 'this_week':
                // Monday of this week to end of today
                $currentStart = date('Y-m-d 00:00:00', strtotime('monday this week'));
                $currentEnd = date('Y-m-d 23:59:59');
                
                // Monday of last week to Sunday of last week
                $previousStart = date('Y-m-d 00:00:00', strtotime('monday last week'));
                $previousEnd = date('Y-m-d 23:59:59', strtotime('sunday last week'));
                break;

            case 'this_month':
                // First day of this month to end of today
                $currentStart = date('Y-m-01 00:00:00');
                $currentEnd = date('Y-m-d 23:59:59');
                
                // First day of last month to last day of last month
                $previousStart = date('Y-m-01 00:00:00', strtotime('last month'));
                $previousEnd = date('Y-m-t 23:59:59', strtotime('last month'));
                break;

            case 'this_year':
                // Jan 1st of this year to end of today
                $currentStart = date('Y-01-01 00:00:00');
                $currentEnd = date('Y-m-d 23:59:59');
                
                // Jan 1st of last year to Dec 31st of last year
                $previousStart = date('Y-01-01 00:00:00', strtotime('-1 year'));
                $previousEnd = date('Y-12-31 23:59:59', strtotime('-1 year'));
                break;

            case 'all_time':
                $currentStart = '1970-01-01 00:00:00';
                $currentEnd = date('Y-m-d 23:59:59');
                
                $previousStart = '1970-01-01 00:00:00';
                $previousEnd = '1970-01-01 00:00:00';
                break;

            case 'today':
            default:
                $currentStart = date('Y-m-d 00:00:00');
                $currentEnd = date('Y-m-d 23:59:59');
                
                $previousStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
                $previousEnd = date('Y-m-d 23:59:59', strtotime('-1 day'));
                break;
        }

        $getSum = function($sql, $start, $end) use ($db) {
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':start', $start);
            $stmt->bindValue(':end', $end);
            $stmt->execute();
            return (float)$stmt->fetchColumn();
        };

        $getCount = function($sql, $start, $end) use ($db) {
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':start', $start);
            $stmt->bindValue(':end', $end);
            $stmt->execute();
            return (int)$stmt->fetchColumn();
        };

        // Queries
        $sqlRev = "SELECT SUM(total) FROM orders WHERE order_status IN ('confirmed', 'packing', 'shipping', 'completed') AND created_at BETWEEN :start AND :end";
        $sqlOrd = "SELECT COUNT(*) FROM orders WHERE order_status != 'cancelled' AND created_at BETWEEN :start AND :end";
        $sqlPending = "SELECT COUNT(*) FROM orders WHERE order_status = 'pending' AND created_at BETWEEN :start AND :end";
        $sqlShipping = "SELECT COUNT(*) FROM orders WHERE order_status = 'shipping' AND created_at BETWEEN :start AND :end";
        $sqlCust = "SELECT COUNT(*) FROM customers WHERE created_at BETWEEN :start AND :end";
        $sqlPoints = "SELECT SUM(points) FROM customer_point_transactions WHERE points > 0 AND created_at BETWEEN :start AND :end";

        // Current period values
        $revToday = $getSum($sqlRev, $currentStart, $currentEnd);
        $ordersToday = $getCount($sqlOrd, $currentStart, $currentEnd);
        $pendingToday = $getCount($sqlPending, $currentStart, $currentEnd);
        $shippingToday = $getCount($sqlShipping, $currentStart, $currentEnd);
        $customersToday = $getCount($sqlCust, $currentStart, $currentEnd);
        $pointsToday = $getSum($sqlPoints, $currentStart, $currentEnd);

        // Previous period values (for change calculations)
        $revYesterday = $getSum($sqlRev, $previousStart, $previousEnd);
        $ordersYesterday = $getCount($sqlOrd, $previousStart, $previousEnd);
        $pendingYesterday = $getCount($sqlPending, $previousStart, $previousEnd);
        $shippingYesterday = $getCount($sqlShipping, $previousStart, $previousEnd);
        $customersYesterday = $getCount($sqlCust, $previousStart, $previousEnd);
        $pointsYesterday = $getSum($sqlPoints, $previousStart, $previousEnd);

        // Percentage/Absolute trend strings
        $changeStr = function($today, $yesterday, $isAbsolute = false) use ($filter) {
            if ($filter === 'all_time') {
                return "0%";
            }
            if ($isAbsolute) {
                $diff = $today - $yesterday;
                return ($diff >= 0 ? "+" : "") . $diff;
            }
            if ($yesterday == 0) {
                return $today > 0 ? "+100%" : "0%";
            }
            $diff = (($today - $yesterday) / $yesterday) * 100;
            return ($diff >= 0 ? "+" : "") . round($diff, 1) . "%";
        };

        $pctTrend = function($today, $yesterday) {
            return ($today >= $yesterday) ? "up" : "down";
        };

        $formatMoney = function($val) {
            return number_format($val, 0, ',', '.') . 'đ';
        };

        $data = [
            'revenue' => [
                'value' => $formatMoney($revToday),
                'change' => $changeStr($revToday, $revYesterday),
                'trend' => $pctTrend($revToday, $revYesterday)
            ],
            'orders' => [
                'value' => (string)$ordersToday,
                'change' => $changeStr($ordersToday, $ordersYesterday),
                'trend' => $pctTrend($ordersToday, $ordersYesterday)
            ],
            'pending' => [
                'value' => (string)$pendingToday,
                'change' => $changeStr($pendingToday, $pendingYesterday, true),
                'trend' => $pctTrend($pendingToday, $pendingYesterday)
            ],
            'shipping' => [
                'value' => (string)$shippingToday,
                'change' => $changeStr($shippingToday, $shippingYesterday),
                'trend' => $pctTrend($shippingToday, $shippingYesterday)
            ],
            'newCustomers' => [
                'value' => (string)$customersToday,
                'change' => $changeStr($customersToday, $customersYesterday),
                'trend' => $pctTrend($customersToday, $customersYesterday)
            ],
            'points' => [
                'value' => number_format($pointsToday, 0, ',', '.'),
                'change' => $changeStr($pointsToday, $pointsYesterday),
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
