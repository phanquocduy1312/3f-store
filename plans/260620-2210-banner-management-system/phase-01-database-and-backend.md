# Phase 01: Database and Backend Services

## Context Links
- [product_catalog_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/product_catalog_schema.sql)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [public/index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Design and build the database migration for `banners` table, map the Model in PHP, and implement controllers/API routes supporting client and admin actions.

## Key Insights
- Public requests should filter banners that are active (`is_active = 1`) and within their scheduled runtime (current date is between `start_date` and `end_date`, or they are null).
- Image uploads need to save files under `public/uploads/banners/` directory and return a valid public URL.

## Requirements
- Create migration script `3f-api/database/migrate_banners.php` with table layout.
- Implement Model `3f-api/app/Models/Banner.php` to handle database operations (CRUD, fetch by position, track clicks).
- Implement Controller `3f-api/app/Controllers/BannerController.php`.
- Add API endpoints in routing mapping:
  - `GET /api/banners` (public retrieval)
  - `POST /api/banners/{id}/click` (anonymous click tracker)
  - `GET /api/admin/banners` (admin fetch)
  - `POST /api/admin/banners` (create + handle upload)
  - `PUT /api/admin/banners/{id}` (updates)
  - `DELETE /api/admin/banners/{id}` (removals)

## Architecture
```
[Client App] ---> [Router.php] ---> [BannerController.php] ---> [Banner.php] ---> [MySQL: banners table]
```

## Related Code Files
- **[NEW]** `3f-api/database/migrate_banners.php`
- **[NEW]** `3f-api/app/Models/Banner.php`
- **[NEW]** `3f-api/app/Controllers/BannerController.php`
- **[MODIFY]** `3f-api/public/index.php`

## Implementation Steps
1. Create and write `3f-api/database/migrate_banners.php` to run schema layout queries.
2. Build the `Banner` model handles queries: active banners retrieval, full list retrieval, click/view increments.
3. Write the `BannerController` handles validations, file uploading (via standard Upload helper), and json responses.
4. Update `3f-api/public/index.php` to register the new public and admin routes.
5. Create temporary seed data script or database insert queries.

## Todo List
- [ ] Create `migrate_banners.php` migration file
- [ ] Create `Banner.php` model file
- [ ] Create `BannerController.php` controller file
- [ ] Map routes in `public/index.php`
- [ ] Run migration to verify table creation

## Success Criteria
- SQL schema creates table correctly.
- Routes respond with valid JSON formats.
- Image uploads work and output path points to access range assets.

## Risk Assessment
- *Risk*: SQL exceptions due to missing fields.
- *Mitigation*: Run unit/manual test queries first in PHP.

## Security Considerations
- Require admin auth tokens on all `admin/banners` operations.
- Sanitize all text overlay inputs to prevent HTML/XSS injection.

## Next Steps
- Implement frontend admin UI controls (Phase 02).
