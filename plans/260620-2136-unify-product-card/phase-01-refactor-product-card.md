# Phase 01: Refactor ProductCard Component

## Context Links
- [ProductCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductCard.tsx)
- [ProductListing.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductListing.tsx)

## Overview
- **Priority**: High
- **Current Status**: Planning
- **Description**: Update `components/ProductCard.tsx` to match the premium theme styling, hover animations, theme variables, brand name, and support an optional "Mua ngay" button.

## Key Insights
- The current `ProductCard.tsx` has legacy styling using hardcoded green colors which mismatch the modern blue theme.
- `ProductListing.tsx` has the correct premium layout and styling, but it's hardcoded inline. We will transplant its visual properties (shimmer, gradient glow, borders, fonts) to `ProductCard.tsx`.

## Requirements
- Support brand display: Render `brand` uppercase on top of title (defaults to "KHÁC").
- Support hover effects: Implement animated gradient glow and sweeping light shimmer.
- Styling: Use theme CSS variables (`rgb(var(--color-primary))`, `rgb(var(--color-border))`, etc.).
- Optional "Mua ngay" button: Show both Cart icon + "Mua ngay" buttons only if `showBuyNow` prop is true. Otherwise, show only the Cart icon button.

## Related Code Files
- [MODIFY] [ProductCard.tsx](file:///c:/Users/Admin/Downloads/ccc/components/ProductCard.tsx)

## Implementation Steps
1. Update `ProductCardProps` in `components/ProductCard.tsx` to include `showBuyNow?: boolean`.
2. Replace legacy tailwind colors (`text-forest`, `border-forest/8`, etc.) with theme variable colors (`text-[rgb(var(--color-primary))]`, `border-[rgb(var(--color-border))]`, etc.).
3. Add animated gradient glow and sweeping light shimmer HTML elements with Tailwind classes matching the listing card.
4. Add brand rendering (`product.brand`) above the product title.
5. Update action buttons container: conditionally render the "Mua ngay" button depending on the `showBuyNow` prop.

## Todo List
- [ ] Add `showBuyNow` to `ProductCardProps`
- [ ] Update card wrapper and image section styling with hover animations
- [ ] Add brand display and adjust spacing
- [ ] Conditionally render action buttons

## Success Criteria
- Component compiles with no errors.
- Visual style matches the listing page cards.
