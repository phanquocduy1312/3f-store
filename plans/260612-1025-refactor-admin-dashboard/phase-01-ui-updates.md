# Phase 1: UI Updates & Component Refactoring

## Context Links
- Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1025-refactor-admin-dashboard/plan.md)
- Dashboard: [admin-dashboard.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/admin-dashboard.tsx)

## Overview
- Priority: High
- Current Status: In Progress
- Description: Refactor the stylesheet, global tokens, sidebar, header, charts, and lists to match the premium design reference.

## Key Insights
- Clean, premium visual style requires strict adherence to color tokens and proper padding/gap spacing.
- Scrollbars inside the dashboard must be hidden or customized using `.admin-scrollbar` to avoid browser default layouts.
- We must use the `AdminCard` component across all sub-components.

## Requirements
- Support responsive layout (1 column on mobile, 5 columns on XL screen for KPI).
- Match reference colors (navy/dark navy, blue, red points, soft border/shadow).

## Related Code Files
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)
- [admin-card.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-card.tsx)
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
1. Add `.admin-scrollbar` to `src/globals.css`.
2. Refactor all 10 component files in `components/admin/` to use `AdminCard` and apply the design tokens and layout structure.
3. Update `src/pages/admin/admin-dashboard.tsx` layout structure.
4. Run `npx tsc --noEmit` to check for TypeScript issues.

## Todo List
- [x] Add `.admin-scrollbar` in `globals.css`
- [x] Refactor `admin-sidebar.tsx`
- [x] Refactor `admin-header.tsx`
- [x] Refactor `admin-kpi-card.tsx`
- [x] Refactor `admin-task-queue.tsx`
- [x] Refactor `admin-revenue-chart.tsx`
- [x] Refactor `admin-source-donut-chart.tsx`
- [x] Refactor `admin-top-products.tsx`
- [x] Refactor `admin-pet-needs-stats.tsx`
- [x] Refactor `admin-ai-lead-list.tsx`
- [x] Refactor `admin-shopee-request-list.tsx`
- [x] Refactor `admin-dashboard.tsx`
- [x] Compile and verify

## Success Criteria
- Fully matches visual requirements.
- Responsive layout works on all screen sizes.
- No compilation/type errors.

## Risk Assessment
- Recharts or complex graph library missing -> mitigated by using SVG paths.

## Security Considerations
- Client-only mock dashboard, no authorization logic needed yet.

## Next Steps
- Implement code changes.
