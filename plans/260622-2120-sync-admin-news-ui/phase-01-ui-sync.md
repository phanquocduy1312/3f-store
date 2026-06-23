# Phase 1: Sync Admin News UI Layout and Styling

## Context Links
- Scout report: [scout-260622-2120-sync-admin-news-ui.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260622-2120-sync-admin-news-ui.md)
- Target file 1: [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx)
- Target file 2: [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx)
- Reference file: [AdminProductsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductsPage.tsx)

## Overview
- Priority: Medium
- Status: In Progress
- Description: Synchronize container backgrounds, width, layout margins, fonts, colors, buttons, KPI metrics, tab styles, tables, pagination, and dropdown menus of the News module with the established premium standards.

## Key Insights
- The rest of the admin pages use a custom background color `#F6FAFF`, whereas the News list page uses `#FAFAFA` and the editor page uses `bg-slate-50`.
- The News list page is centered with `max-w-6xl w-full mx-auto` which differs from the fluid, full-width content wrapper layout used in other modules.
- Form inputs, search textboxes, select dropdowns, tables, active paginated button, and borders need to be updated to use design tokens (e.g. `#0B1F3A` text color, `#DCEBFF` borders, `#0057E7` accent color, `rounded-xl`/`rounded-2xl` borders, premium shadows).

## Requirements
- Background of `AdminNewsPage.tsx` and `AdminNewsEditorPage.tsx` must be synchronized.
- Page margins, font sizes, heading classes, and button designs of the News Management page must match the rest of the application.
- The news list table wrapper, table header, categories badge, action menu, and pagination must be aligned with the UI design of the Products and Orders pages.
- Add the copyright footer at the bottom of the news list page.

## Architecture
No change to core business logic. CSS layout modifications only.

## Related Code Files
- [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx) [MODIFY]
- [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx) [MODIFY]

## Implementation Steps

### 1. Update `AdminNewsPage.tsx` Layout and Margins
- Change root container background to `bg-[#F6FAFF]`.
- Change main element layout to `className="flex-1 px-4 sm:px-6 py-6 space-y-6"` (remove max width limit).
- Update Page Heading and Subheading typography, colors, and classes to match standard. Remove the bottom border divider.
- Update header buttons ("Đồng bộ bài viết" and "Viết bài mới") with premium Tailwind CSS utility classes.

### 2. Update KPI Metrics Cards
- Update metric cards markup to match the style of `AdminProductsPage.tsx` (using Lucide icons, `border-[#DCEBFF]`, `rounded-[20px]`, blue shadow).

### 3. Update Filters & Tab Strips
- Change tab border and active classes (active indicator color should be `border-[#0057E7] text-[#0057E7]`).
- Style category dropdown, sort dropdown, and search input with premium background, border, font size, color, focus rings, and border radius.

### 4. Update Table & Pagination
- Update table card outer container border, radius, and shadow.
- Sync table headers font weight, size, and background.
- Sync categories badge, status badge, and SEO badge styling.
- Update the dropdown action menu icon, wrapper classes, shadows, and borders.
- Update the pagination active page background color and layout padding/borders.

### 5. Add Copyright Footer
- Add standard footer at the bottom of the main content wrapper.

### 6. Update `AdminNewsEditorPage.tsx` Background
- Synchronize background color with `bg-[#F6FAFF]`.

## Todo List
- [ ] Modify `AdminNewsPage.tsx` layout and buttons
- [ ] Revise KPI Metrics section with premium cards
- [ ] Style category/sort selectors and search bar
- [ ] Upgrade table wrapper, headers, action dropdowns, and badges
- [ ] Update pagination styles
- [ ] Add copyright footer
- [ ] Update `AdminNewsEditorPage.tsx` background color
- [ ] Verify pages render correctly without console errors

## Success Criteria
- News management pages blend seamlessly with the other admin pages.
- No visual bugs or responsive regressions.
- No compilation/type errors.

## Risk Assessment
- High risk of breaking visual alignments on smaller viewports. Ensure all responsive classes (e.g. `sm:`, `md:`, `lg:`) are preserved and adjusted properly.

## Security Considerations
None. UI changes only.

## Next Steps
Obtain approval from the user, then proceed to implementation.
