---
title: Fix Product Taxonomy and Filters
description: Implement classification service, reclassify products, expose metadata filters API, and update frontend sections/sidebar.
status: completed
priority: high
effort: medium
branch: main
tags: database, php, react, filtering
created: 2026-06-17
---

# Overview Plan: Fix Taxonomy and Filters

This plan details the implementation of a classification service for automatic categorization of products, and updating of the backend APIs and frontend pages to use the real database filters.

## Phases

### [Phase 1: Seed & Classification Service](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1252-fix-taxonomy-and-filters/phase-01-classification-service.md)
* **Goal**: Seed categories, write `ProductClassificationService.php`, and create CLI script to reclassify all existing products.
* **Status**: Complete

### [Phase 2: API & Frontend Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1252-fix-taxonomy-and-filters/phase-02-api-and-frontend.md)
* **Goal**: Implement filters API, update products listings list/detail logic, update homepage sections, and synchronize the product sidebar.
* **Status**: Complete

## Key Dependencies
* Product catalog tables populated (completed in previous task).
* Local MySQL running.
