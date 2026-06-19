---
title: Connect Admin Dashboard to Real MySQL Backend & Implement Business Logic
description: Implement backend controllers and frontend integration to populate KPI cards, task queues, and charts with live data.
status: completed
priority: high
effort: medium
branch: dev
tags: admin, dashboard, statistics, database
created: 2026-06-19
---

# Plan: Realtime Admin Dashboard & Business Logic

This plan details connecting the Admin Dashboard to real operation data from the MySQL database using correct business logic for metrics, tasks, and historical revenue chart.

## Phases

1. **[Phase 1: Backend API Development](phase-01-backend.md)**:
   - Refine `AdminDashboardController.php` stats, chart, and task queries.
   - Return raw VND values for revenue to allow frontend formatting.
   - Confirm routing is registered in `public/index.php`.

2. **[Phase 2: Frontend Integration](phase-02-frontend.md)**:
   - Call API to render 6 main KPI metrics and their trends.
   - Connect the Task Queue to active queues with direct links to management pages.
   - Re-engineer the custom SVG line chart to render real 7/30 days data.
   - Compute period summary metrics (total revenue, total orders, average order value, average orders/day) dynamically.

## Key Dependencies
- Database tables: `orders`, `products`, `customers`, `shopee_point_requests`, `customer_point_transactions`.
- Admin JWT Authentication.

## Success Criteria
- KPI cards, task list, and revenue chart load successfully from backend APIs.
- SVG line chart dynamically scales based on actual maximum revenue in the range.
- Period summary boxes at the bottom of the chart calculate correct values dynamically.
- System builds successfully and passes manual/automated validation.
