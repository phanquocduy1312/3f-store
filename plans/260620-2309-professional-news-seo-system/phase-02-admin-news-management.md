# Phase 2: Admin News Operations Panel

## Context Links
- Research: [researcher-260620-2309-professional-news-seo-system.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260620-2309-professional-news-seo-system.md)

## Overview
- Priority: Medium
- Status: Pending
- Description: Build the admin interface (`/admin/news`) allowing managers to draft articles, edit SEO fields, verify SEO scores, and trigger the web scraper.

## Key Insights
- Standard HTML textareas are insufficient for publishing premium blogs; a rich editor or structured text composer is required.
- Real-time client-side analysis of Title length, Meta description length, and keyword presence gives administrators immediate feedback.
- Keeping files modularized prevents components from exceeding the 200-line limit.

## Requirements
- Admin dashboard at `/admin/news` showing table of articles, statuses, view counts, and actions.
- Composer modal with TipTap rich text rendering.
- SEO Audit Card displaying real-time checklist feedback:
  - Title character count (warn if outside 50-60 range).
  - Meta description count (warn if outside 120-160 range).
  - Focus keyword density (warn if absent or less than 1% of content).
- Button on toolbar to dispatch `GET /api/admin/blog-posts/crawl` with a live loading state.

## Related Code Files
- [NEW] [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx)
- [NEW] [blog-seo-assistant.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-seo-assistant.tsx)
- [NEW] [blog-editor.tsx](file:///c:/Users/Admin/Downloads/ccc/src/components/admin/blog-editor.tsx)
- [MODIFY] [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Implementation Steps
1. **Sidebar Link**: Add the `"Quản lý Tin tức"` link to [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) and register route `/admin/news` in [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx).
2. **Dashboard Grid**: Develop `AdminNewsPage.tsx` displaying all posts with sorting by views/date.
3. **Seo Assistant**: Implement `blog-seo-assistant.tsx` analyzing content text for keyword density and meta lengths.
4. **Rich Editor**: Create `blog-editor.tsx` hosting the content editing form.

## Todo List
- [ ] Add route and sidebar menu entry
- [ ] Build the `AdminNewsPage.tsx` listing layout
- [ ] Implement `blog-seo-assistant.tsx` component
- [ ] Implement `blog-editor.tsx` rich editor component
- [ ] Connect the "Trigger Web Scraper" button to API action

## Success Criteria
- Navigating to `/admin/news` loads the list of articles from backend API.
- Creating/editing an article displays live SEO validation badges (Green/Yellow/Red).
- Clicking the crawl trigger successfully imports target articles in the background.
