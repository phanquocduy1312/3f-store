# Scout Report: FTP Deploy Script

## Context

* **Project**: 3F Store / 3F Club
* **Date**: 260615 (15th June 2026)
* **Time**: 13:10
* **Slug**: ftp-deploy-script

## Findings

The repository contains:
1. **Frontend**: React/Vite in the root (`src`, `public`, `components`, `lib`, etc.)
2. **Backend**: Pure PHP MVC inside `3f-api/`

### `3f-api` Directory Structure:
- `3f-api/.env` (To be ignored on deployment)
- `3f-api/app/` (Controllers, models, routing, core backend logic)
- `3f-api/config/` (Configuration files)
- `3f-api/migrations/` (Database migration files)
- `3f-api/public/` (Index.php, public assets. To be mapped to Plesk `httpdocs/public/`)
- `3f-api/schema.sql` (Database schema structure)
- `3f-api/storage/` (Logs, cache, uploads. Subfolders `uploads/` and `logs/` must be ignored during deploy)

### Deployment Targets & Configuration:
- Domain: `trial1506895.mbws.vn`
- IP Plesk: `203.205.31.252`
- Root target on server: `/httpdocs`
- Mapping example:
  - `3f-api/app/` -> `/httpdocs/app/`
  - `3f-api/public/index.php` -> `/httpdocs/public/index.php`
- Ignore patterns:
  - `.env`
  - `storage/uploads/**`
  - `storage/logs/**`
  - `.git/**`, `.github/**`, `node_modules/**`, `vendor/**`, `__pycache__/**`, `.DS_Store`
- Local env file: `.deploy.env`
- Target ignore in `.gitignore`: `.deploy.env`

## Recommendations

1. Implement `scripts/deploy_ftp.py` using Python's standard `ftplib` library to avoid external dependencies.
2. Read `.deploy.env` manually (line parsing) to avoid requiring `python-dotenv` package.
3. Compare file sizes or modification times (if supported) to perform incremental uploads.
4. Auto-create missing remote directories dynamically.
5. Create comprehensive user documentation in `docs/deploy-ftp-python.md`.
