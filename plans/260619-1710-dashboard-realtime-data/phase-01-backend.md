# Phase 1: Backend API Development

## Context Links
- [Researcher Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260619-1710-dashboard-realtime-data.md)
- [AdminDashboardController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminDashboardController.php)
- [index.php Entry Point](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

---

## Overview
- **Priority**: High
- **Current Status**: Completed
- **Description**: Refine the database queries in `AdminDashboardController.php` to calculate accurate business stats, return raw VND values for chart rendering, and expose endpoints for stats, revenue timeline, and task queues.

---

## Key Insights
- **Money formatting**: The backend should return raw integers/floats for financial calculations (e.g. `total`) instead of pre-formatting or pre-dividing by 1M, letting the frontend perform scaling and formatting.
- **Backlog Trends**: Current totals of `pending` and `shipping` orders don't map cleanly to daily percentage trends. Comparison badges for these will show the difference in count of orders created today vs yesterday.

---

## Requirements
### Functional
- Fetch 6 dashboard KPI metrics comparing today vs yesterday.
- Fetch daily revenue and order count for the last 7 or 30 days.
- Fetch counts of pending tasks: Shopee requests, overdue Shopee requests (>48h), pending orders, and low-stock items.

### Non-functional
- DB queries must use proper indexes to execute in <100ms.
- Enforce admin authentication on all endpoints.

---

## Architecture
```
Admin Client  -->  Router  -->  AuthMiddleware  -->  AdminDashboardController  -->  Database (MySQL)
```

---

## Related Code Files
- **[MODIFY]** [AdminDashboardController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminDashboardController.php): Refine queries and remove division by 1,000,000 in `getRevenueChart`.
- **[MODIFY]** [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php): Ensure API routes are properly registered.

---

## Implementation Steps
1. **Refine Stats Queries**: Update SQL in `getStats()` to correctly compare today's and yesterday's metrics.
2. **Refine Chart Query**: In `getRevenueChart()`, fetch raw `SUM(total)` (VND) instead of dividing it by 1,000,000.
3. **Verify Auth**: Ensure all dashboard controller methods call `AuthMiddleware::requireAdmin()`.
4. **Confirm Routes**: Check if the routing entries in `public/index.php` match the endpoints called by the API service.

---

## Todo List
- [ ] Refine queries in `AdminDashboardController.php` for `getStats`
- [ ] Change `getRevenueChart` to return raw VND amounts
- [ ] Ensure `AuthMiddleware::requireAdmin()` is enforced on all controller methods
- [ ] Confirm route registration in `public/index.php`
- [ ] Verify endpoints using mock request or curl command

---

## Success Criteria
- HTTP 200 responses for all endpoints.
- Response payloads match TypeScript interface specifications.
- Chart API returns raw VND numbers.

---

## Risk Assessment
- *Issue*: High number of database records slowing down grouping.
- *Mitigation*: Ensure there are composite indexes on `orders(order_status, created_at)` and `shopee_point_requests(processing_status, created_at)`.

---

## Security Considerations
- Require valid JWT admin token in request headers (`Authorization: Bearer <token>`).
- Escape parameters for queries where filter duration (`days`) is passed.

---

## Next Steps
- Implement Frontend Integration (Phase 2).
