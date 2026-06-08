# Phase 2: BigDeals Layout Fix & Product Filter Drawer

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260608-1112-upgrade-mobile-responsiveness.md)
- [Plan Overview](file:///c:/Users/Admin/Downloads/ccc/plans/260608-1112-upgrade-mobile-responsiveness/plan.md)

## Overview
- **Priority**: High
- **Current Status**: Pending
- **Description**: Redesign BigDeals overlay layout to support mobile without breaking, and create a filter drawer in ProductListing for mobile.

## Requirements
- **Functional**:
  - In `BigDealsSection`, on screen sizes smaller than `lg`, hide the frame background image. Instead, use a custom gradient card layout that places the content in a normal responsive flow.
  - In `ProductListing`, add a "Lọc sản phẩm" floating/sticky button on mobile that triggers a full screen filter panel/drawer.
  - Make sure users can select categories, brands, price, and weight inside this drawer and apply them.
- **Non-Functional**:
  - Clean layout, fully legible font sizes.
  - Uses Tailwind CSS breakpoint modifiers exclusively.

## Related Code Files
- [MODIFY] [BigDealsSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/BigDealsSection.tsx)
- [MODIFY] [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)

## Implementation Steps
1. In `components/BigDealsSection.tsx`, wrap the frame image and absolute content container. Introduce responsive classes to make it stacked without absolute overlays on mobile, while preserving the design on desktop.
2. In `components/ProductListing.tsx`, extract the sidebar contents or render them into a toggleable modal/drawer for mobile. Add a sticky filter button that appears only on mobile screens (`lg:hidden`).

## Todo List
- [ ] Refactor `BigDealsSection` responsive structure (avoid absolute frame breakdown on mobile)
- [ ] Add mobile filter drawer button to `ProductListing.tsx`
- [ ] Implement mobile filter drawer content & state

## Success Criteria
- BigDeals Swiper slides are fully clickable and visible on mobile.
- Product filter drawer opens, applies filters correctly, and closes on mobile screens.
