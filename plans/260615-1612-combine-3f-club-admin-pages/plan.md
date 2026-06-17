---
title: Combine 3F Club Admin Pages
description: Combine Shopee requests and Loyalty settings into a single tabbed page at /admin/3f-club
status: in-progress
priority: high
effort: medium
branch: main
tags: frontend, refactor, admin
created: 2026-06-15T16:12:00
---

# Overview Plan - Combine 3F Club Admin Pages

This plan covers consolidating the 3F Club admin pages into a unified tabbed dashboard at `/admin/3f-club`.

## Phases

1. **Phase 1: Refactor Page Sections**
   - Extract `ShopeeRequestsSection.tsx` from `ShopeeRequestsPage.tsx`
   - Extract `LoyaltySettingsSection.tsx` from `LoyaltySettingsPage.tsx`
   - Link: [phase-01-refactor-sections.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1612-combine-3f-club-admin-pages/phase-01-refactor-sections.md)

2. **Phase 2: Create Combined Page**
   - Create `ThreeFClubPage.tsx` at `/admin/3f-club`
   - Add summary cards: Total Requests, Pending, Valid API, Approved, Active Rule rate
   - Implement tabbed layout: Yêu cầu Shopee, Cấu hình điểm, Quà đổi điểm, Yêu cầu đổi quà, Lịch sử điểm
   - Link: [phase-02-create-combined-page.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1612-combine-3f-club-admin-pages/phase-02-create-combined-page.md)

3. **Phase 3: Update Routes & Sidebar**
   - Update `App.tsx` routes
   - Update `admin-sidebar.tsx` to group into "3F Club" and remove separated menus
   - Link: [phase-03-update-routes-and-sidebar.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1612-combine-3f-club-admin-pages/phase-03-update-routes-and-sidebar.md)

## Key Dependencies
- `react-router-dom` navigation and parameters
- Fetch requests to existing APIs for Shopee and Loyalty Point Rules
