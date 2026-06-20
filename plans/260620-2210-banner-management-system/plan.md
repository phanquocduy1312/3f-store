---
title: Banner Management System
description: Build a professional, dynamic banner management system with MySQL schema, schedule planning, click analytics, and admin dashboard controls.
status: completed
priority: high
effort: medium
branch: dev-banner-management
tags: ['banners', 'admin-panel', 'dashboard', 'campaigns']
created: 2026-06-20T22:10:00Z
---

# Plan: Banner Management System

Implement a professional banner management system with customizable placements, campaign schedules, analytics tracking (views and clicks), and a fully functional management GUI in the admin panel.

## Phases

- [x] **Phase 1: Database and Backend Services**
  - Create the MySQL migration for the `banners` table.
  - Implement the `Banner.php` model, upload service support, and controllers.
  - Add API endpoints for public display, admin operations, and click tracking.
  - Link: [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2210-banner-management-system/phase-01-database-and-backend.md)

- [x] **Phase 2: Admin Panel Management UI**
  - Add "Quản lý Banner" to the admin sidebar.
  - Build the banner listing grid with statistics (clicks, CTR).
  - Implement form controls for creating/editing banners, scheduling campaign dates, and image uploads.
  - Link: [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2210-banner-management-system/phase-02-admin-banner-ui.md)

- [x] **Phase 3: Frontend Client Integration**
  - Dynamically fetch banners in the homepage `HeroSection` (swiper slider, side promo banners).
  - Integrate analytics event dispatching to count impressions (views) and click actions automatically.
  - Link: [Phase 3 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2210-banner-management-system/phase-03-client-banner-integration.md)

## Key Dependencies
- Database: MySQL `banners` table.
- Frontend: `src/App.tsx`, `components/admin/admin-sidebar.tsx`, `components/HeroSection.tsx`.
- Backend: PHP routes inside `public/index.php`.
