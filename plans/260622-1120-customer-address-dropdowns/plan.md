---
title: Vietnam Location Dropdowns in Customer Address Book
description: Integrate third-party API for cascading Province, District, and Ward dropdowns in client address book.
status: in-progress
priority: high
effort: small
branch: feature/customer-address-dropdowns
tags:
  - frontend
  - api
  - customer-profile
created: 2026-06-22
---

# Overview Plan

Integrate the open-api provinces API (`https://provinces.open-api.vn/api/`) in the client address book to replace manual text inputs for locations.

## Phases

1. [Phase 1: Types and API Integration](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1120-customer-address-dropdowns/phase-01-api-and-types.md) - Define TS interfaces and update AddressData schema.
2. [Phase 2: UI Dropdown Component Implementation](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1120-customer-address-dropdowns/phase-02-ui-implementation.md) - Update AddressBookPage to fetch data and render select menus.
3. [Phase 3: Verification & Deployment](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1120-customer-address-dropdowns/phase-03-testing-deployment.md) - Verify compilation, build bundles, and deploy backend & frontend.
