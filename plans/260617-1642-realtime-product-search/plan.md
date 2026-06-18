---
title: Real-time Product Search Implementation
description: Implement real-time product search suggestions dropdown in Header, and query parameter search mapping on the Products catalog page.
status: completed
priority: high
effort: medium
branch: dev
tags: php, react, search, dropdown
created: 2026-06-17
---

# Overview Plan: Real-time Product Search

This plan outlines the integration of real-time search functionality into the 3F Store, connecting a debounced suggestion dropdown to a refined PHP search API.

## Phases

### [Phase 1: Backend Search API Refactoring](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1642-realtime-product-search/phase-01-backend-search-api.md)
* **Goal**: Update `Product::listProducts` to filter by keyword `q` across product name, brand, description, slug, and variant sku/name with relevance sorting.
* **Status**: Pending

### [Phase 2: Frontend API Client & ProductSearchBox Component](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1642-realtime-product-search/phase-02-frontend-api-client-and-search-box.md)
* **Goal**: Implement `searchProducts` client in `productsApi.ts` and create `ProductSearchBox` component with debounce, keyboard navigation, and dropdown.
* **Status**: Pending

### [Phase 3: Header Integration, Catalog Integration & Testing](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1642-realtime-product-search/phase-03-products-page-integration-and-testing.md)
* **Goal**: Integrate `ProductSearchBox` into desktop/mobile headers, connect the `q` search parameter to `ProductListing.tsx` query state, and execute tests.
* **Status**: Pending

## Key Dependencies
* Dynamic backend product retrieval (`GET /api/products`).
* React Router navigation hook (`useNavigate` and `useSearchParams`).
