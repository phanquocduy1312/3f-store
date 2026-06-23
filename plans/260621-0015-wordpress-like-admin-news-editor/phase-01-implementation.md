# Phase 1: Implementation of WordPress-like News Editor

## Context Links
- Scout report: [scout-260621-0015-wordpress-like-admin-news-editor.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260621-0015-wordpress-like-admin-news-editor.md)
- Root Overview Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260621-0015-wordpress-like-admin-news-editor/plan.md)

## Overview
- **Priority**: High
- **Status**: Pending Approval
- **Description**: Rebuild `/admin/news` CMS features to match a WordPress-like workflow with full-page editor routes, Tiptap extensions, sidebar settings, and local SEO score calculation.

## Key Insights
1. **No Modals**: Modals are too narrow and restrict long-form content writing. Replacing it with full-page editor routes (`/admin/news/new` and `/admin/news/:id/edit`) will provide standard WordPress-like experience.
2. **Modular Components (under 200 lines)**: To keep files maintainable and clean, we will split the large modal component into:
   - `AdminNewsEditorPage.tsx`: Editor page layout, routing, saving logic.
   - `news-editor-toolbar.tsx`: Toolbar component containing Tiptap editor buttons.
   - `news-editor-sidebar.tsx`: Sticky right sidebar panels for Category, Featured Image, Table of Contents.
   - `news-seo-panel.tsx`: Yoast-style SEO auditing and scoring calculation.
3. **Draft & Published API Filters**: Ensure standard status and soft-delete filters are strictly applied in public endpoints.

## Requirements
- **Functional**:
  - Full-page editor layout with sticky top header.
  - Interactive Tiptap rich-text formatting (H2-H4, List, Align, Underline, Table row/cols, Undo/Redo, Links, Images).
  - Draft, published, scheduled status management with valid date logic.
  - Local SEO score (0-100 points) based on exact weights (Title, Slug, Meta, Content words, headings, alt text, internal links, keyword usage).
  - Sanitize all public HTML content using DOMPurify.
- **Non-functional**:
  - Clean TypeScript compilation (`npx tsc --noEmit` returns 0 errors).
  - Responsive stacking layout for mobile viewports.

## Architecture
```
┌────────────────────────────────────────────────────────┐
│                  AdminNewsEditorPage                   │
├──────────────────────────┬─────────────────────────────┤
│   Left Content Panel     │    Right Sidebar Panels     │
│   - Large Title          │    - Publish Settings       │
│   - Permalink / Slug     │    - Categories Selector    │
│   - TipTap rich text     │    - Featured Image         │
│   - Excerpt / Summary    │    - Table of Contents      │
│   - Preview Tab          │    - Yoast SEO Assistant    │
└──────────────────────────┴─────────────────────────────┘
```

## Related Code Files

### [MODIFY]
1. [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) — Add lazy routes for creation/editing pages.
2. [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx) — Remove modal integration, update row action/add buttons to route-navigate.
3. [tiptap-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/tiptap-editor.tsx) — Completely rebuild with full buttons and added extensions.
4. [BlogPost.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/BlogPost.php) — Dynamic DB check for `deleted_at` column.

### [NEW]
1. [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx) — WordPress-like CMS page.
2. [news-editor-toolbar.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-editor-toolbar.tsx) — Tiptap action button groups.
3. [news-editor-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-editor-sidebar.tsx) — Sidebar publish, category, featured image, TOC configuration cards.
4. [news-seo-panel.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/news-seo-panel.tsx) — Local Yoast-style SEO checker.

## Implementation Steps

### 1. Database Safety Check
- Update `BlogPost.php` `migrate()` to alter and add `deleted_at` if missing dynamically.

### 2. Add Routes
- Update `src/App.tsx` and import `AdminNewsEditorPage` as a lazy-loaded page. Add paths `/admin/news/new` and `/admin/news/:id/edit`.

### 3. Tiptap Rebuild
- Rebuild `tiptap-editor.tsx` supporting task lists, placeholder, and character count. Build modular toolbar actions in `news-editor-toolbar.tsx` (all buttons work natively).

### 4. Create Sidebar & SEO Panels
- Develop `news-editor-sidebar.tsx` and `news-seo-panel.tsx` to keep code clean and under 200 lines.

### 5. Create `AdminNewsEditorPage.tsx`
- Build the core page: fetch blog post details if in edit mode, manage autosaves, handle submit actions, and export to API.

### 6. Connect `AdminNewsPage.tsx`
- Replace state hooks with router links. Implement table pagination, sorting, status badges, actions, and verification.

## Todo List
- [ ] Add `deleted_at` column migration to PHP model
- [ ] Add lazy editor route paths in `src/App.tsx`
- [ ] Design and implement `news-editor-toolbar.tsx`
- [ ] Design and implement `news-editor-sidebar.tsx`
- [ ] Design and implement `news-seo-panel.tsx` with Yoast audits
- [ ] Upgrade Tiptap configuration in `tiptap-editor.tsx`
- [ ] Implement `AdminNewsEditorPage.tsx` full page UI
- [ ] Connect list actions in `AdminNewsPage.tsx` to editor pages
- [ ] Verify build and compilation status

## Success Criteria
- Editing and publishing a new post from scratch functions without any errors.
- HTML tags (headings, tables, checklists) rendered correctly in public preview and details.
- Build compiles cleanly (`npm run build` succeeds).

## Risk Assessment
- *Issue*: Missing DB fields causing SQL execute errors.
- *Mitigation*: Automatically check/add columns during model construction.

## Security Considerations
- Escape/sanitize rich HTML outputs using DOMPurify before public injection.
- Block execution of `script`, `iframe`, and event listeners in raw text inputs.
