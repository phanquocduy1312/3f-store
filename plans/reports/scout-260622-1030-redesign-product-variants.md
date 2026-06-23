# Scout Report: Redesign Product Variants & Inventory Tab

## File Discovery
- **Main Code File**: [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx) (approx. 1650 lines).
  - This file contains the entire form interface for creating and editing products in the admin panel.
  - The "Biến thể & Tồn kho" tab is rendered from line 938 to 1023.
  - The `VariantRow` helper component is rendered from line 1377 to 1565.
  - The `OptionSelect` helper component is rendered from line 208 to 254.

## Current Layout & Challenges
- **Layout**: Wide table with 9 columns (SKU, Tên biến thể, Phân loại 1, Phân loại 2, Giá bán, Giá gốc, Tồn kho, Bật, Xóa).
- **Usability**: Requires horizontal scrolling, cramped input boxes, validation messages are hard to associate with specific fields/rows, and no duplicate SKU checking.
- **Scroll Behavior**: Clicking sidebar validation warnings transitions to the tab but doesn't focus or scroll to the exact input element.

## Target Architecture
- **Cards View**: Replace table with individual card components for each variant.
- **Wording**: Rename prices to "Giá bán thực tế" and "Giá niêm yết / Giá trước khuyến mãi".
- **SKU UX**: Single-row and global SKU auto-generator. Duplicate SKU error flag.
- **Click to Scroll**: Map sidebar errors to target DOM IDs.
