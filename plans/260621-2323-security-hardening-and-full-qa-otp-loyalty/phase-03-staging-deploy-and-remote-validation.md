# Phase 03: Staging Deploy & Remote Validation

## Context Links
- [run_migration.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_migration.php)
- [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Deploy updates, configure staging environments, block public files, and perform final remote verification.

## Requirements
- Move/block public access to `run_migration.php` for security.
- Update remote `.env` with new variables via a temporary staging execution script.
- Verify OTP and loyalty flow behavior end-to-end.

## Related Code Files
- `3f-api/public/run_migration.php`

## Implementation Steps
1. Block access to `run_migration.php` by checking environment or wrapping it, or deleting it after migration verification.
2. Build frontend and deploy to staging.
3. Test end-to-end customer rewards dashboard behavior.

## Todo List
- [ ] Block `run_migration.php` access.
- [ ] Deploy modified files to Plesk staging.
- [ ] Validate end-to-end on staging site.

## Success Criteria
- Staging orders transition correctly.
- Dashboard warnings disappear upon mock phone verification.
