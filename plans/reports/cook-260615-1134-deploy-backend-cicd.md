# Cook Report: Backend CI/CD Setup

- **Date**: 2026-06-15
- **Task**: Backend CI/CD Plesk Deployment Workflow

## Completed Implementations

- **GitHub Actions Workflow**: Created/updated `.github/workflows/deploy-backend.yml` to trigger on pushes to `dev` or `main` branches. It targets only backend folder changes (`3f-api/**`), synchronizes files using `rsync` over SSH, excludes local secrets/uploads/logs/node_modules, and applies correct folder and file permissions on Plesk.
- **Deployment Documentation**: Created `docs/deploy-backend.md` listing path triggers, SSH secrets variables (`PLESK_HOST`, `PLESK_USER`, `PLESK_PORT`, `PLESK_SSH_KEY`, `PLESK_PATH`), and instructions to manually set up `.env` on production.

No unresolved questions.
