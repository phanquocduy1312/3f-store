---
title: Fix Admin Dashboard Sidebar & Task Queue Scroll
description: Fix sidebar navy colors, fixed position and upgrade card visibility. Fix Task Queue scroll behavior using flex layout and custom scrollbar classes.
status: completed
priority: high
effort: low
branch: feat/admin-dashboard-fix
tags: admin, dashboard, ui, bugfix
created: 2026-06-12
---

# Fix Admin Dashboard Plan

Fix three key visual issues: sidebar colors and positioning, upgrade plan card visibility, and scroll container overflow for Task Queue.

## Phases

1. **Phase 1: Fix Sidebar & App Layout**
   - Update `globals.css` with Firefox scrollbar rules.
   - Refactor `admin-sidebar.tsx` layout and color values.
   - Update `admin-dashboard.tsx` to handle correct offset margins.
   - Link: [phase-01-fix-sidebar-and-tasks.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1037-fix-admin-dashboard/phase-01-fix-sidebar-and-tasks.md)

2. **Phase 2: Fix Task Queue & Other Cards**
   - Refactor `admin-task-queue.tsx` to support scrollable area using flex properties.
   - Adjust pet need stat bars to blue gradients.
