---
title: Fix Shopee Points Calculation and Display
description: Align Shopee point approval calculations and manual creation modal with the active rule rate of 200đ per point.
status: in_progress
priority: high
effort: low
branch: dev
tags: loyalty, shopee, admin, backend
created: 2026-06-22
---

# Overview Plan: Fix Shopee Points Divisor

Align all frontend and backend points calculation logic for Shopee orders to follow the dynamic rule rate (currently `200 VND = 1 point`) instead of the hardcoded `10000` rate.

## Phases

### [Phase 1: Backend Update & Database Alignment](phase-01-backend.md)
- Update `ShopeePointRequestController::approve()` to calculate points dynamically based on the active Shopee rule.
- Run a database migration/update script to recalculate and synchronize the points of existing approved Shopee requests/transactions.

### [Phase 2: Frontend Update](phase-02-frontend.md)
- Update `ShopeeManualRequestModal.tsx` to fetch the active Shopee rule rate dynamically.
- Update hardcoded calculations in `ShopeeManualRequestModal.tsx` and `lib/shopee-requests.ts`.
