# Phase 3: Integration & Interactive States

## Context Links
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/plan.md)
- [phase-01-setup.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/phase-01-setup.md)
- [phase-02-components.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/phase-02-components.md)

## Overview
- **Priority:** Medium
- **Status:** Pending
- **Description:** Integrate all sub-components in the main `admin-dashboard.tsx` page, apply page grid lay-out, and add basic state interactions (filters, sidebar toggle, mock searches).

## Key Insights
- Layout must adjust dynamically on mobile/tablet. On mobile, the sidebar should collapse into a drawer or a slide-out overlay.
- Maintain simple state hooks (`searchTerm`, `dateRange`, `activeMenu`) to demonstrate mock frontend interactions.

## Requirements
- Full page layout matching the reference grid.
- Interactive date filters.
- Search filter highlighting or mock filtering of Shopee/AI lead rows.
- Sidebar menu item click changes the active menu state.

## Related Code Files
- [src/pages/admin/admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx) [MODIFY]
- [src/App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) [MODIFY]

## Implementation Steps
1. Place standard page shell with Sidebar and Header.
2. Build responsive grid layouts for KPIs (5 columns on desktop, 2 on tablet, 1 on mobile).
3. Assemble Middle grid: Task list (1/3 width) and Revenue Chart (2/3 width) and Donut Chart (1/3 width). Let's check the design:
   - Left card: Cần xử lý, hôm nay (1/3 width)
   - Center card: Doanh thu 7 ngày qua (2/3 width or 1/2 width)
   - Right card: Nguồn đơn hàng (1/3 width)
   - Actually, in the screenshot:
     - Left: Cần xử lý (wide enough, maybe 1/3)
     - Middle: Doanh thu 7 ngày (1/3 or 1/2)
     - Right: Nguồn đơn hàng (1/3)
     - They are next to each other, so it's a 3-column layout on desktop: `grid-cols-1 lg:grid-cols-3` or custom widths like `grid grid-cols-1 lg:grid-cols-12 gap-5` where Task list takes 3, Revenue Chart takes 5, Donut Chart takes 4. Let's look closely at the image:
       - Cần xử lý takes about 25% of the width.
       - Doanh thu 7 ngày takes about 45%.
       - Nguồn đơn hàng takes about 30%.
       - We can use Tailwind `lg:grid-cols-3` or a custom column grid. A simple `grid grid-cols-1 lg:grid-cols-3 gap-5` or `lg:grid-cols-12` where Task takes 3, Chart takes 5, Donut takes 4 is very accurate.
4. Assemble Bottom grid: Top Products, Top Needs, AI Leads, Shopee requests.
   - Top products and Top needs can take `1/4` each or they are in a grid:
     - In the image:
       - Left: Top sản phẩm bán chạy (1/4 width)
       - Middle-Left: Top nhu cầu thú cưng (1/4 width)
       - Middle-Right: Lead AI mới nhất (1/4 width)
       - Right: Yêu cầu Shopee mới nhất (1/4 width)
       - They are 4 cards next to each other on desktop! So a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5` is perfect!
5. Connect search state from Header to tables to filter mock data dynamically (e.g. searching "Mai" filters AI leads).
6. Connect date filter selection state.
7. Perform compile check and test responsiveness.

## Todo List
- [ ] Implement main layout in `admin-dashboard.tsx`
- [ ] Connect components and verify styles
- [ ] Add state interactions (search, filters, sidebar toggle)
- [ ] Verify responsive drawer/sidebar behavior on mobile
- [ ] Verify build compiles cleanly

## Success Criteria
- The dashboard page is fully responsive (works on 375px, 768px, 1440px widths).
- Typing in search filters rows in real time.
- Date filter updates charts and summaries (mock data updates).
- Sidebar collapse works on mobile.
