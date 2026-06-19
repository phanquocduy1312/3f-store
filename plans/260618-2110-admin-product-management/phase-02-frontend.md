# Phase 02: Frontend Integration

## Context Links
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

## Overview
- **Priority**: High
- **Status**: Completed
- **Description**: Add routing, sidebar navigation, client API queries, and construct the beautiful, responsive Admin Product List and tabbed Product Form.

## Key Insights
- Giao diện Admin Product Form phải chia thành các tab rõ ràng để tránh quá tải thông tin trên một trang cuộn dài.
- Cảnh báo người dùng khi họ cố gắng xóa biến thể đã có lịch sử đặt hàng: biến thể sẽ chỉ bị ẩn (inactive) chứ không xóa khỏi Database.

## Requirements
- Add `/admin/products`, `/admin/products/create`, and `/admin/products/:id` pages.
- Add "Sản phẩm" to sidebar.
- Admin Product List UI showing: image, name, category, petType, productType, price range, variant count, total stock, sold count, active status, updated at, and actions.
- List Filters: search (name/brand/SKU), category, petType, productType, active/inactive, stock status.
- Admin Product Form UI: tabbed sections (General, Category, Variants, Images, Display settings).
- Variant editor: inline validation, delete vs disable check.
- Image manager: add URL, main/gallery preview, order sorting, primary selection.

## Related Code Files
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx) (Modify)
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx) (Modify)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts) (Modify)
- `src/pages/admin/AdminProductsPage.tsx` (New)
- `src/pages/admin/AdminProductForm.tsx` (New)

## Implementation Steps
1. **API Integration**:
   - Write API methods in `productsApi.ts`.
2. **Navigation & Routes**:
   - Add path `/admin/products` to sidebar configuration.
   - Add routes in `App.tsx` mapped to components.
3. **List Page**:
   - Build `AdminProductsPage.tsx` with high-quality styling.
   - Add custom search/filter controls.
   - Show table grid with actions: edit, toggle status.
4. **Form Editor Page**:
   - Build `AdminProductForm.tsx` with tabs:
     - General Info
     - Categorization & SEO
     - Variants & Stock (table-based inline editor)
     - Image Management (main & gallery URL-based cards)
     - Display Options (isActive, isFeatured)
   - Implement client-side validations.

## Todo List
- [x] Add sidebar navigation item
- [x] Integrate API methods in `productsApi.ts`
- [x] Create routing paths in `App.tsx`
- [x] Build `AdminProductsPage.tsx`
- [x] Build `AdminProductForm.tsx`

## Success Criteria
- Navigation redirects users correctly.
- Admin list displays all columns and filters effectively.
- Product Form operates on tabbed navigation smoothly.
- In-line variants validations block incorrect inputs.
