# Phase 1: Database and Backend Migration

## Context Links
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php)

## Overview
- Priority: High
- Current Status: Pending
- Description: Extend the `customer_pets` schema and controller to accept and return the AI consultation output as JSON.

## Requirements
- Add `ai_result` column to `customer_pets` table.
- Modify `CustomerPetController.php`:
  - In `list()`: include `aiResult` (parsed JSON or raw text) in returned data.
  - In `create()` and `update()`: accept `aiResult` from request inputs and persist it to the DB.

## Related Code Files
- [run_alter_pets.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_alter_pets.php) [NEW]
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php) [MODIFY]

## Implementation Steps
1. Create [run_alter_pets.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_alter_pets.php) to add `ai_result` TEXT NULL to the `customer_pets` table.
2. Trigger the script on staging to apply the migration.
3. Update `list()`, `create()`, and `update()` in [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php) to map and accept `aiResult`.

## Todo List
- [ ] Create `run_alter_pets.php` migration file.
- [ ] Run migration on staging via curl.
- [ ] Update `CustomerPetController.php` with `ai_result` handling.
