---
title: Fix Order Workflow Transitions Mismatch
description: Align admin orders action buttons with database state rules and resolve controller signature errors.
status: in-progress
priority: high
effort: 1-2 hours
branch: dev
tags: [admin, order, workflow, database]
created: 2026-06-21
---

# Plan: Fix Order Workflow Transitions Mismatch

Align backend workflow state definitions, transitions table records, and frontend actions UI.

## Phase List

1. [Phase 01: Database Seeding & Migration Safety](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2215-fix-order-workflow-transitions/phase-01-database-seeding-migration-safety.md)
   - Status: pending
   - Write idempotent migration/seeding updates in `Order.php` to correct state values and transitions.

2. [Phase 02: Controller Signature Resolution](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2215-fix-order-workflow-transitions/phase-02-controller-signature-resolution.md)
   - Status: pending
   - Ensure the controller allowed transitions API accepts zero arguments and reads inputs correctly.

3. [Phase 03: Frontend Integration & Fallback Control](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2215-fix-order-workflow-transitions/phase-03-frontend-integration-fallback-control.md)
   - Status: pending
   - Update `AdminOrdersPage.tsx` to query/enforce backend transitions, translate keys, and handle toast messages.

4. [Phase 04: Verification & Deployment](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2215-fix-order-workflow-transitions/phase-04-verification-deployment.md)
   - Status: pending
   - Build frontend, test PHP API, and deploy changes to the staging server.

## Key Dependencies
- Database changes must be deployed and migrated safely before frontend uses new API.
