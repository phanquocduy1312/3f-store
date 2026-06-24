---
title: Security Hardening for Admin Roles & Permissions
description: Block self-role modifications, prevent privilege escalation to dev/admin/super_admin, and secure path permission checks against route query parameter bypasses.
status: Completed
priority: High
effort: Medium
branch: dev
tags: admin, roles, permissions, security, backend
created: 2026-06-24
---

# Secure Roles & Permissions Plan (Read-Only Refactor)

This plan implements a read-only access policy across the admin panel:
- Users who do not possess specific feature permissions can still view the corresponding pages (sidebar remains fully visible, read-only GET requests are allowed).
- All write/mutation actions (POST, PUT, DELETE, PATCH) are blocked on the backend and disabled/hidden on the frontend.

## Phases

- [x] Phase 1: Backend Integration (Modify AuthMiddleware to skip GET permission checks)
  - [phase-01-security-hardening.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-01-security-hardening.md)
- [x] Phase 2: Frontend Hardening (Allow access to Accounts & Analytics pages, pass hasEditAccess, show correct admin badges)
  - [phase-02-frontend-hardening.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-02-frontend-hardening.md)
- [x] Phase 3: Deployment & Testing (Run deploy_ftp.py and verify via manual browser testing)
  - [phase-03-testing-and-sync.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-03-testing-and-sync.md)

## Key Dependencies
- FTP Deployment of PHP backend updates via `deploy_ftp.py`
- Frontend build validation (`npm run build`)

