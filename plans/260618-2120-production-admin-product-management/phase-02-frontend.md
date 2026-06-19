# Phase 02: Frontend Polish & Validation

## Context Links
- [AdminProductsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductsPage.tsx)
- [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Proposed Changes

### [frontend]

#### [MODIFY] [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)
- Add `stats` schema/interface to `ProductListResponse` and `ApiProductVariant`.
- Update `ApiProductVariant` to include `hasOrderHistory?: boolean;`.

#### [MODIFY] [AdminProductsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductsPage.tsx)
- Replace the sales stats cards with 3 distinct KPI cards:
  - **Tổng sản phẩm** (`totalProducts`)
  - **Đang hiển thị** (`activeProducts`)
  - **Hết hàng / sắp hết** (`outOfStockProducts` + `lowStockProducts`)
- Update layout to show page details in smaller text below/above the table (e.g. "Đang hiển thị X-Y trong Z sản phẩm").
- Modify Table Columns:
  - Add copying capability for Slug.
  - Limit long product names to max 2 lines with a tooltip.
  - Format prices as VN format (`294.756đ`), range when min != max.
  - Show stock badge: "Còn hàng", "Sắp hết", "Hết hàng".
  - Show stock quantity + variant count (e.g. "16 tồn / 3 biến thể").

#### [MODIFY] [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx)
- **Tabs - Basic Info**:
  - Add text preview section showing sanitized HTML rendering of `description` using `dompurify`.
  - Display `shortDescription` in a simple plain text small textarea (converting `<br>` on load to newline, strip HTML, submit plain text).
- **Tabs - Taxonomy & SEO**:
  - Add "Tạo lại slug từ tên" button. Generate clean slugs (strip emoji/diacritics/accents) automatically. Avoid overwriting existing custom slug unless requested.
- **Tabs - Variants & Stock**:
  - Adjust SKU column width and prevent truncate.
  - Add copy icon for SKU.
  - Use hover tooltips for variant name and SKU.
  - Introduce option presets dropdown (Quy cách, Khối lượng, Hương vị, Combo, Size, Màu sắc, Khác) + Custom option.
  - Block hard deletion of variants that have `hasOrderHistory === true`. Render an "Ẩn biến thể" switch/toggle instead of a trash icon, with tooltip explanation.
- **Tabs - Images**:
  - Add altText editing button, sort order inputs, clear Delete and Primary action buttons with confirmations.
  - Re-design URL image inputs: validate format, auto-set first image as primary.
- **Tabs - Display settings**:
  - Update descriptions for "Active" and "Featured" options to match 3F Store guidelines.
- **Unsaved Changes Panel**:
  - Display Mode (New vs Update), Variant count, Image count, Validation Status.
  - Block submission if validation errors exist (e.g. `originalPrice < price`). Show inline warnings.
  - Block navigation / cancel action if unsaved modifications exist, show confirmation dialog. Add browser `beforeunload` listener.
