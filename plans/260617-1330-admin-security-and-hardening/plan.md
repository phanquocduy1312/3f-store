---
title: Admin Security & Hardening
description: Implementation plan for protecting admin endpoints, setting up auth token sessions, secure admin login pages, audit logging, and production CORS hardening.
status: pending
priority: high
effort: 3 days
branch: feature/admin-security-hardening
tags: [security, admin, auth, audit-log, hardening]
created: 2026-06-17T13:30:00+07:00
---

# Plan Overview - Admin Security & Hardening

Implementation roadmap for securing the admin endpoints and the backend storage of 3F Store / 3F Club.

## Phases

1. **Phase 1: Database Schema & Authentication Models**  
   Create the tables and model classes for admin users, sessions, and audit logging.  
   Detailed plan: [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-01-database-and-backend-models.md)
   
2. **Phase 2: Auth Endpoints & RequireAdmin Middleware**  
   Implement login/logout/me controllers, setup password verification, and integrate a secure router auth check.  
   Detailed plan: [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-02-auth-endpoints-and-middleware.md)

3. **Phase 3: Secure Frontend Login & Route Guarding**  
   Establish `/admin/login` page, build route guards for `/admin/*` views, and append JWT/Bearer tokens to api calls.  
   Detailed plan: [Phase 3 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-03-frontend-login-and-routes.md)

4. **Phase 4: Admin Audit Logging & CORS/Headers Hardening**  
   Record admin activities (order updates, loyalty approval/rejections) and protect CORS origins on production.  
   Detailed plan: [Phase 4 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1330-admin-security-and-hardening/phase-04-audit-logs-and-hardening.md)

## Key Dependencies

- PHP 8.3+ built-in `password_hash()` and `password_verify()`
- MySQL tables `admin_users` and `admin_sessions`
- Local storage token tracking in React SPA frontend
