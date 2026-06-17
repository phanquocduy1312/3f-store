# Scout Report: Product Page Redesign & Real Data Analysis

- Date: 2026-06-17
- Slug: `improve-product-detail-ui`
- Type: `scout`

## Findings
We analyzed the Product Detail page (`ProductDetail.tsx`) and identified several opportunities for improvement.

### 1. Fake/Hardcoded Data
- **Specification Table**: Lists "Loại: Pate mèo ướt" and "Trọng lượng: 400g" for all products.
- **Description Tabs**:
  - Tab "Thành phần" lists tuna ingredients for all products.
  - Tab "Hướng dẫn cho ăn" is static.
  - Tab "Đánh giá" contains reviews referencing tuna pate even for dog kibbles.
- **Description lines**: Render is limited to the first 18 lines (`slice(0, 18)`).
- **Pet benefits banner**: Lists fish-related benefits with tuna icons, displayed globally.

### 2. Title Overflow in Related Products Grid
- The related products cards titles have standard line-clamp classes, but missing `-webkit-box` display or `overflow-hidden` constraints causes some long titles to expand to 3 lines.
- As a result, the text overlaps with the price container located below it.

### 3. Nested Interactive Tags
- In `ProductDetail.tsx`'s related products, "+ Thêm nhanh" is rendered as a `<button>` nested within a `<Link>`. This is invalid HTML5 and breaks event propagation and keyboard focus navigation in some browsers.

## Action Plan
- Map API parameters (`productType`, `petType`) through `mapApiProduct` and display them in the specifications.
- Redesign the detail page layout and make food tabs/benefits conditional.
- Implement dynamic reviews and descriptions.
- Rewrite related product card headers to enforce line clamp styling, and convert button tags to styled div items.
