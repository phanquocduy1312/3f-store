# Phase 01: Workflow & Documentation (FTP Deploy)

## Context Links
- [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1134-deploy-backend-cicd/plan.md)
- [deploy-backend.yml](file:///c:/Users/Admin/Downloads/ccc/.github/workflows/deploy-backend.yml)

## Overview
- **Priority**: High
- **Current Status**: Planned
- **Description**: Configure GitHub Actions workflow `deploy-backend.yml` to trigger on pushes to `dev` and `main` branches and copy only `3f-api/` contents to Plesk `/httpdocs/` path using `SamKirkland/FTP-Deploy-Action@v4.3.5`.

## Key Insights
- Do not deploy frontend folder files.
- Exclude `.env`, `storage/uploads`, and `storage/logs` from being overwritten or deleted.
- Local directory must be `./3f-api/` and target path on FTP server should end with a trailing slash.

## Requirements
- Trigger on `dev` and `main` pushes for paths `3f-api/**` and `.github/workflows/deploy-backend.yml`.
- FTP/FTPS deployment technique.
- Exclude `.env`, `.git/**`, `.github/**`, `node_modules/**`, `vendor/**`, `storage/uploads/**`, and `storage/logs/**` from the FTP upload.

## Related Code Files
- [deploy-backend.yml](file:///c:/Users/Admin/Downloads/ccc/.github/workflows/deploy-backend.yml) (Modify)
- [deploy-backend.md](file:///c:/Users/Admin/Downloads/ccc/docs/deploy-backend.md) (Modify)

## Implementation Steps
1. Modify `.github/workflows/deploy-backend.yml` to use `FTP-Deploy-Action`.
2. Update `docs/deploy-backend.md` document.

## Todo List
- [ ] Modify `deploy-backend.yml`
- [ ] Update `docs/deploy-backend.md`

## Success Criteria
- Valid YAML syntax in `deploy-backend.yml`.
- Documentation matches requested FTP details.
