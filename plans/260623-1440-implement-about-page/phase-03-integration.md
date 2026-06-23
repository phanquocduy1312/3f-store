# Phase 3: Integration and Navigation

## Context Links
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx)
- [Footer.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Footer.tsx)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Add routes for `/about` and `/gioi-thieu` and connect links in Header and Footer.

## Requirements
- Support `/about` and alias `/gioi-thieu`.
- Map Header's "Về chúng tôi" menu option to `/about`.
- Map Footer's "Giới thiệu" and "Liên hệ" options to appropriate relative links.

## Implementation Steps
1. Import `AboutPage` in [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) lazily.
2. Register `/about` and `/gioi-thieu` in client router.
3. Edit `navigationData` in [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx) to point to `/about` instead of `#`.
4. Update link rendering in [Footer.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Footer.tsx) to point to `/about` when clicking "Giới thiệu" or "Liên hệ" instead of `#`.

## Todo List
- [ ] Add routes in `App.tsx`
- [ ] Connect Header navigation data
- [ ] Connect Footer links
- [ ] Update mobile navigation drawer links

## Success Criteria
- Navigation is fluid, with no broken links or page reloads.
