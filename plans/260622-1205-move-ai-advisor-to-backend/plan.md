---
title: Move AI Advisor to Backend and Fix Corruptions
description: Fix the corrupted frontend Groq API file, activate the backend consult API, and deploy changes to the staging server.
status: in-progress
priority: high
effort: low
branch: feature/move-ai-advisor-to-backend
tags:
  - backend
  - frontend
  - ai-advisor
  - deploy
created: 2026-06-22
---

# Overview Plan

Clean up `groqApi.ts`, sync the local routing/controller changes for `pet-advisor/consult` to the remote server, and update the API credentials.

## Phases

1. [Phase 1: Fix Frontend Client Code](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1205-move-ai-advisor-to-backend/phase-01-fix-groq-api-client.md) - Resolve compilation errors in `groqApi.ts` and delegate call to backend API helper.
2. [Phase 2: Sync and Deploy Backend to Staging](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1205-move-ai-advisor-to-backend/phase-02-deploy-backend-route.md) - Validate local backend files and deploy to Plesk server using the FTP deploy script.
3. [Phase 3: Validation and Verification](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1205-move-ai-advisor-to-backend/phase-03-verify-consultation.md) - Test end-to-end flow from the browser and via API tests.
