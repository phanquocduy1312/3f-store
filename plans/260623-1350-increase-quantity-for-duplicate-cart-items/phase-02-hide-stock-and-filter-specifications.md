# Phase 2: Hide Stock and Filter Empty Specification Groups & Coerce Options

## Context Links
- Quick Add Modal: [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx)
- Product Detail Page: [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- Products API: [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Remove frontend stock displays and disable stock checks to prevent options from being disabled when variants have 0 stock. Filter out empty option groups like "THÔNG SỐ" when variants do not define values for them. Coerce variant option values to strings to prevent string-to-number type mismatch during selection matching. Dynamically hide option groups if all their values are disabled under the current selection (not applicable), and ensure selection validation only checks applicable option groups.

## Requirements
### Functional
- Do not display "Kho hàng" or "Tồn kho" count text on frontend.
- Do not disable variant options or buy buttons based on stock levels.
- Hide specification/option groups that have no variant option values.
- Allow selection of option values even if they are numeric (coerce to string during comparisons).
- Dynamically hide option groups if all of their option values are disabled for the current selection.
- Update variant matching and checkout validation to ignore option groups that are not applicable (hidden).

## Related Code Files
- [MODIFY] [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx)
- [MODIFY] [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- [MODIFY] [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Todo List
- [x] Filter `options` in `QuickAddToCartModal.tsx` to exclude groups without variant values
- [x] Coerce option values to string in `QuickAddToCartModal.tsx`'s `isOptionValueDisabled` and `getSelectedVariant`
- [x] Remove stock check in `isOptionValueDisabled` in `QuickAddToCartModal.tsx`
- [x] Set `isOutOfStock` to `false` in `QuickAddToCartModal.tsx` and `ProductDetail.tsx`
- [x] Remove stock text display from `QuickAddToCartModal.tsx` and `ProductDetail.tsx`
- [x] Adjust quantity limits in `QuickAddToCartModal.tsx` to default max of 99
- [x] Coerce `option1Value`, `option2Value`, `option3Value` to string in `productsApi.ts`'s `mapApiProduct`
- [/] Dynamically compute and hide non-applicable option groups in `QuickAddToCartModal.tsx`
- [/] Update variant selection validation to only check applicable option groups in `QuickAddToCartModal.tsx`
- [ ] Verify compilation using `npx tsc --noEmit`

## Success Criteria
- Empty option groups (like "THÔNG SỐ") are hidden.
- Option groups where all values are disabled under the current selection are hidden.
- Validation allows ordering once all visible (applicable) option groups are selected.
- Option values are clickable and not falsely disabled due to type mismatches.
- No stock info text is displayed.
- Zero TypeScript compile errors.

