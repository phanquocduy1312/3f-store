---
title: Dynamic Admin Roles and Feature-level Permissions
description: Transition from hardcoded admin roles to dynamic permissions, letting admins manage roles and toggle sidebar access dynamically.
status: In Progress
priority: High
effort: Medium
branch: main
tags: admin, permissions, security
created: 2026-06-24
---

# Dynamic Roles & Permissions Plan

## Phases

- [ ] Phase 1: Database Migration & Schema (Create roles table and seed defaults)
- [ ] Phase 2: Backend Role API (Endpoints to fetch, create, edit, delete roles)
- [ ] Phase 3: Centralized Endpoint Permission Enforcement in middleware
- [ ] Phase 4: Frontend Roles & Permissions Management UI (Tabs, checklist, dynamic role dropdown)
- [ ] Phase 5: Dynamic sidebar filtering & page protection
- [ ] Phase 6: Compile, Deploy, and Verification

## Dependencies
- Custom role updates must update local storage permission states.
