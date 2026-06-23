# Phase 2: Frontend Integration

## Context Links
- [Researcher Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260619-1710-dashboard-realtime-data.md)
- [adminDashboardApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/adminDashboardApi.ts)
- [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)
- [admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx)
- [admin-task-queue.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-task-queue.tsx)

---

## Overview
- **Priority**: High
- **Current Status**: Completed
- **Description**: Connect the React dashboard components to the live backend statistics. Convert the SVG revenue line chart to render real data dynamically with support for 7/30 days filters and auto-calculated metrics.

---

## Key Insights
- **SVG Line Chart Calculations**: Since the backend will return raw values, we must calculate the maximum value `maxVal` dynamically based on the highest daily revenue in the dataset (with a default floor of 10,000,000đ).
- **Summary Period Boxes**: The bottom boxes in `admin-revenue-chart.tsx` will sum up the total revenue and orders in the selected period (7 or 30 days) and compute the average order value. The "Tỷ lệ chuyển đổi" box will be replaced with "Đơn hàng TB / ngày" (Total Orders / N days) to avoid mock conversion rates.

---

## Requirements
### Functional
- Fetch and display 6 real metrics in KPI Cards.
- Display task queue count badges linking to relevant pages (`/admin/orders`, `/admin/products`, `/admin/3f-club`).
- Draw a continuous line chart for the last 7 or 30 days.
- Update chart data and summaries when the date range selection changes.

### Non-functional
- Ensure smooth CSS transitions during loading states.
- Ensure the layout remains responsive and compact without truncation.

---

## Architecture
```
AdminDashboard Page
  ├── KPI Cards Row (loads stats)
  ├── Task Queue Card (loads task queue)
  └── Revenue Chart Card (loads chart data, filters, updates local SVG coords)
```

---

## Related Code Files
- **[MODIFY]** [admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx): Call API, calculate paths, scale SVG dynamically, compute summary metrics.
- **[MODIFY]** [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx): Confirm stats call is fully integrated and handled.
- **[MODIFY]** [admin-task-queue.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-task-queue.tsx): Confirm task stats call is fully integrated and handled.

---

## Implementation Steps
1. **Connect Revenue Chart Component**: Add a `useEffect` inside `admin-revenue-chart.tsx` to fetch stats based on the active `days` filter (default 7).
2. **Calculate SVG Paths & Axes**:
   - Compute `maxVal` as `Math.max(...chartData.map(d => d.revenue), 10000000)`.
   - Calculate chart coordinates dynamically.
   - Adjust line/area drawing commands.
3. **Compute Summary Boxes**:
   - Aggregate period metrics (Total Revenue, Total Orders, Average Order Value, Average Orders/Day).
   - Update values in the summary grid at the bottom.
4. **Implement Time Range Filter**: Update the dropdown UI to handle click events, switching the active period between 7 and 30 days and refetching.
5. **Verify Design Layout**: Ensure there are no overlapping labels or UI bugs.

---

## Todo List
- [ ] Connect `admin-revenue-chart.tsx` to call API
- [ ] Implement dynamic max value scaling for SVG line chart
- [ ] Add state for selected range (7 days vs 30 days) and trigger refetching
- [ ] Calculate dynamic summaries for the period (Revenue, Orders, AOV, Orders/Day)
- [ ] Remove "Tỷ lệ chuyển đổi" and use "Đơn hàng TB / ngày"
- [ ] Verify UI layout alignment and rendering states in browser

---

## Success Criteria
- The custom SVG chart draws a perfect line reflecting actual daily sales.
- Clicking the range selector refetches data and shifts range from 7 to 30 days smoothly.
- Summary values dynamically sum up the fetched dataset.
- Clean typescript builds.

---

## Risk Assessment
- *Issue*: A large spike in revenue on one day makes the rest of the chart look completely flat.
- *Mitigation*: Ensure grid lines are dynamically calculated at interval divisions (`maxVal / 4`).

---

## Security Considerations
- JWT Auth token is stored securely in `localStorage` and attached via `Authorization` header.

---

## Next Steps
- Verify compilation and request approval from user.
