---
title: Fix Admin Dashboard Chart and Wishlist API
description: Align revenue and order count queries, adjust weekly/monthly average divisors, resolve month label overlap, and document the wishlist migration fix.
status: completed
priority: high
effort: low
branch: dev
tags: ['admin-dashboard', 'charts', 'wishlist-api', 'bug-fix']
created: 2026-06-19
---

# Plan: Fix Admin Dashboard Chart and Wishlist API

## Phases

- [x] **Phase 1: Wishlist API Fix**
  - Run database migration for `customer_wishlists` table on the live server.
  - Verify wishlist API with integration tests.
  - Link: [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260619-1730-fix-admin-dashboard-chart-and-wishlist/phase-01-wishlist-fix.md)

- [x] **Phase 2: Backend Dashboard Alignment**
  - Modify `AdminDashboardController.php` to align the chart's revenue and order calculations with the header KPI cards.
  - Link: [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260619-1730-fix-admin-dashboard-chart-and-wishlist/phase-02-backend-alignment.md)

- [x] **Phase 3: Frontend Chart Refinement**
  - Adjust average order divisor calculations in `admin-revenue-chart.tsx` (7 for week, days in month for month, 12 for year, 24 for today).
  - Fix X-axis labels overlap for the monthly view.
  - Correct zero-revenue rendering and SVG gradient issues with solid colors and order count fallback.
  - Link: [Phase 3 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260619-1730-fix-admin-dashboard-chart-and-wishlist/phase-03-frontend-refinement.md)

## Verification
- Run local integration test scripts.
- Deploy updated controller via FTP and verify on the live server.
