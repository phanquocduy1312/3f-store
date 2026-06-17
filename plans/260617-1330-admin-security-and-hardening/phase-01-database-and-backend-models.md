# Phase 1: Database Schema & Backend Models

Implement the storage layer for admin accounts, session tokens, and security audits.

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260617-1330-admin-security-and-hardening.md)

## Requirements
- Create `3f-api/database/admin_schema.sql` defining:
  - `admin_users` (role default 'admin', unique email, hashed password).
  - `admin_sessions` (revokable tokens, expiration tracking).
  - `admin_audit_logs` (tracking admin operations).
- Create `AdminUser.php`, `AdminSession.php`, and `AuditLog.php` model files with self-migrating hooks.

## Related Code Files
- [NEW] [admin_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/admin_schema.sql)
- [NEW] [AdminUser.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/AdminUser.php)
- [NEW] [AdminSession.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/AdminSession.php)
- [NEW] [AuditLog.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/AuditLog.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Implementation Steps
1. Create `3f-api/database/admin_schema.sql` with `CREATE TABLE IF NOT EXISTS` for all three tables.
2. Code `AuditLog.php` model to enable logging actions.
3. Code `AdminUser.php` for user queries and password hashing verification logic.
4. Code `AdminSession.php` to handle token generation (cryptographically secure string), hash storage, validation, and revocation.
5. Register models in `3f-api/public/index.php` to ensure auto-migrations run.

## Todo List
- [ ] Create `admin_schema.sql`
- [ ] Create `AdminUser.php` model
- [ ] Create `AdminSession.php` model
- [ ] Create `AuditLog.php` model/helper
- [ ] Update `index.php` to run new migrations

## Success Criteria
- SQL schema parses cleanly in MySQL.
- Models instantiate and create tables on backend startup.
