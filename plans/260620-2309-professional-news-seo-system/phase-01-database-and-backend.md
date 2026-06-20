# Phase 1: Database & Backend APIs

## Context Links
- Research: [researcher-260620-2309-professional-news-seo-system.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260620-2309-professional-news-seo-system.md)

## Overview
- Priority: High
- Status: Pending
- Description: Extend the `blog_posts` table with SEO fields and implement the full admin API suite (Create, Read, Update, Delete, Image Upload) to allow rich content creation.

## Key Insights
- Adding `seo_title`, `seo_description`, and `seo_keywords` as optional fields allows us to gracefully fallback to standard content properties when empty.
- Multi-part form data is needed for image uploads, utilizing the existing `UploadService` helper.

## Requirements
- Database migration script that alters `blog_posts` table safely without loss of data.
- API endpoints for admin post creation (`POST /api/admin/blog-posts`), updates (`PUT /api/admin/blog-posts/:id`), and deletions (`DELETE /api/admin/blog-posts/:id`).
- Admin upload image endpoint returning the absolute public URL of the uploaded asset.

## Related Code Files
- [NEW] [add_seo_columns_to_blog_posts.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/add_seo_columns_to_blog_posts.sql)
- [MODIFY] [run_migration.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/run_migration.php)
- [MODIFY] [BlogPost.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/BlogPost.php)
- [MODIFY] [BlogPostController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/BlogPostController.php)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Implementation Steps
1. **Migration**: Create the SQL alter script and integrate it into `run_migration.php`. Execute it on the database.
2. **Model Refactoring**: Update `BlogPost.php` model queries (`getPaginated`, `getBySlug`, `upsert`) and add `create()`, `update()`, `delete()` methods.
3. **Controller CRUD**: Implement API action endpoints in `BlogPostController.php` with validation checks.
4. **Image Upload API**: Binds standard image uploading to `/uploads/blog/` using `UploadService`.

## Todo List
- [ ] Create `add_seo_columns_to_blog_posts.sql` script
- [ ] Integrate and execute migration via `run_migration.php`
- [ ] Add CRUD operations to `BlogPost.php` model
- [ ] Implement CRUD action methods in `BlogPostController.php`
- [ ] Register new admin routes in `index.php`

## Success Criteria
- Staging MySQL database successfully updated with columns: `seo_title`, `seo_description`, `seo_keywords`, `view_count`.
- Testing `POST /api/admin/blog-posts` creates a new article in the database.
- Testing `PUT /api/admin/blog-posts/:id` updates all content and SEO fields.
