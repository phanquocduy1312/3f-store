# Cook Report: News Editor Layout Redesign

## Overview
- Issue: The previous layout had an imbalance: the left column (Editor) ended quickly while the right column (Settings + SEO Panel) extended very far down, leaving massive whitespace on the left when scrolling. Furthermore, there was no interface to actually edit the SEO title, description, or focus keyword metadata fields.
- Redesign Plan:
  - Reposition the SEO panel from the right sidebar to the bottom of the left column (below the editor).
  - Redesign `NewsSeoPanel` into a clean tabbed configuration center containing:
    1. **Tóm tắt bài viết** (Summary / Excerpt).
    2. **Thiết lập SEO** (Focus keyword, SEO Title, and Meta Description inputs).
    3. **Xem trước & Phân tích SEO** (SEO score badge, checklist, and Google snippet preview).
- Date: 2026-06-22
- Time: 14:36

## Changes Implemented

### 1. SEO Panel Redesign (`src/components/admin/news-seo-panel.tsx`)
- Restructured `NewsSeoPanel` to use a tabbed interface: "Tóm tắt bài viết", "Thiết lập SEO", and "Xem trước & Phân tích SEO".
- Added input fields to edit `keywords` (Từ khóa chính), `seoTitle` (Tiêu đề SEO), and `seoDescription` (Mô tả Meta).
- Rendered length counter helpers for SEO Title (up to 65 chars) and Meta Description (up to 160 chars).
- Kept the Google Snippet preview and SEO audits scorecard in Tab 3.

### 2. Editor Page Integration (`src/pages/admin/AdminNewsEditorPage.tsx`)
- Moved `NewsSeoPanel` from the right `<aside>` sidebar to the bottom of the left `<section>` column.
- Removed the standalone "Tóm tắt" textarea card since it has been cleanly integrated as Tab 1 in `NewsSeoPanel`.
- Connected state setters for keywords, seoTitle, seoDescription, and summary so users can edit them.

## Verification & Compilation
- Ran `npm run build` locally: compiled successfully with zero compilation or linting errors.
