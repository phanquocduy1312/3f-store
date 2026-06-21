# Progress Report: Upgrade Admin News CMS

* **Date**: 260621
* **Time**: 0011
* **Task Slug**: upgrade-admin-news-cms
* **Category**: cook

## Changes Made

### Database Columns Added
* `category` (VARCHAR 100)
* `category_slug` (VARCHAR 150)
* `toc_enabled` (TINYINT 1 DEFAULT 1)
* `toc_title` (VARCHAR 100 DEFAULT 'Mục lục bài viết')

### Backend Files Modified
* [BlogPost.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/BlogPost.php): Added schema update, CRUD methods mapping category/TOC parameters, sorted by `updated_at DESC` / `created_at DESC` by default.
* [BlogPostController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/BlogPostController.php): Updated `getList` for category & sort filters, validated categories, default crawled posts category to `Tin tức 3F Store`.

### Frontend Files Modified
* [blogApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/blogApi.ts): Expanded definitions, mapped query parameters.
* [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx): Upgraded with sticky toolbar, tables, formatting, word counts, fullscreen, preview tab.
* [blog-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-editor.tsx): Integrated category dropdown, ToC configurations, fixed JSX nested tags.
* [blog-seo-assistant.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-seo-assistant.tsx): Integrated category completion auditing.
* [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx): Redesigned filter UI, column layouts, corrected status badge mapping (draft, published, scheduled).
* [BlogList.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogList.tsx): Updated category pills, passed selected category parameter, displayed actual category badge.
* [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx): Added category above title, conditionally rendered ToC based on `toc_enabled` parameter, applied customized `toc_title`.
* [blog-toc.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/blog/blog-toc.tsx): Render custom `title` header.

## Editor Packages Used
* `@tiptap/react`
* `@tiptap/starter-kit`
* `@tiptap/extension-link`
* `@tiptap/extension-image`
* `@tiptap/extension-underline`
* `@tiptap/extension-text-align`
* `@tiptap/extension-placeholder`
* `@tiptap/extension-table`
* `@tiptap/extension-table-row`
* `@tiptap/extension-table-cell`
* `@tiptap/extension-table-header`
* `@tiptap/extension-highlight`
* `@tiptap/extension-character-count`

## Verification Results
* `npx tsc --noEmit`: Success (0 errors).
* `npm run build`: Success (built in 6.79s).

## Unresolved Questions
* None. All tasks fully completed.
