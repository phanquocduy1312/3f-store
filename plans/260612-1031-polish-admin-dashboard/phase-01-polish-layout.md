# Phase 1: Layout Polishing & Component Styling

## Context Links
- Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1031-polish-admin-dashboard/plan.md)
- Dashboard: [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)

## Overview
- Priority: High
- Current Status: In Progress
- Description: Fix sidebar position, reduce AI neon branding, adjust chart grid sizes, and improve readability.

## Related Code Files
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [admin-header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-header.tsx)
- [admin-kpi-card.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-kpi-card.tsx)
- [admin-task-queue.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-task-queue.tsx)
- [admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx)
- [admin-source-donut-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-source-donut-chart.tsx)
- [admin-top-products.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-top-products.tsx)
- [admin-pet-needs-stats.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-pet-needs-stats.tsx)
- [admin-ai-lead-list.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-ai-lead-list.tsx)
- [admin-shopee-request-list.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-shopee-request-list.tsx)
- [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)

## Implementation Steps
1. Add updated scrollbar classes in `globals.css`.
2. Refactor sidebar component to support fixed desktop behavior and drawer-friendly classes.
3. Refactor main wrapper layout and header inside `admin-dashboard.tsx` and `admin-header.tsx`.
4. Standardize cards, KPIs, lists, tables, and charts to match the new business e-commerce theme.
5. Run tsc check to verify type safety.

## Todo List
- [x] Add `.admin-scrollbar` updates in `globals.css`
- [x] Refactor `admin-sidebar.tsx` with fixed positioning
- [x] Refactor `admin-header.tsx` with unified sizing
- [x] Refactor `admin-kpi-card.tsx` with larger values
- [x] Refactor `admin-task-queue.tsx` with simplified button and items
- [x] Refactor `admin-revenue-chart.tsx` with cleaner summary box
- [x] Refactor `admin-source-donut-chart.tsx` legend item sizes
- [x] Refactor `admin-top-products.tsx` list row height
- [x] Refactor `admin-pet-needs-stats.tsx` bars
- [x] Refactor `admin-ai-lead-list.tsx` colors and structure
- [x] Refactor `admin-shopee-request-list.tsx` table spacing
- [x] Update grid layout in `admin-dashboard.tsx`
- [x] Compile and verify
