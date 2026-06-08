---
title: Combined Cart and Checkout Page Integration
description: Build a unified cart and checkout experience at /cart with localStorage sync and dynamic VietQR payment modal.
status: in-progress
priority: high
effort: medium
branch: main
tags: [cart, checkout, payment, ui, vite]
created: 2026-06-08
---

# Combined Cart & Checkout Plan

This plan details the implementation of a single-page shopping cart and checkout flow for the 3F Store web application.

## Phases

- **Phase 1: Foundation & Helper** [In Progress]
  - Create cart helper (`src/lib/cart-helper.ts`) for `localStorage` sync.
  - Link: [phase-01-cart-checkout.md](file:///C:/Users/Admin/Downloads/ccc/plans/260608-1021-cart-checkout-page/phase-01-cart-checkout.md)

- **Phase 2: Cart & Checkout UI** [Not Started]
  - Create page component `src/pages/CartCheckout.tsx` with responsive layout.
  - Add route in `src/App.tsx` and links in `components/Header.tsx` and `src/pages/ProductDetail.tsx`.

- **Phase 3: Validation & Polish** [Not Started]
  - Build check, visual check, and VietQR generation verification.
