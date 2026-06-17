# Phase 2: ProductDetail Clean & Beautify

## Context Links
- [ProductDetail.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/ProductDetail.tsx)

## Overview
- Priority: High
- Status: Todo
- Description: Clean up fake hardcoded data in ProductDetail.tsx and make specifications table, tabs, benefits, and reviews dynamic.

## Implementation Steps
1. Render full description text: remove `slice(0, 18)` when mapping over `descriptionLines`.
2. Define a helper function `isFoodItem(category?: string)` to check if the product is food.
3. Conditionally display "Thành phần" and "Hướng dẫn cho ăn" tabs only if the product is food.
4. Replace the static tuna ingredients and guide with text templates that reference `product.name` and `product.brand`.
5. Update mock reviews to dynamically insert the product name and brand.
6. Make the specifications table show real brand, category, productType, petType, stock, and source values.
7. Hide the hardcoded "pet-benefits.webp" graphic section for non-food items.

## Todo List
- [ ] Remove line slicing from description rendering
- [ ] Implement isFoodItem conditional check
- [ ] Upgrade ingredients & guide tab fallbacks
- [ ] Interpolate name & brand into reviews
- [ ] Redesign specifications card with real API properties
- [ ] Make benefits section conditional

## Success Criteria
- Non-food items hide dietary info tabs and show correct specifications.
- Full description renders correctly.
