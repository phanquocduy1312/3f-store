# Phase 2: Core Components Implementation

## Context Links
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/plan.md)

## Overview
- **Priority:** High
- **Status:** Pending
- **Description:** Implement all the sub-components for the Admin Dashboard under the `components/admin/` folder, using Lucide icons and pure CSS/SVG charts.

## Key Insights
- Recharts is not available, so we will use customized SVGs with coordinates computed from mock data to render the line chart (with dots, smooth lines, and grid) and donut chart (with hover highlights). This provides a fast-loading, beautiful design without dependency bloat.
- All files must be kept under 200 lines.

## Requirements
- Sidebar with dark navy gradient, menu active states, badges (Shopee pending order count: 12, AI badge).
- Header with search input, date filter, notification badge, and admin avatar.
- Grid layout with 10 KPI cards showing trend up/down values.
- Task Queue cards showing daily tasks with "Xử lý ngay" buttons.
- SVG Line Chart (Doanh thu 7 ngày) with Summary Cards.
- SVG Donut Chart (Nguồn đơn hàng) with central text & legend.
- Data tables for Top Products, Pet Needs, AI Leads, and Shopee Requests.

## Architecture
- Modular components written in TypeScript (`.tsx`) under `components/admin/`.
- Use tailwind styling variables mirroring the Navy theme.

## Related Code Files
- [components/admin/admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) [NEW]
- [components/admin/admin-header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-header.tsx) [NEW]
- [components/admin/admin-kpi-card.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-kpi-card.tsx) [NEW]
- [components/admin/admin-task-queue.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-task-queue.tsx) [NEW]
- [components/admin/admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx) [NEW]
- [components/admin/admin-source-donut-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-source-donut-chart.tsx) [NEW]
- [components/admin/admin-top-products.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-top-products.tsx) [NEW]
- [components/admin/admin-pet-needs-stats.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-pet-needs-stats.tsx) [NEW]
- [components/admin/admin-ai-lead-list.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-ai-lead-list.tsx) [NEW]
- [components/admin/admin-shopee-request-list.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-shopee-request-list.tsx) [NEW]

## Implementation Steps
1. Create `admin-sidebar.tsx` with full list of items, badges, subscription card, and support contacts.
2. Create `admin-header.tsx` with search input, notifications, and profile.
3. Create `admin-kpi-card.tsx` with icons, values, trends.
4. Create `admin-task-queue.tsx` listing the 7 items with "Xử lý ngay".
5. Create `admin-revenue-chart.tsx` with custom SVG line drawing and summaries.
6. Create `admin-source-donut-chart.tsx` with custom SVG donut slices and labels.
7. Create table/list components for Top Products, Pet Needs, AI Leads, and Shopee Requests.

## Todo List
- [ ] Implement `admin-sidebar.tsx`
- [ ] Implement `admin-header.tsx`
- [ ] Implement `admin-kpi-card.tsx`
- [ ] Implement `admin-task-queue.tsx`
- [ ] Implement `admin-revenue-chart.tsx` (SVG)
- [ ] Implement `admin-source-donut-chart.tsx` (SVG)
- [ ] Implement list/table components for leads and requests

## Success Criteria
- Each file compiled without errors and is under 200 lines.
- All layout elements are responsive.
