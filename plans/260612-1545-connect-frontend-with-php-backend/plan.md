---
title: Connect Frontend with PHP MVC Backend
description: Integrates React Shopee point requests features with the PHP MVC backend APIs for form submission, scan OCR, and admin approval/rejection.
status: in_progress
priority: high
effort: medium
branch: main
tags: frontend, integration, php, react
created: 2026-06-12
---

# Connect Frontend with PHP MVC Backend

Integrate customer and administrator panels to read and write directly to real PHP API endpoints instead of mocks or localStorage.

## Phase List

- **[Phase 1: Customer Form Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1545-connect-frontend-with-php-backend/phase-01-customer-form.md)** (In Progress)
  - Connect upload scan order image API `/api/shopee/order-scan`.
  - Connect submit point request API `/api/shopee/requests`.
  - Apply phone, amount normalization helpers, and highlight auto-filled fields.

- **[Phase 2: Admin Dashboard Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1545-connect-frontend-with-php-backend/phase-02-admin-dashboard.md)** (Pending)
  - Fetch list of Shopee Requests via GET `/api/admin/shopee/requests`.
  - Display detail modal via GET `/api/admin/shopee/requests/detail`.
  - Approve & Reject via `/api/admin/shopee/requests/approve` and `/api/admin/shopee/requests/reject`.
  - Remove mock localStorage behaviors entirely.

## Key Dependencies

- Requires backend API running on standard base path (local dev on localhost, production via VITE_API_BASE_URL).
