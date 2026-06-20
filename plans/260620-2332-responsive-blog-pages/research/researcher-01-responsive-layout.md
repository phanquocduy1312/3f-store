# Technical Research: Responsive Layout Strategy for Blog List & Detail

This document outlines the responsive breakpoint specifications, grid transitions, and CSS layout strategies to optimize `/tin-tuc` (Blog List) and `/tin-tuc/:slug` (Blog Detail) for mobile, tablet, and desktop viewports.

---

## 1. Breakpoint Definitions & Specifications

We align our styles with the following tailwind-standard breakpoints to target various devices:

| Breakpoint | Screen Width | Device Categories | Target Layout Changes |
| :--- | :--- | :--- | :--- |
| **Default (xs)** | `< 640px` | Portrait Mobile (iPhone, Samsung) | Single-column grids, swipeable horizontal menu, stacked sidebars, reduced text sizes. |
| **sm** | `640px` - `767px` | Landscape Mobile, Small Tablets | 2-column card grid in list view, wider padding. |
| **md** | `768px` - `1023px` | Portrait Tablets (iPad, Android tabs) | 3-column card grid in list view, centered details content with stacked sidebars. |
| **lg** | `1024px` - `1279px` | Landscape Tablets, Laptops | 4-column card grid, 3-column detail view with sticky sidebars. |
| **xl** | `>= 1280px` | Large Desktop / Monitors | Max container size (`max-w-7xl`), clean side offsets, floating interactive widgets. |

---

## 2. Blog List Page (`BlogList.tsx`) Layout Strategy

### A. Title Header Section
* **Desktop (`lg`+)**: Padding `p-12`, absolute icon decoration, heading `text-5xl`.
* **Tablet (`md`)**: Heading `text-4xl`, padding `p-10`.
* **Mobile (`xs`/`sm`)**: Heading `text-3xl`, padding `p-6` or `p-8`. Decorative icons hidden or opacity reduced to avoid overlapping content.

### B. Category Selection Tabs
* **Problem**: Wrapping category pills vertically on smaller screens looks unprofessional.
* **Solution**: Enable horizontal swipe slider.
  * Container classes: `flex flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-none -mx-4 px-4`
  * `-mx-4 px-4` makes the scroll area bleed to the edges of the screen for a premium mobile feel.
  * Add utility for `scrollbar-none` or use Tailwind classes to hide scrollbars.

### C. Search Box
* **Desktop**: Fixed width `w-80` on the right side.
* **Mobile**: Full width `w-full` stacked below the category tab list.

### D. Article Card Grid
* Dynamic Tailwind grid columns: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`.
* Card text truncation and padding adjust dynamically:
  * Title: `line-clamp-2` text size `text-sm` or `text-base` for sm+.
  * Summary: `line-clamp-3` or hidden on portrait mobile to keep cards compact.

---

## 3. Blog Detail Page (`BlogDetail.tsx`) Layout Strategy

### A. Sticky Sidebar Constraints on Desktop
* Desktop 3-column grid layout uses `lg:grid-cols-12 items-start`.
* Left Sidebar (ToC & Share) uses `lg:col-span-3 lg:sticky lg:top-[160px]`.
* Right Sidebar (Trending) uses `lg:col-span-3 lg:sticky lg:top-[160px]`.
* Central article uses `lg:col-span-6`.
* *Insight*: `items-start` prevents stretching of sidebar heights, enabling `sticky` positioning.

### B. Stacking Behavior on Tablet/Mobile
When screen size is `< 1024px` (`lg`):
1. **Left Sidebar (ToC)**:
   * **Hidden on side**: `hidden lg:block`.
   * **Responsive alternative**: Render a collapsible accordion Table of Contents inside the article container, just below the article title or summary.
   * Toggle state: `const [isTocExpanded, setIsTocExpanded] = useState(false)`.
   * Accordion design: Smooth height transitions, header with a chevron icon, showing heading anchors list.
2. **Left Sidebar (Share)**:
   * Shifts to a horizontal row widget `BlogShare` rendered below the article content.
3. **Right Sidebar (Trending)**:
   * Shifts to the bottom of the page (below article and share buttons).

---

## 4. CSS Optimization Rules

To hide native scrollbars on the horizontal tabs while allowing swipe on iOS and Android:
```css
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```
This is added in the Tailwind config or local components.
