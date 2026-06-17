# Phase 3: Related Products Fix

## Context Links
- [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)

## Overview
- Priority: High
- Status: Todo
- Description: Resolve text line clamping/overlapping issues and nested interactive elements in the related products section.

## Implementation Steps
1. Add `overflow-hidden` and explicit `-webkit-box` style parameters to clamp titles at exactly 2 lines.
2. Replace the HTML `<button>` inside `<Link>` with a styled `div` cursor-pointer element.
3. Configure the `onClick` event on the "+ Thêm nhanh" element to dispatch the standard `open-quick-add` event (or add directly to cart if single-variant) and stop propagation to prevent navigation.

## Todo List
- [ ] Add line-clamp overrides to title
- [ ] Convert button into a div container
- [ ] Wire onClick event handler to trigger quick-add / add-to-cart

## Success Criteria
- Related product titles wrap cleanly up to 2 lines without overlapping the price.
- Clicking "+ Thêm nhanh" triggers purchase/selection instead of navigation.
