# Phase 1: Header Mobile Drawer & Section Improvements

## Context Links
- [Scout Report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260608-1112-upgrade-mobile-responsiveness.md)
- [Plan Overview](file:///c:/Users/Admin/Downloads/ccc/plans/260608-1112-upgrade-mobile-responsiveness/plan.md)

## Overview
- **Priority**: High
- **Current Status**: Pending
- **Description**: Add full mobile hamburger drawer menu with category links in Header, change Category grid to 2 columns, optimize PetFood banners, and adjust Newsletter absolute images.

## Requirements
- **Functional**:
  - Clicking the mobile menu triggers a full height sidebar (drawer) displaying main navigation.
  - Categories within the menu display secondary items when expanded.
  - Category Section uses a grid of 2 columns on mobile.
  - Blog & Newsletter layout doesn't overlap text with absolute images.
- **Non-Functional**:
  - Keep responsive files under 200 lines if possible, or modularize components.
  - Apply clean exit/enter transitions with framer-motion.

## Related Code Files
- [MODIFY] [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
- [MODIFY] [CategorySection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/CategorySection.tsx)
- [MODIFY] [PetFoodSection.tsx](file:///c:/Users/Admin/Downloads/ccc/components/PetFoodSection.tsx)
- [MODIFY] [BlogNewsletter.tsx](file:///c:/Users/Admin/Downloads/ccc/components/BlogNewsletter.tsx)

## Implementation Steps
1. In `components/Header.tsx`, add a `isMobileMenuOpen` state. Put an `<AnimatePresence>` for the mobile navigation drawer.
2. In `components/CategorySection.tsx`, update the grid classes to `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` to avoid the single-column long vertical stack.
3. In `components/PetFoodSection.tsx`, scale down images inside the cat/dog banners on mobile, adjusting spacing and absolute classes.
4. In `components/BlogNewsletter.tsx`, reposition the absolute `dogandcat.webp` image on mobile so it doesn't overlap the registration inputs.

## Todo List
- [ ] Add mobile menu drawer to `Header.tsx`
- [ ] Upgrade Category grid to `grid-cols-2` on mobile in `CategorySection.tsx`
- [ ] Fix PetFood banners layout for mobile
- [ ] Reposition Newsletter banner graphics on mobile

## Success Criteria
- Compiles and runs locally without console errors.
- Navigation links function properly on mobile via hamburger menu.
- Visual elements do not overflow or overlap on phone dimensions.
