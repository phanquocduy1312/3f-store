---
title: Increase Quantity for Duplicate Cart Items & Admin UI Tweaks & Hide Stock & Coerce Options
description: Prevent duplicate cart entries when adding the same product variant, optimize the voucher label layout in the admin order list, hide/optimize stock/option groups on the frontend, and coerce options to string to fix disabled state.
status: in-progress
priority: high
effort: low
branch: main
tags: [cart, bug-fix, ui]
created: 2026-06-23
---

# Increase Quantity for Duplicate Cart Items & Admin UI Tweaks & Hide Stock & Coerce Options

This plan outlines the design and implementation steps to ensure that adding the same product variant to the cart increments its quantity instead of adding a duplicate row, prevents the admin orders table voucher label from wrapping, hides stock info while filtering out empty option groups on the frontend, and coerces option values to strings to fix the selection disable bug.

## Phases

### Phase 1: Robust Cart Helper Logic and Admin Orders Tweak
- **Status**: Completed
- **File**: [phase-01-cart-helper-robust-matching.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1350-increase-quantity-for-duplicate-cart-items/phase-01-cart-helper-robust-matching.md)
- **Description**: Add type-safe and format-safe matching in `lib/cartHelper.ts`, update `AiResult.tsx` to pass the product ID, and fix the voucher wrapping in `AdminOrdersPage.tsx`.

### Phase 2: Hide Stock and Filter Empty Specification Groups & Coerce Options
- **Status**: Planning
- **File**: [phase-02-hide-stock-and-filter-specifications.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1350-increase-quantity-for-duplicate-cart-items/phase-02-hide-stock-and-filter-specifications.md)
- **Description**: Filter empty option groups, disable frontend stock checks, remove stock quantity text displays, and coerce variant option values to strings to fix disabled states.

## Key Dependencies
- None
