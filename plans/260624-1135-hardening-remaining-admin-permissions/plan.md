---
title: Align Frontend RBAC Permission Checks
description: Remove frontend permission bypasses for 'manager' and 'super_admin' roles, aligning them strictly with database permission queries.
status: in-progress
priority: high
effort: 2h
branch: main
tags: [security, frontend, rbac]
created: 2026-06-24
---

# Overview Plan

Align frontend RBAC checks with the backend by ensuring only `dev` and `admin` roles bypass checks, while all other roles require specific permissions.

## Phases

- **[Phase 1: Frontend Hardening](./phase-01-frontend-hardening.md)** (In Progress)
  Align hasEditAccess checks in 12 admin pages.
- **[Phase 2: Verification](./phase-02-verification.md)** (Pending)
  Run build checks and perform local RBAC script verification.
