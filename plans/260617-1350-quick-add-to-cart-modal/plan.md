---
title: Quick Add To Cart Modal
description: Implement a professional, responsive quick-purchase modal for product catalog grids.
status: in_progress
priority: high
effort: medium
branch: main
tags: frontend, ui, cart, modal
created: 2026-06-17
---

# Plan: Quick Add To Cart Modal

## Overview
Implement a dynamic quick add-to-cart variant selector modal. Allow customers to customize and buy products directly from the home or category listing page.

## Phases
1. [Phase 1: Types & API Mappings](phase-01-types-and-api.md) - Update types and productsApi mapper to preserve variant option metadata.
2. [Phase 2: Component QuickAddToCartModal](phase-02-modal-component.md) - Build the QuickAddToCartModal component with layout, selections, quantity, and checkout intent logic.
3. [Phase 3: Card Integration](phase-03-card-integration.md) - Update ProductCard, ProductListing, PetFoodSection, and SaleSection to trigger the modal.
4. [Phase 4: Validation](phase-04-validation.md) - Build, type check, and manually test the flow.
