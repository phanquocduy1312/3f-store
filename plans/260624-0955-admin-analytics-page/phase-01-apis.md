# Phase 1: Xây dựng API Backend và Service Frontend

## Context Links
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- [adminDashboardApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/adminDashboardApi.ts)
- [researcher report](file:///c:/Users/Admin/Downloads/ccc/plans/reports/researcher-260624-0955-admin-analytics-page.md)

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Tạo Controller backend mới `AdminAnalyticsController.php` để tổng hợp số liệu kinh doanh, khách hàng, và tiếp thị từ CSDL thực tế. Xây dựng service client ở Frontend để gọi các APIs này.

## Key Insights
- Phải đảm bảo hiệu năng truy vấn SQL khi tổng hợp số liệu bằng cách dùng Index thích hợp và tối ưu mệnh đề JOIN.
- Dữ liệu nhu cầu dinh dưỡng/sức khỏe của thú cưng được lưu dưới dạng JSON trong trường `ai_result` của bảng `customer_pets`. Cần có code PHP parse JSON này động để trích xuất các keywords/detected_needs.

## Requirements
- Endpoint trả về dữ liệu doanh thu, số đơn, AOV lọc theo kỳ (today, 7_days, 30_days, this_month, this_year, all_time).
- Dữ liệu phễu đơn hàng (Order status funnel) chi tiết theo các trạng thái thực tế.
- Thống kê thú cưng: Pet type mix (chó/mèo/khác), Pet needs (Kén ăn, Tiêu hóa, Da lông...).
- Thống kê Loyalty: Points earned vs redeemed.
- Thống kê Marketing: Click/View/CTR của banner và Voucher usage.

## Architecture
- Controller: `App\Controllers\AdminAnalyticsController`
- Routing: Đăng ký các endpoints trong `3f-api/public/index.php`.
- Frontend Service: `src/api/adminAnalyticsApi.ts` sử dụng hàm fetchWithAuth có sẵn.

## Related Code Files
- [NEW] [AdminAnalyticsController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/AdminAnalyticsController.php)
- [NEW] [adminAnalyticsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/adminAnalyticsApi.ts)
- [MODIFY] [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Implementation Steps
1. **Tạo Controller Backend**: Tạo file `AdminAnalyticsController.php` chứa 4 hàm chính: `getOverviewStats()`, `getProductStats()`, `getCustomerStats()`, `getMarketingStats()`.
2. **Viết SQL Aggregation**:
   - `getOverviewStats`: Thống kê doanh số, đơn hàng, AOV, tỷ lệ hoàn trả, phễu đơn hàng, doanh số theo thời gian.
   - `getProductStats`: Thống kê doanh thu theo danh mục và top 5-10 sản phẩm bán chạy nhất.
   - `getCustomerStats`: Hạng thành viên từ `customer_loyalty_profiles`, tỉ lệ pet species từ `customer_pets`, parse JSON `ai_result` để thống kê các vấn đề sức khỏe của pet.
   - `getMarketingStats`: Banner clicks/views, coupon code usage.
3. **Đăng ký Routes**: Thêm các routes mới vào `index.php` dưới nhóm Admin.
4. **Tạo Frontend API Client**: Tạo file `src/api/adminAnalyticsApi.ts` định nghĩa các interfaces và các methods gọi API tương ứng.

## Todo List
- [ ] Tạo file `AdminAnalyticsController.php` và code logic lấy dữ liệu thật
- [ ] Đăng ký các routes mới trong `3f-api/public/index.php`
- [ ] Tạo file `src/api/adminAnalyticsApi.ts`
- [ ] Viết test nhanh API (kiểm tra status 200 và structure trả về)

## Success Criteria
- Các backend API chạy thành công, trả về JSON với format `{ success: true, data: { ... } }`.
- Thời gian response dưới 500ms cho mỗi request tổng hợp.
- Frontend API Client gọi đúng URL và map đúng các kiểu dữ liệu TypeScript.

## Risk Assessment
- Tác động hiệu năng: Nếu bảng `orders` hoặc `customer_pets` quá lớn, truy vấn sum/count có thể chậm.
- Khắc phục: Sử dụng các bảng phụ hoặc tối ưu index trên cột `created_at`, `order_status`.

## Security Considerations
- Yêu cầu quyền Admin: Tất cả routes phải sử dụng `AuthMiddleware::requireAdmin()`.

## Next Steps
- Thực hiện Phase 2 để dựng UI hiển thị các dữ liệu đã lấy được.
