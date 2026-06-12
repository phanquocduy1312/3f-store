# Phase 1: Foundation - PHP Backend Setup

## Context Links

- Scout report: [scout-260612-1523-create-php-backend-3f-club.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1523-create-php-backend-3f-club.md)
- Main plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1523-create-php-backend-3f-club/plan.md)

## Overview

- **Priority**: High
- **Status**: Planning
- **Description**: Configure connection settings, global JSON response outputs, input sanitation helpers, order points calculation logic, file upload handlers, and write the SQL schema migration script.

## Key Insights

- Pure PHP without Composer packages: keep includes relative (`__DIR__`).
- Errors must never leak raw PHP logs. All exceptions in endpoints must return JSON `{ "success": false, "message": "..." }` with correct HTTP response codes.
- CORS must allow cross-origin requests and support preflight `OPTIONS` requests.

## Requirements

- Database configuration connecting to `3f` on localhost with user `root`, password `""`.
- SĐT validation: checks 9-11 digits starting with 0.
- Points logic: `points = floor(amount / 10000)`.
- Image uploading: limits to 5MB, validates mime-types (`image/jpeg`, `image/png`, `image/webp`), creates folders automatically if not exists, and generates timestamped names.
- SQL schema creating 3 tables: `uploaded_order_images`, `order_image_scans`, `shopee_point_requests`.

## Related Code Files

- [3f-api/schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/schema.sql) [NEW]
- [3f-api/config/database.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/config/database.php) [NEW]
- [3f-api/helpers/response.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/helpers/response.php) [NEW]
- [3f-api/helpers/validation.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/helpers/validation.php) [NEW]
- [3f-api/helpers/points.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/helpers/points.php) [NEW]
- [3f-api/helpers/upload.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/helpers/upload.php) [NEW]

## Implementation Steps

1. Create `schema.sql` with creation commands for `uploaded_order_images`, `order_image_scans`, and `shopee_point_requests`.
2. Write `config/database.php` implementing PDO connectivity with transaction wrapper options and JSON connection error responses.
3. Write `helpers/response.php` defining `jsonResponse` and `cors` helpers.
4. Write `helpers/validation.php` implementing phone/money cleaning, formats checking, and string trimming.
5. Write `helpers/points.php` for `calculateShopeePoints`.
6. Write `helpers/upload.php` configuring directories and validation checks.

## Todo List

- [ ] Create `schema.sql`.
- [ ] Create `config/database.php`.
- [ ] Create `helpers/response.php`.
- [ ] Create `helpers/validation.php`.
- [ ] Create `helpers/points.php`.
- [ ] Create `helpers/upload.php`.

## Success Criteria

- Running `database.php` successfully logs into the local database (or fails gracefully with JSON response).
- File upload helper correctly moves and renames mock test images.
- Point calculations compute `/ 10000` correctly.
