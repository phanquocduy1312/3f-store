# Cook Report: FTP Deploy Script

## Context

* **Project**: 3F Store / 3F Club
* **Date**: 260615 (15th June 2026)
* **Time**: 13:10
* **Slug**: ftp-deploy-script

## Accomplishments

All requirements for the local FTP deployment script have been implemented successfully:

1. **FTP Deployment Script** (`scripts/deploy_ftp.py`):
   - Supports reading configurations from `.deploy.env` or process environment variables (`FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_TARGET_DIR`).
   - Targets the local backend source directory `3f-api/` (uploads contents of it, not the directory itself).
   - Resolves ignore pattern configurations (`.env`, `storage/uploads/`, `storage/logs/`, `.git/`, `.github/`, `node_modules/`, `vendor/`, `__pycache/`, `*.DS_Store`).
   - Compares remote files by size to perform incremental uploads (only uploading if sizes differ or remote file is missing).
   - Automatically handles the creation of remote parent subfolders dynamically during upload.
   - Outputs robust logs (`[SKIP]`, `[SKIP (Unchanged)]`, `[UPLOAD]`, `[DIR]`, and errors).
2. **Git Configuration**:
   - Modified `.gitignore` to ignore local credential file `.deploy.env` while keeping `scripts/deploy_ftp.py` tracked.
3. **User Documentation** (`docs/deploy-ftp-python.md`):
   - Created detailed instructions explaining configuration methods (env vars, `.deploy.env`), execution steps in Windows PowerShell, fallbacks for credentials, and endpoint verification testing.
4. **Project Documentation Updates**:
   - Recorded the completion in `docs/project-changelog.md` and `docs/project-roadmap.md`.
