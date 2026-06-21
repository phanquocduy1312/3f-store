# Scout Report: WordPress-like Admin News Editor

- **Date**: 260621
- **Time**: 0015
- **Slug**: wordpress-like-admin-news-editor
- **Type**: scout

## Base Context & Files Discovered

We investigated the codebase and discovered the following key structures:

1. **Routing Setup**:
   - Route path definitions are in [src/App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx).
   - Currently, `/admin/news` is mapped to `AdminNewsPage`. We need to add:
     - `/admin/news/new` -> `AdminNewsEditorPage`
     - `/admin/news/:id/edit` -> `AdminNewsEditorPage`

2. **Frontend Admin News List**:
   - Mapped to [src/pages/admin/AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx). We will update this page to use router navigation instead of state-based modals.

3. **Existing Editor Component**:
   - Located at [src/components/admin/blog-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-editor.tsx). It acts as a modal window. We will replace this modal editor with the full-page editor route.

4. **Tiptap Editor Instance**:
   - Located at [src/components/admin/tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx). We will update this file to support all required buttons: Paragraph, H2, H3, H4, Bold, Italic, Underline, Strike, Highlight, Clear formatting, Bullet list, Numbered list, Task/checklist, Alignment, Link, Image (by URL / computer), Quote, HR, and Tables (insert/rows/columns).

5. **SEO Scoring & Google Preview**:
   - Located at [src/components/admin/blog-seo-assistant.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-seo-assistant.tsx). We will write a brand new [src/components/admin/news-seo-panel.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-seo-panel.tsx) to implement Yoast-like SEO scoring of 100 points: Title (15), Meta description (15), Slug readability (10), Content length/quality (20), H2/H3 headings (10), Thumbnail alt (10), Internal links (10), Natural keyword usage (10).

6. **Database Schema & Models**:
   - SQL schema is in [3f-api/database/blog_posts_schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/blog_posts_schema.sql). Table `blog_posts` supports `category`, `toc_enabled`, `toc_title`, and `deleted_at`.
   - Model file is in [3f-api/app/Models/BlogPost.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/BlogPost.php). We will add `deleted_at` to the dynamic migration code to ensure safety.

7. **Backend API Route Handlers**:
   - API controller is in [3f-api/app/Controllers/BlogPostController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/BlogPostController.php).
   - In `getDetail()`, draft/scheduled public check filters posts properly.
   - In `getList()`, public users only see published and past/now published articles.
