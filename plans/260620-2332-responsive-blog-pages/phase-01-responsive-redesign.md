# Phase 1: Responsive Layout Adjustments

## Context Links
- Plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2332-responsive-blog-pages/plan.md)
- Research: [researcher-01-responsive-layout.md](file:///c:/Users/Admin/Downloads/ccc/plans/260620-2332-responsive-blog-pages/research/researcher-01-responsive-layout.md)

## Overview
- Priority: High
- Status: Completed
- Description: Refactor layout structures in `BlogList.tsx` and `BlogDetail.tsx` to support all screens cleanly, from mobile to desktop.

## Key Insights
- Touch targets on mobile must be large enough (minimum 44x44px).
- Categories list on mobile should be side-scrollable without showing scrollbars.
- Collapsible ToC on mobile/tablet prevents excessive scrolling to reach article content.
- Left & right sidebars on desktop must have correct top offsets (`top-[160px]`) because the navbar header height is ~140px.

## Requirements
### Functional
- Horizontal-scrollable category tabs on screens `< 1024px`.
- Auto-collapsing and expandable mobile Table of Contents component below the post summary on mobile.
- Smooth scroll navigation that offsets target positions to avoid text sliding under the sticky header.
- Desktop sticky columns stay fixed in viewport as the user scrolls the long article body.

### Non-Functional
- Performant viewport transitions without horizontal page overflow (layout shifts).
- Fully responsive design using standard Tailwind CSS classes.
- Search input is accessible and visible on all screen sizes.

## Architecture
On desktop, `BlogDetail` features a three-column grid layout:
```
+-------------------------------------------------------------+
|                        Header Nav                           |
+-------------------------------------------------------------+
|   ToC / Share   |    Main Content Card    |    Trending     |
|   (Col Span 3)  |      (Col Span 6)       |  (Col Span 3)   |
|   [Sticky]      |                         |  [Sticky]       |
+-------------------------------------------------------------+
```
On mobile & tablet, the side columns collapse, resulting in a single-column layout:
```
+-------------------------------------+
|             Header Nav              |
+-------------------------------------+
|        Breadcrumbs / Back Button    |
+-------------------------------------+
|        Article Title / Meta         |
+-------------------------------------+
|        Collapsible ToC Accordion    |
+-------------------------------------+
|        Main Content Body            |
+-------------------------------------+
|        Social Sharing Row           |
+-------------------------------------+
|        Trending Posts List          |
+-------------------------------------+
```

## Related Code Files
- [MODIFY] [BlogList.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogList.tsx)
- [MODIFY] [BlogDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/BlogDetail.tsx)

## Implementation Steps
### 1. BlogList Responsive Redesign
* **Category Tabs**: Update container to have `overflow-x-auto whitespace-nowrap flex-nowrap scrollbar-none -mx-4 px-4 pb-2`. Ensure cards container has proper margins to handle the offset.
* **Layout Scaling**: Adjust title header gradient card margins, padding, and text scaling using `p-6 sm:p-12` and `text-2xl sm:text-4xl lg:text-5xl`.
* **Grid Breakpoints**: Adjust grid container to use `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

### 2. BlogDetail Responsive Redesign
* **Header / Title**: Modify title and meta badges margins and font sizes for mobile viewports (`text-xl sm:text-3xl lg:text-4xl`).
* **Mobile ToC Accordion**:
  * Implement an inline collapsible ToC inside `BlogDetail.tsx` that appears only on mobile/tablet viewports (`lg:hidden`).
  * Add a local state `const [isTocOpen, setIsTocOpen] = useState(false)`.
  * Style the header trigger button to look clean with a chevron icon rotating on toggle.
* **Main Grid Columns**: Setup the parent grid to stack columns: `grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`.
* **Sidebars Toggle Visibility**:
  * Hide Left Sidebar aside tag on mobile/tablet (`hidden lg:block lg:col-span-3`).
  * Place horizontal sharing buttons block below the article on mobile (`block lg:hidden mt-6`).
  * Shift Trending list sidebar to bottom on mobile/tablet (`col-span-12 lg:col-span-3`).

## Todo List
- [x] Implement mobile categories swipe in `BlogList.tsx`
- [x] Adjust card grid breakpoints in `BlogList.tsx`
- [x] Implement mobile-friendly collapsible ToC in `BlogDetail.tsx`
- [x] Setup stacked layouts for share and trending lists on mobile/tablet
- [x] Verify build compiles correctly with zero errors

## Success Criteria
- Verified touch scrolling on categories tabs.
- No text clipping, overlapping boxes, or horizontal scrollbar on the viewport body from 320px to 1920px.
- Smooth scrolling triggers offset by exactly 160px from the top of the header.

## Risk Assessment
- *Risk*: Horizontal scrollbar appearing on the page body due to margins or wide tables inside the post content.
  - *Mitigation*: Set `.article-rich-content { overflow-x: auto; }` and ensure proper wrapper layouts.

## Security Considerations
- Rich content is filtered via DOMPurify to prevent XSS. No changes will affect sanitization.

## Next Steps
- Kế hoạch thiết kế responsive đã được hoàn thành xuất sắc và kiểm thử thành công.
