---
title: Security Hardening for Admin Roles & Permissions
description: Block self-role modifications, prevent privilege escalation to dev/admin/super_admin, and secure path permission checks against route query parameter bypasses.
status: In Progress
priority: High
effort: Medium
branch: dev
tags: admin, roles, permissions, security, backend
created: 2026-06-24
---

# Secure Roles & Permissions Plan

This plan aims to address security loopholes in the admin accounts management system, specifically blocking self-role modification/lockout, preventing privilege escalation to top-tier roles (dev, admin, super_admin), and securing the URL route permission validation.

## Phases

- [ ] Phase 1: Security Hardening (Backend controller updates & AuthMiddleware route parsing fix)
  - [phase-01-security-hardening.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-01-security-hardening.md)
- [ ] Phase 2: Frontend Hardening & Enforcement (Disabling dropdowns/actions based on session user)
  - [phase-02-frontend-hardening.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-02-frontend-hardening.md)
- [ ] Phase 3: Automation Testing & Sync
  - [phase-03-testing-and-sync.md](file:///c:/Users/Admin/Downloads/ccc/plans/260624-1112-secure-roles-permissions/phase-03-testing-and-sync.md)

## Key Dependencies
- FTP Deployment of PHP backend updates via `deploy_ftp.py`
- Frontend build validation (`npm run build`)
