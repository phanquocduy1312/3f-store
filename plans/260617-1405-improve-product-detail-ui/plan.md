---
title: Improve Product Detail UI & Real Data Integration
description: Refine product detail layout, fetch real specifications, clean custom mock templates, and fix text wrapping issues in related product cards.
status: completed
priority: high
effort: medium
branch: main
tags: frontend, ui, product-detail, real-data
created: 2026-06-17
---

# Plan: Improve Product Detail UI & Real Data

## Overview
Improve the product detail page aesthetic (layouts, typography, badges, spacing), transition tabs and technical specs to 100% real data fetched from the API (brand, category, petType, productType), and resolve text layout overflow in the related product grid.

## Phases
1. [Phase 1: Type Mapping](phase-01-type-mapping.md) - Update types and product mappers to include `productType` and `petType` fields.
2. [Phase 2: ProductDetail Clean & Beautify](phase-02-product-detail-clean.md) - Redesign product detail layout to render full description, display real technical specs, make ingredients/guide tabs conditional on category, dynamic reviews, and styling cleanup.
3. [Phase 3: Related Products Fix](phase-03-related-products-fix.md) - Clean up card layout inside related products to avoid text overlapping and fix HTML tag nesting.
4. [Phase 4: Verification](phase-04-verification.md) - Validate type checking and build.
