# Cook Report: Backend CI/CD Setup (FTP)

- **Date**: 2026-06-15
- **Task**: Backend CI/CD Plesk Deployment Workflow

## Completed Implementations

- **GitHub Actions Workflow**: Changed the deploy workflow in `.github/workflows/deploy-backend.yml` from SSH/rsync to `SamKirkland/FTP-Deploy-Action@v4.3.5` because SSH is forbidden on the target Plesk server. Trigger branch remains `dev` and `main` for changes in `3f-api/**`. Local source is `./3f-api/` and server destination is `${{ secrets.FTP_SERVER_DIR }}`. Excludes are defined for `.env`, `storage/uploads`, `storage/logs`, `.git`, `.github`, `node_modules`, and `vendor`.
- **Deployment Documentation**: Updated `docs/deploy-backend.md` listing FTP secrets variables (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`) and target directories configurations.

No unresolved questions.
