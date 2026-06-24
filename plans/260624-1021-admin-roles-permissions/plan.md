---
title: Admin Role-Based Access Control (RBAC)
description: Implement operational role permissions for admin accounts, including staff user management and frontend action guards.
status: planning
priority: high
effort: medium
branch: dev
tags: [admin, authentication, rbac, security]
created: 2026-06-24
---

# Admin Role-Based Access Control Plan

This plan implements full role-based operational permissions on the admin dashboard, including exposing employee account management and UI action blocks.

## Context & Scout Reports
- Context & Specs: [researcher-260624-1021-admin-roles-permissions.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260624-1021-admin-roles-permissions.md)

## Phases

1. **Phase 1: Backend API & Authorization Middleware**
   - Implement dynamic permission checking in `AuthMiddleware`.
   - Update `AdminUserController` to support standard admin CRUD actions and proper role filtering.
   - Expose endpoints in the API routing table.
   - [phase-01-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1021-admin-roles-permissions/phase-01-backend.md)

2. **Phase 2: Frontend Layout, Routes & Action Guards**
   - Create `AdminAccountsPage.tsx` to list and manage administrative accounts.
   - Update sidebar menu navigation to filter by role permission map.
   - Update routing guards in `App.tsx` and list actions (disable/hide save/delete buttons based on user permissions).
   - [phase-02-frontend.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1021-admin-roles-permissions/phase-02-frontend.md)
