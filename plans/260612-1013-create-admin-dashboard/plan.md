---
title: Create Admin Dashboard for 3F Store
description: Implement a standalone frontend admin dashboard route at /admin featuring KPIs, charts, task queue, and analytics tables.
status: in-progress
priority: high
effort: medium
branch: feat/admin-dashboard
tags: admin, dashboard, ui, frontend
created: 2026-06-12
---

# Admin Dashboard Plan

Implement the 3F Store Admin Dashboard interface according to the design reference and requirements.

## Phases

1. **Phase 1: Setup & Routing**
   - Register `/admin` route in [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx).
   - Conditionally hide client header, footer, and advisor popup on `/admin`.
   - Link: [phase-01-setup.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/phase-01-setup.md)

2. **Phase 2: Core Components Implementation**
   - Create layout and sub-components in `components/admin/`.
   - Style with Tailwind CSS matching the Navy blue palette.
   - Implement custom SVGs for Revenue Line Chart and Source Donut Chart.
   - Link: [phase-02-components.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/phase-02-components.md)

3. **Phase 3: Integration & Interactive States**
   - Assemble components in `src/pages/admin/admin-dashboard.tsx`.
   - Add state interactions (search mock highlights, sidebar active menus, filters).
   - Verify layout responsiveness.
   - Link: [phase-03-integration.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1013-create-admin-dashboard/phase-03-integration.md)

## Success Criteria
- Standalone `/admin` dashboard renders successfully with no TypeScript errors.
- Visual style matches the reference image: Navy sidebar, white cards, soft borders.
- KPI cards, task queue, SVG charts, and tables display mock data cleanly.
