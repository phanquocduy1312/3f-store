---
title: Customer Profile & Loyalty Center Implementation
description: Design and implement the Customer Profile, Address Book, Orders, 3F Club Loyalty, Vouchers, Security, and Pets tabs on both Frontend and Backend.
status: in-progress
priority: high
effort: 3 days
branch: feature/customer-account-center
tags: [frontend, backend, loyalty, profile]
created: 2026-06-17
---

# Overview Plan

Implement the full Customer Profile / Account Center for 3F Store.

## Phases

- [Phase 1: Database Migrations](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-01-database-migrations.md) (Pending)
- [Phase 2: Router Extension & Backend Controllers](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-02-backend-apis.md) (Pending)
- [Phase 3: Frontend Route Guard & Layout](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-03-frontend-routing-guard-layout.md) (Pending)
- [Phase 4: Frontend Profile & Address Book](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-04-frontend-profile-and-address.md) (Pending)
- [Phase 5: Frontend Orders, Vouchers & Loyalty](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-05-frontend-orders-loyalty-vouchers.md) (Pending)
- [Phase 6: Checkout, Header Integration & Testing](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1725-customer-profile-loyalty-implementation/phase-06-checkout-header-integration-testing.md) (Pending)

## Key Dependencies
- Database migration needs to be executed before backend API calls.
- Routing extension must be in place before calling dynamic endpoints (like `/api/customer/addresses/:id`).
