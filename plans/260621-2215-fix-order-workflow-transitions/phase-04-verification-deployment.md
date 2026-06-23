# Phase 04: Verification & Deployment

## Context Links
- [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)

## Overview
- Priority: High
- Status: Pending
- Objective: Compile, build, and deploy backend + frontend updates to Plesk staging.

## Requirements
- Compile check: `npx tsc --noEmit`
- Production build: `npm run build`
- Deployment: `python scripts/deploy_ftp.py`

## Verification Steps
1. Deploy updates.
2. Run database migrations by triggering a backend order/migration URL or checking database directly.
3. Test transition of order `delivered` to `completed` and `return_requested` from the admin drawer.
4. Verify modals are translated and errors are user-friendly.

## Success Criteria
- Frontend build passes.
- Staging works correctly without breaking existing orders.
