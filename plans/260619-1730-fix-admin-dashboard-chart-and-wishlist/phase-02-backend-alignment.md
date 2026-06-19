# Phase 2: Backend Dashboard Alignment

## Overview
- Priority: High
- Status: Completed
- Description: Align chart revenue and order count queries with the statistics KPI cards.

## Proposed Changes
- In `3f-api/app/Controllers/AdminDashboardController.php`, update SQL queries inside `getRevenueChart` to select:
  - `SUM(CASE WHEN order_status IN ('confirmed', 'packing', 'shipping', 'completed') THEN total ELSE 0 END) as rev`
  - `SUM(CASE WHEN order_status != 'cancelled' THEN 1 ELSE 0 END) as ord`
- This ensures that total revenue only counts confirmed/completed orders, while total orders counts all orders except cancelled (including pending ones).

## Related Code Files
- [AdminDashboardController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminDashboardController.php)

## Verification
- Deployed updated controller via `python scripts/deploy_ftp.py` to production and verified.
