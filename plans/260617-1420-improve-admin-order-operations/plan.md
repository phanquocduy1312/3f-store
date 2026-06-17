---
title: "Improve Admin Order Operations"
description: "Align the admin order management system with 3F Store production requirements, including proper status transitions, loyalty display rules, detailed items rendering, timeline logging, and custom confirmation dialogs."
status: "planning"
priority: "high"
effort: "medium"
branch: "main"
tags: ["admin", "orders", "backend", "frontend"]
created: "2026-06-17"
---

# Overview Plan: Improve Admin Order Operations

This plan outlines the design and implementation steps for aligning `/admin/orders` operations with production standards. It ensures correct order status transitions, points calculation, items list rendering, status logs timeline, custom confirmation dialogs, and proper customer/shipping info representation.

## Phases

1. **Phase 1: Database and Backend Optimization**
   - File: [phase-01-database-and-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1420-improve-admin-order-operations/phase-01-database-and-backend.md)
   - Status: Pending
   - Scope: Update `Order.php` queries (LEFT JOIN `customers` to fetch customer names, phones, emails), enforce state transition guards, handle early return to prevent double inventory adjustments/loyalty increments, ensure 400 Bad Request is returned on business validation exceptions, and fix initial status logging note.

2. **Phase 2: Frontend UI & UX Enhancements**
   - File: [phase-02-frontend-updates.md](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1420-improve-admin-order-operations/phase-02-frontend-updates.md)
   - Status: Pending
   - Scope: Enhance `AdminOrdersPage.tsx` with proper 3F Club loyalty point display logic, items sub-total and total rendering, timeline log list with Fallback support, quick action buttons on table rows with custom confirm modal, and corrected customer/shipping layout grid.

## Key Dependencies
- Backend database `orders` and `customers` schema tables.
- Vite and React runtime environment for Tailwind classes and TS compilation.
