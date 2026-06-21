---
title: Simplify Admin Orders UX
description: Streamline order operations by hiding advanced configuration page, adding frontend fallback transitions, and replacing technical controls with clear Vietnamese buttons.
status: in-progress
priority: high
effort: 1-2 hours
branch: dev
tags: [admin, ux, simplification, orders]
created: 2026-06-21
---

# Implementation Plan: Simplify Admin Orders UX

Simplify the order processing flow for normal store admin users by removing technical workflow setup screens, adding fallback transition mappings, and refactoring Slide-over controls.

## Phase List

1. [Phase 01: Sidebar Navigation Restrictions](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2205-simplify-admin-orders-ux/phase-01-sidebar-navigation-restrictions.md)
   - Status: pending
   - Hide the "Cấu hình Workflow" item for normal admin roles.

2. [Phase 02: Advanced Configurations Route Warning](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2205-simplify-admin-orders-ux/phase-02-advanced-configurations-route-warning.md)
   - Status: pending
   - Restrict the Workflow settings page to super_admin/dev only, showing a warning otherwise.

3. [Phase 03: Frontend Fallback Transition Mapping](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2205-simplify-admin-orders-ux/phase-03-frontend-fallback-transition-mapping.md)
   - Status: pending
   - Define fallback map states in the orders page to ensure operations are always active.

4. [Phase 04: Drawer Body and Footer Simplification](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2205-simplify-admin-orders-ux/phase-04-drawer-body-and-footer-simplification.md)
   - Status: pending
   - Replace body dropdown select elements and technical logs with inline actions and clean up confirm modal labels.

## Key Dependencies
- The fallback maps must cover all status codes currently seeded in the database.
