# Codebase Scouting Report - Sync Admin News UI

Scouted the news management section to identify UI and design inconsistencies compared to other premium admin pages (like Products and Orders).

## Files Discovered
- [AdminNewsPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsPage.tsx) - News list management page. Needs synchronization.
- [AdminNewsEditorPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminNewsEditorPage.tsx) - News editor page. Needs minor synchronization (e.g. background color).

## UI Discrepancies Identified
1. **Background Color**:
   - `AdminNewsPage.tsx`: Uses `bg-[#FAFAFA]`
   - `AdminNewsEditorPage.tsx`: Uses `bg-slate-50`
   - Other pages: Use `bg-[#F6FAFF]`
2. **Width & Padding**:
   - `AdminNewsPage.tsx`: Restrained to `max-w-6xl mx-auto p-6 md:p-8`
   - Other pages: Full width fluid layout with `px-4 sm:px-6 py-6`
3. **Typography**:
   - Title uses `text-xl font-bold text-slate-900` instead of `text-2xl font-black text-[#0B1F3A]`
   - Subtitle uses `text-slate-400 text-xs` instead of `text-xs sm:text-sm text-[#64748B]`
4. **Header Actions & Buttons**:
   - "Đồng bộ bài viết" and "Viết bài mới" style do not match products/orders style buttons (e.g., lack correct background, text-colors, padding, borders, shadows, hover animations).
5. **KPI Metrics Cards**:
   - Lack premium icons, rounded corners are smaller (`rounded-xl` instead of `rounded-[20px]`), border color is generic `border-slate-200` instead of `border-[#DCEBFF]`, shadow is generic `shadow-sm` instead of `shadow-[0_8px_24px_rgba(6,43,95,0.04)]`.
6. **Tabs & Filter Bars**:
   - Tab border is `border-slate-200` instead of `border-[#DCEBFF]`.
   - Tab font weight is not synced. Active tab border/text color is `border-slate-900` instead of `#0057E7`.
   - Category/Sort selects and Search input styling are generic instead of matching standard input classes (e.g., `rounded-xl`, focus styles, input text color `text-[#0B1F3A]`).
7. **Table Card & Contents**:
   - Card wrapper uses `rounded-xl border-slate-200 shadow-sm` instead of `rounded-2xl border-[#DCEBFF] shadow-[0_10px_35px_rgba(6,43,95,0.04)]`.
   - Table header uses `text-slate-400 bg-slate-50/70 text-[10px]` instead of `text-slate-400 bg-slate-50/75 border-[#DCEBFF] text-xs font-black`.
   - Category badge should use the premium blue style (`bg-blue-50 text-blue-700 font-black border-blue-100`).
   - Action dropdown trigger button should match products page action edit button style (solid bordered circular/square button `h-8 w-8 hover:bg-[#EEF6FF] hover:text-[#0057E7]`).
   - Pagination button styles need color updates (active is `bg-[#0057E7]` instead of `bg-slate-900`).
8. **Footer**:
   - Missing the copyright footer at the bottom of the news list page.
