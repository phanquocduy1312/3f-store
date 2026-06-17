---
title: Production Checkout & Coupon System Refactoring
description: Implement robust administrative division validation via provinces.open-api.vn v2, dynamic backend-validated coupon logic, and layout reorganization on desktop/mobile.
status: planning
priority: high
effort: medium
branch: dev
tags: php, react, checkout, database, coupons
created: 2026-06-17
---

# Overview Plan: Production Checkout & Coupon System

This plan outlines the refactoring of the checkout and cart page to adhere to production requirements: removing shipping selection, implementing dynamic Vietnam provinces v2 API integration, transitioning payment methods to the right column, and adding backend-validated coupon codes (GIAM50K).

## Phases

### [Phase 1: Database Schema & Backend Models](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1620-production-checkout-and-coupon-refactoring/phase-01-database-and-backend.md)
* **Goal**: Update MySQL tables to include `coupons`, `coupon_usages`, and `orders.coupon_code`. Implement corresponding PHP models and validation APIs.
* **Status**: In Progress

### [Phase 2: Frontend Layout & Administrative Division API](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1620-production-checkout-and-coupon-refactoring/phase-02-frontend-and-api-client.md)
* **Goal**: Build a Vietnam administrative v2 client, redesign the checkout columns for desktop and mobile, and connect coupon code validation and removal flows.
* **Status**: Pending

### [Phase 3: Verification & Integration Tests](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1620-production-checkout-and-coupon-refactoring/phase-03-validation-and-testing.md)
* **Goal**: Validate correctness of coupon math, error messages, VietQR payments, and verify build passes locally and on production Vercel.
* **Status**: Pending

## Key Dependencies
* Provinces administrative divisions API (https://provinces.open-api.vn/api/v2/).
* PHP PDO connection on staging server.
