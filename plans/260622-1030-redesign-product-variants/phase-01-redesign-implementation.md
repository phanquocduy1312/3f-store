# Phase 01: Redesign Product Variants & Inventory Tab Implementation

## Context Links
- Scout report: [scout-260622-1030-redesign-product-variants.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260622-1030-redesign-product-variants.md)
- Target file: [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Redesign the variants creation layout from table rows to individual cards. Enhance pricing fields, add inline error highlights, perform duplicate SKU verification, and scroll target inputs from the sidebar.

## Key Insights
- Currently, inputs lack descriptive IDs, making scrolling to validation errors impossible. Adding unique DOM IDs allows target scroll behavior.
- Hiding classification selectors when both options are empty supports single-variant/classification-free products cleanly.

## Requirements
- Replace the wide table with card-based layouts.
- Header row per variant shows: "Biến thể #X" (or "Biến thể mặc định"), variant display name, SKU badge, status badge, toggle, and delete button.
- Pricing label renames & validation (`Giá bán thực tế > 0`, original price optional but `>=` actual price).
- Alert icon with notice: "Chưa có ảnh. Khách hàng sẽ thấy ảnh mặc định nếu bạn không thêm ảnh." (Warning only, does not block saving).
- Clicking errors in the validation sidebar shifts tab focus and scrolls directly to input fields.

## Architecture
- React layout updates in the `variants` tab render path.
- State checks: `hasClassification` dynamically shows/hides `OptionSelect` fields.
- Interactive scrolling via helper handlers targeting DOM node IDs.

## Related Code Files
- [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx)

## Implementation Steps
1. **Initialize Default Variant**: If `variants` is empty, auto-populate with a single default variant.
2. **Update Validation Logic**: Adjust text validation error formats, add duplicate SKU checking, update the image warning message.
3. **Refactor Variant Layout to Cards**: Use a responsive grid with cards.
4. **Implement Field Renaming & Input IDs**: Assign unique HTML `id`s to input components.
5. **Implement Scroll Handler**: Add click listener to validation sidebar items to smooth-scroll and focus target elements.

## Todo List
- [ ] Initialize default variant when form variants list is empty
- [ ] Implement duplicate SKU check in validation issues list
- [ ] Update warning for missing images to "Chưa có ảnh. Khách hàng sẽ thấy ảnh mặc định nếu bạn không thêm ảnh."
- [ ] Add unique DOM IDs on variant card inputs (SKU, price, original price, stock)
- [ ] Build card-based variant rendering loop
- [ ] Implement individual and global SKU generation functionality
- [ ] Connect sidebar validation error items to scroll-into-view helper function
- [ ] Compile and verify using TypeScript & build verification

## Success Criteria
- Validations block saving only when errors exist. Warnings (like missing images) do not disable saving.
- Smooth scroll redirects user to targeted variant inputs on clicking sidebar errors.
- Visual display matches design specifications on mobile and desktop viewports.

## Risk Assessment
- Auto-scroll might trigger before tab transition completes. We will add a small delay (`setTimeout`) to guarantee the tab content is fully mounted/rendered before scrolling.

## Security Considerations
- Ensure input names and validation inputs are sanitized to avoid unexpected input errors.

## Next Steps
- Validate changes via `npm run build`.
