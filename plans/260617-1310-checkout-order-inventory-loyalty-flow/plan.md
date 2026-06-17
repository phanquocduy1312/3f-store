---
title: Complete E-commerce Flow - Cart, Checkout, Order, Inventory, and Loyalty Integration
description: Implement end-to-end purchasing, dynamic stock reservation, order status transition, and membership point earning.
status: planning
priority: high
effort: high
branch: dev-order-flow
tags: database, php, react, e-commerce, loyalty
created: 2026-06-17
---

# Overview Plan: Complete E-commerce Flow

This plan establishes a real e-commerce ordering system for the 3F Store, connecting the frontend catalog to backend MySQL transactions, stock reservation, and the 3F Club loyalty point program.

## Phases

### [Phase 1: Database Schema & Backend Models](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-01-database-schema-and-backend-models.md)
* **Goal**: Define table structures for customers, orders, order items, and logs. Create corresponding PHP models and setup schema migration.
* **Status**: Pending

### [Phase 2: Checkout and Order APIs](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-02-checkout-and-order-apis.md)
* **Goal**: Implement `POST /api/orders/create` with customer upserting, stock check, exact price computation from DB, and transaction-safe stock reservation. Expose tracking endpoints.
* **Status**: Pending

### [Phase 3: Inventory Reservation and Fulfillment Rules](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-03-inventory-reservation-and-fulfillment-rules.md)
* **Goal**: Implement atomic inventory updates for `pending`, `confirmed`, `shipping`, `completed`, and `cancelled` states. Log all transactions.
* **Status**: Pending

### [Phase 4: Admin Dashboard & Loyalty Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-04-admin-dashboard-and-loyalty-integration.md)
* **Goal**: Expose admin order management endpoints, update frontend admin screens, calculate and award 3F Club membership points upon completion.
* **Status**: Pending

### [Phase 5: Frontend E-commerce Flow Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1310-checkout-order-inventory-loyalty-flow/phase-05-frontend-ecommerce-flow-integration.md)
* **Goal**: Connect React PDP variants, quantity checks, cart validation, checkout submission, order tracking, and member transaction history to real APIs.
* **Status**: Pending

## Key Dependencies
- Plesk database connection for live orders.
- Existing 3F Club tables (`customer_loyalty_profiles`, `customer_point_transactions`).
