# Researcher Report: Business Logic & Backend Integration for Admin Dashboard

Analyze existing tables, API endpoints, and React components to connect the Admin Dashboard with real operation data and proper business logic.

## 1. Database Schema & Business Logic Mapping

Our backend uses standard MySQL tables. We map dashboard statistics to the database as follows:

| Metric | Database Fields / Table | Business Logic & Rules |
| :--- | :--- | :--- |
| **Doanh thu hôm nay** | `orders.total` | Sum of `total` for orders created today (`DATE(created_at) = CURDATE()`) with status in `confirmed`, `packing`, `shipping`, `completed`. Excludes `pending` (unconfirmed/unpaid) and `cancelled` orders. |
| **Số đơn hôm nay** | `orders` | Count of orders created today (`DATE(created_at) = CURDATE()`) with status not equal to `cancelled`. |
| **Đơn chờ xác nhận** | `orders` | Count of all active orders with `order_status = 'pending'` requiring admin verification. |
| **Đơn đang giao** | `orders` | Count of all active orders with `order_status = 'shipping'` currently in transit. |
| **Khách hàng mới** | `customers` | Count of customers registered today (`DATE(created_at) = CURDATE()`). |
| **Điểm 3F Club đã cộng** | `customer_point_transactions` | Sum of `points` credited today (`DATE(created_at) = CURDATE()` and `points > 0`). |

### Trend Calculations
For daily stats, trend comparison represents:
- **Revenue, Orders, New Customers, Points**: Today's value vs Yesterday's value (percentage change).
- **Pending, Shipping**: Total current backlog vs yesterday's backlog of orders created on that day.

---

## 2. API Endpoint Analysis

Backend controller `AdminDashboardController.php` exposes three endpoints:
1. `GET /api/admin/dashboard/stats`: Returns the 6 main KPI metrics and their comparison trend.
2. `GET /api/admin/dashboard/revenue-chart`: Returns daily revenue and order counts for the last `N` days (default 7).
3. `GET /api/admin/dashboard/task-queue`: Returns count of pending Shopee point requests, overdue requests (>48h), pending web orders, and low-stock products.

### Revenue Chart Refinements
Currently, `getRevenueChart` divides the daily revenue by `1,000,000` to return values in millions (M).
```php
$chartData[$dateStr]['Doanh thu'] = round((float)$row['daily_revenue'] / 1000000, 2);
```
*Recommendation*: Change backend to return raw VND amounts (`daily_revenue`) so the frontend can dynamically sum them, compute averages, and scale the SVG y-axis dynamically instead of hardcoding a 40M cap.

---

## 3. Frontend Integration Analysis

### admin-revenue-chart.tsx
- **Current State**: Uses a hardcoded SVG line chart with static 7-day data and summary boxes.
- **Planned Changes**:
  1. Call `adminDashboardApi.getRevenueChart(days)` with support for 7 days and 30 days via a dropdown trigger.
  2. Scale the SVG height dynamically: `const maxVal = Math.max(...data.map(d => d.revenue), 10000000)`.
  3. Update summary boxes:
     - Sum total revenue & orders for the period.
     - Compute average order value: `Total Revenue / Total Orders`.
     - Remove "Tỷ lệ chuyển đổi" (no backend tracking available) and display "Đơn hàng TB / ngày" (Total Orders / days) to keep it strictly based on real data.
