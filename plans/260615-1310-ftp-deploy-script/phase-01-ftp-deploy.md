# Phase 1: FTP Deployment Script

## Context Links
- [Overview Plan](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1310-ftp-deploy-script/plan.md)
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260615-1310-ftp-deploy-script.md)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Implement a secure and reliable Python script to deploy files from `3f-api/` to `/httpdocs` on the Plesk server via FTP.

## Key Insights
- SSH is Forbidden on Plesk, and GitHub Actions is billing locked, so a local Python FTP script is the best workaround.
- Standard libraries (`ftplib`, `os`, `fnmatch`) are preferred to keep setup simple and zero-dependency.
- The root of Plesk FTP usually mapped is `/httpdocs`, but the PHP document root is `/httpdocs/public`. We need to upload `3f-api/` contents straight into `/httpdocs`.
- Avoid overwriting/uploading configuration files (`.env`), user uploads (`storage/uploads`), and logs (`storage/logs`) to prevent production data loss.

## Requirements
- Support `.deploy.env` configuration (host, user, password, target directory).
- Recursively deploy files within `3f-api/` to `FTP_TARGET_DIR`.
- Maintain ignore patterns for sensitive files and heavy/irrelevant folders.
- Only upload new or modified files (by comparing file sizes, or when the file doesn't exist remote).
- Auto-create directories on the remote server when uploading new folders.
- Clean logging of all steps (SKIP, UPLOAD, CONNECT, ERROR).

## Architecture
- **Language**: Python 3
- **Network Protocol**: FTP (via `ftplib.FTP` with option to use `FTP_TLS` if secure connection is required).
- **Directory Traversal**: `os.walk` to scan `3f-api/`.

## Related Code Files
- [NEW] [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)
- [MODIFY] [.gitignore](file:///c:/Users/Admin/Downloads/ccc/.gitignore)
- [NEW] [deploy-ftp-python.md](file:///c:/Users/Admin/Downloads/ccc/docs/deploy-ftp-python.md)

## Implementation Steps
1. Parse env vars from process environment and `.deploy.env` (if exists).
2. Scan the source directory `3f-api/` recursively.
3. Apply ignore filters to exclude `.env`, `storage/logs/`, `storage/uploads/`, `.git/`, etc.
4. Establish FTP connection.
5. Recursively upload required files, auto-creating remote folders and comparing size to avoid redundant uploads.
6. Handle connection failures and display appropriate logs.
7. Update `.gitignore` to ignore `.deploy.env`.
8. Document instructions in `docs/deploy-ftp-python.md`.

## Todo List
- [ ] Implement `scripts/deploy_ftp.py`
- [ ] Add `.deploy.env` line to `.gitignore`
- [ ] Create `docs/deploy-ftp-python.md`

## Success Criteria
- Script runs successfully on local machine.
- Environment variables are correctly read.
- File ignore rules are respected.
- Directory paths are mapped correctly (e.g., `3f-api/app/` to `/httpdocs/app/`).

## Risk Assessment
- *Risk*: Raw password expose in `.deploy.env`.
  - *Mitigation*: Strictly add `.deploy.env` to `.gitignore`.
- *Risk*: Overwriting config or data on server.
  - *Mitigation*: Add explicit skips for `.env`, `storage/uploads`, and `storage/logs`.

## Security Considerations
- Never hardcode credentials in code.
- Prevent uploading sensitive `.env` files.
