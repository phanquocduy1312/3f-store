---
title: Unify Product Card Component
description: Refactor ProductCard.tsx to match the premium theme styling of ProductListing.tsx and replace inline card code.
status: planning
priority: high
effort: low
branch: dev
tags: ['product-card', 'refactoring', 'ui-polish']
created: 2026-06-20T21:36:00Z
---

# Plan: Unify Product Card Component

Refactor `ProductCard.tsx` to match the premium theme styling of `ProductListing.tsx`, support flexible button layouts, and use it across the wishlist page, catalog, and slider to ensure design consistency.

## Phases

- [ ] **Phase 1: Refactor ProductCard Component**
  - Update `components/ProductCard.tsx` to implement the new premium card layout, hover animations, theme variables, brand name, and optional "Mua ngay" button.
  - Link: [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2136-unify-product-card/phase-01-refactor-product-card.md)

- [ ] **Phase 2: Integrate and Verify**
  - Replace the inline card markup in `components/ProductListing.tsx` with `<ProductCard>`.
  - Update `/wishlist` to render the unified component.
  - Run build checks and verify visual rendering.
  - Link: [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2136-unify-product-card/phase-02-integrate-and-verify.md)

## Key Dependencies
- `components/ProductCard.tsx`
- `components/ProductListing.tsx`
- `src/pages/client/WishlistPage.tsx`
