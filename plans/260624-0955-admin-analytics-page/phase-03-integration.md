# Phase 3: Tích hợp Sidebar Navigation & Kiểm thử Hệ thống

## Context Links
- [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Overview
- **Priority**: Medium
- **Status**: Pending
- **Description**: Tích hợp trang báo cáo/phân tích vào hệ thống điều hướng sidebar của admin, đăng ký route trong React Router, biên dịch kiểm tra lỗi và nghiệm thu.

## Key Insights
- Phải cập nhật `admin-sidebar.tsx` để menu "Báo cáo" dẫn đến route `/admin/analytics`.
- Cần khai báo route `/admin/analytics` trong `App.tsx` dưới `AdminRouteGuard`.

## Requirements
- Click vào menu "Báo cáo" trong sidebar của admin sẽ mở trang phân tích `/admin/analytics`.
- Menu sidebar sáng lên tương ứng khi đang ở trang Analytics.
- Toàn bộ codebase build thành công không lỗi biên dịch TypeScript.

## Related Code Files
- [MODIFY] [admin-sidebar.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-sidebar.tsx)
- [MODIFY] [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)

## Implementation Steps
1. **Đăng ký route**: Import `AdminAnalyticsPage` (dùng lazy-loading qua `lazyPage`) vào `src/App.tsx` và thêm route tương ứng dưới `AdminRouteGuard`.
2. **Cập nhật Sidebar Menu**: Cập nhật file `admin-sidebar.tsx`, gán thuộc tính `path: "/admin/analytics"` cho mục menu "Báo cáo". Sửa logic active để check đúng router.
3. **Compile & Build**: Run lệnh compile TypeScript hoặc `npm run build` để kiểm tra lỗi cú pháp, kiểu dữ liệu (TypeScript compiler checks).
4. **Kiểm thử thủ công (Manual Verification)**: Đăng nhập quyền Admin, click vào "Báo cáo" trong Sidebar, chuyển đổi qua lại giữa các tab, kiểm tra độ tương tác của các biểu đồ Recharts và tính chính xác của dữ liệu.

## Todo List
- [ ] Khai báo route `/admin/analytics` trong `src/App.tsx`
- [ ] Cập nhật path cho menu "Báo cáo" trong `admin-sidebar.tsx`
- [ ] Run compile check để kiểm tra toàn bộ ứng dụng
- [ ] Kiểm thử thủ công hiển thị biểu đồ và tương tác các bộ lọc

## Success Criteria
- Navigation hoạt động chuẩn, nhấn "Báo cáo" hiển thị trang Analytics.
- Dữ liệu hiển thị đồng bộ giữa các tab và bộ lọc kỳ báo cáo.
- Không phát sinh bất kỳ lỗi biên dịch tsc hay lỗi runtime console nào.

## Risk Assessment
- Lỗi compile React: Do React 19 và kiểu dữ liệu Recharts có thể cần ép kiểu chính xác.
- Khắc phục: Sử dụng strict types hoặc type assertions (`as any` khi thực sự cần thiết) để vượt qua strict check của Recharts nếu có xung đột kiểu React 19.
