---
title: Refactor Admin Dashboard UI for 3F Store
description: Refactor the UI/UX, spacing, colors, typography, card design, and responsive behaviors of the /admin dashboard.
status: completed
priority: high
effort: low
branch: feat/admin-dashboard-ui-refactor
tags: admin, dashboard, ui, refactor, tailwind
created: 2026-06-12
---

# Admin Dashboard UI Refactor Plan

Refactor the existing /admin dashboard layout and components to match the premium, professional SaaS design reference.

## Phases

1. **Phase 1: Styles & Shared Components**
   - Add `.admin-scrollbar` and variable tokens to `src/globals.css`.
   - Update `components/admin/admin-card.tsx` to handle unified card wrapping.
   - Link: [phase-01-ui-updates.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1025-refactor-admin-dashboard/phase-01-ui-updates.md)

2. **Phase 2: Component Layout & Visual Updates**
   - Refactor `admin-sidebar.tsx`, `admin-header.tsx`, and `admin-kpi-card.tsx`.
   - Refactor middle section: `admin-task-queue.tsx`, `admin-revenue-chart.tsx`, `admin-source-donut-chart.tsx`.
   - Refactor bottom section: `admin-top-products.tsx`, `admin-pet-needs-stats.tsx`, `admin-ai-lead-list.tsx`, `admin-shopee-request-list.tsx`.
   - Integrate updates in `src/pages/admin/admin-dashboard.tsx`.

## Success Criteria
- Standalone /admin dashboard visual style is premium and aligned with the navy blue reference.
- Responsive grid supports desktop (sidebar fixed, clean cards) and mobile (collapsed sidebar, scroll tables).
- No TypeScript or build errors.
