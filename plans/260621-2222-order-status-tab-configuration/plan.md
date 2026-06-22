---
title: Order Status Tab Configuration
description: Embed simple status and transition rules management directly within the main Admin Orders view.
status: in-progress
priority: high
effort: 2-3 hours
branch: dev
tags: [admin, orders, statuses, workflows]
created: 2026-06-21
---

# Plan: Order Status Tab Configuration

Provide a simplified, tabbed status and transition configuration screen directly within the orders workspace.

## Phase List

1. [Phase 01: Backend Status Config API](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2222-order-status-tab-configuration/phase-01-backend-status-config-api.md)
   - Status: pending
   - Build endpoints for simple status retrieval and status/transition editing.

2. [Phase 02: Frontend Status Config Tab](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2222-order-status-tab-configuration/phase-02-frontend-status-config-tab.md)
   - Status: pending
   - Add tabs to `/admin/orders`, render the status management tables, and integrate with backend APIs.

3. [Phase 03: Verification & Deployment](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2222-order-status-tab-configuration/phase-03-verification-deployment.md)
   - Status: pending
   - Build frontend, test endpoint routing, and push to Plesk staging.

## Key Dependencies
- The backend endpoints must restrict updates to critical workflow statuses to protect system operations.
