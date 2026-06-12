---
title: Polish Admin Dashboard for Business E-commerce
description: Refactor the /admin interface to look like a real, professional e-commerce/CRM admin with a fixed sidebar, reduced AI neon accent, and higher readability.
status: completed
priority: high
effort: low
branch: feat/admin-dashboard-polish
tags: admin, dashboard, visual, clean
created: 2026-06-12
---

# Polish Admin Dashboard Plan

Polish the dashboard design to make it highly professional, clean, and e-commerce/CRM-oriented, with a fixed sidebar and reduced AI styling vibes.

## Phases

1. **Phase 1: Styles & Sidebar Fixed Layout**
   - Update `globals.css` with cleaner, thinner scrollbar styles.
   - Refactor `admin-sidebar.tsx` to handle fixed full-height layout and custom colors.
   - Refactor `admin-dashboard.tsx` structure to support fixed sidebar (`ml-[280px]`) and layout spacing.
   - Link: [phase-01-polish-layout.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1031-polish-admin-dashboard/phase-01-polish-layout.md)

2. **Phase 2: Card Refactoring & Business Tone**
   - Refactor header, KPI cards (to support larger value sizes and 4/5 column configurations), task list, charts, and tables.
   - Verify layout responsiveness.
