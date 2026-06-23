# Phase 2: Hide Stock and Filter Empty Specification Groups & Coerce Options

## Context Links
- Quick Add Modal: [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx)
- Product Detail Page: [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- Products API: [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- **Priority**: High
- **Current Status**: In Progress
- **Description**: Remove frontend stock displays and disable stock checks to prevent options from being disabled when variants have 0 stock. Filter out empty option groups like "THÔNG SỐ" when variants do not define values for them. Coerce variant option values to strings to prevent string-to-number type mismatch during selection matching.

## Requirements
### Functional
- Do not display "Kho hàng" or "Tồn kho" count text on frontend.
- Do not disable variant options or buy buttons based on stock levels.
- Hide specification/option groups that have no variant option values.
- Allow selection of option values even if they are numeric (coerce to string during comparisons).

## Related Code Files
- [MODIFY] [QuickAddToCartModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/QuickAddToCartModal.tsx)
- [MODIFY] [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)
- [MODIFY] [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Todo List
- [ ] Filter `options` in `QuickAddToCartModal.tsx` to exclude groups without variant values
- [ ] Coerce option values to string in `QuickAddToCartModal.tsx`'s `isOptionValueDisabled` and `getSelectedVariant`
- [ ] Remove stock check in `isOptionValueDisabled` in `QuickAddToCartModal.tsx`
- [ ] Set `isOutOfStock` to `false` in `QuickAddToCartModal.tsx` and `ProductDetail.tsx`
- [ ] Remove stock text display from `QuickAddToCartModal.tsx` and `ProductDetail.tsx`
- [ ] Adjust quantity limits in `QuickAddToCartModal.tsx` to default max of 99
- [ ] Coerce `option1Value`, `option2Value`, `option3Value` to string in `productsApi.ts`'s `mapApiProduct`
- [ ] Verify compilation using `npx tsc --noEmit`

## Success Criteria
- Empty option groups (like "THÔNG SỐ") are hidden.
- Option values are clickable and not falsely disabled due to type mismatches.
- No stock info text is displayed.
- Zero TypeScript compile errors.
