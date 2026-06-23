# Phase 01: Redesign Voucher Pagination

## Context Links
- [AdminVouchersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminVouchersPage.tsx)

## Overview
- **Priority**: Medium
- **Current Status**: In Progress
- **Description**: Redesign the simple pagination component in the voucher admin interface to a premium, modern design with numbered buttons, page grouping/dots, hover transitions, and clean sizing options.

## Key Insights
- The current pagination only displays "Trang 1/1" text and a simple select dropdown for page size.
- A modern numbered pagination system is more user-friendly and visually appealing.
- Needs to support smart truncation when the total number of pages is large.

## Requirements
- Display clickable page number buttons (e.g., `1 2 3 ... 10`).
- Implement active state with a bright blue background, white text, and a soft shadow effect.
- Implement hover states for inactive pages.
- Place items per page selection selector cleanly inline.
- Maintain existing state and query parameter logic (`page`, `perPage`).

## Architecture
- Simple client-side rendering inside `AdminVouchersPage` using local React state (`page`, `perPage`, `meta`).

## Related Code Files
- [MODIFY] [AdminVouchersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminVouchersPage.tsx)

## Implementation Steps
1. Add `getPageNumbers` helper function to determine page button list based on current page and total pages.
2. Replace current pagination HTML section at the bottom of the voucher list container.
3. Apply styling conforming to modern Tailwind UI/shadcn aesthetics:
   - Clean spacing and separators.
   - Elegant button states (active, hover, focus, disabled).
4. Verify by running the application and checking layout responsiveness.

## Todo List
- [ ] Implement `getPageNumbers` logic in `AdminVouchersPage.tsx`
- [ ] Replace pagination JSX block at the bottom of the table
- [ ] Verify functionality and styling

## Success Criteria
- Pagination displays numbered buttons representing the page list.
- Selecting a page updates the state and correctly filters the vouchers.
- Layout is responsive and has premium styling with smooth transitions.

## Risk Assessment
- Small risk of showing broken page numbering if `meta.totalPages` is 0 or NaN. Covered by checking `meta.total === 0` and standard `Math.max(1, ...)` boundaries.

## Security Considerations
- Client-side pagination variables are checked and coerced. No direct security risks.

## Next Steps
- Implement code edits in `AdminVouchersPage.tsx`.
