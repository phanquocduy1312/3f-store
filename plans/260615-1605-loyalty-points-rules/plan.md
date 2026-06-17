---
title: Loyalty Point Rule Configuration Module
description: Implement Loyalty Point rule database configuration, calculation services, and admin configuration panel.
status: in-progress
priority: high
effort: medium
branch: dev
tags: [loyalty, admin, backend, settings]
created: 2026-06-15
---

# Plan - Loyalty Point Rule Config Module

Introduce flexible Loyalty Point rules based on custom rules (money per point, rounding mode, minimum order amount, maximum points cap, multiplier) in both frontend and backend.

## Phases
1. [Phase 1: Database and Backend Core](phase-01-loyalty-points-backend.md) - Create schema, model, calculation service, and API routes.
2. [Phase 2: Update Approval Points Flow](phase-02-point-approval-flow.md) - Update point calculations in controllers to use the new service.
3. [Phase 3: Frontend Config Page and Navigation](phase-03-loyalty-points-frontend.md) - Create Admin settings view and navigation links.
