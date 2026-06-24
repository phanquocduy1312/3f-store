# Researcher Report: Admin Analytics Page System
Date: 2026-06-24
Task: Nâng cấp trang Báo cáo / Phân tích dữ liệu vận hành & kinh doanh Admin (dữ liệu thật)

## 1. Mục tiêu & Nghiệp vụ
Trang phân tích (Analytics) dành cho quản trị viên 3F Store cần phản ánh đúng các số liệu nghiệp vụ thực tế của cửa hàng thú cưng tích hợp AI và Loyalty:
- **Doanh thu & Đơn hàng (Sales & Orders)**: Tổng doanh số, Số đơn hàng, Giá trị trung bình đơn (AOV), Tỷ lệ hoàn/hủy đơn, Phễu trạng thái đơn hàng (Funnel).
- **Phân khúc Khách hàng & Thành viên (Customers & Loyalty)**: Phân bố hạng thành viên (Member, Silver, Gold, Diamond), Tỷ lệ tích/tiêu điểm Loyalty (Earned vs Redeemed Points), Số lượng khách hàng mới.
- **Sản phẩm & Danh mục (Products & Categories)**: Top sản phẩm bán chạy nhất, Cơ cấu doanh thu theo danh mục sản phẩm (Top Categories Chart).
- **Hành vi & Nhu cầu Thú cưng (Pet & AI Insights)**: Tỷ lệ loài thú cưng nuôi (Chó, Mèo, Khác), Thống kê các nhu cầu dinh dưỡng/sức khỏe được phát hiện nhiều nhất qua AI Pet Advisor (Kén ăn, Tiêu hóa, Da lông, Tiết niệu...).
- **Chiến dịch & Voucher (Marketing)**: Hiệu suất click/view của Banner, Tỷ lệ sử dụng mã Voucher.

## 2. Thiết kế Cơ sở Dữ liệu & APIs
Hệ thống sẽ sử dụng dữ liệu thực tế từ các bảng MySQL hiện tại:
- `orders` & `order_items` -> Phân tích doanh số, đơn hàng, AOV, top sản phẩm, top categories.
- `customer_loyalty_profiles` & `loyalty_point_transactions` -> Thống kê hạng thành viên, điểm Loyalty.
- `customer_pets` -> Thống kê pet type mix và phân tích nhu cầu sức khỏe pet từ cột `ai_result` chứa dữ liệu JSON từ Groq.
- `banners` -> Thống kê lượt clicks/impressions.
- `coupons` & `coupon_usages` -> Phân tích hiệu suất Voucher.

Chúng ta sẽ tạo Controller mới `AdminAnalyticsController.php` để xử lý các truy vấn tổng hợp hiệu năng cao (Aggregations) và trả về dữ liệu chuẩn cho Frontend biểu diễn.

### Danh sách API mới:
1. `GET /api/admin/analytics/overview?filter=...` -> Trả về KPI tổng quan (Doanh số, đơn hàng, AOV, tỷ lệ hủy), dữ liệu doanh số theo thời gian và phễu đơn hàng.
2. `GET /api/admin/analytics/products?filter=...` -> Doanh thu theo danh mục và danh sách top sản phẩm bán chạy.
3. `GET /api/admin/analytics/customers` -> Thống kê hạng thành viên, cơ cấu thú cưng (species) và biểu đồ các vấn đề sức khỏe/nhu cầu của thú cưng từ AI Advisor.
4. `GET /api/admin/analytics/marketing` -> Hiệu suất Banner (Clicks, Views, CTR) và thống kê sử dụng Voucher.

## 3. Lựa chọn Thư viện & Công nghệ
- **Thư viện biểu đồ**: Sử dụng `recharts` (đã có sẵn trong `package.json`). Đây là thư viện biểu đồ React mạnh mẽ, hỗ trợ responsive tốt và dễ tùy chỉnh style.
- **UI Components**: Tích hợp với hệ thống component admin hiện tại (Tailwind CSS, Lucide React).
- **Aesthetics (Visuals)**:
  - Thiết kế Bento Grid phân chia các khu vực báo cáo rõ ràng.
  - Phối màu gradient mượt mà (xanh dương đậm #082B5F, xanh dương sáng #0057E7, vàng ấm, tím hoàng gia cho Diamond...).
  - Thêm loading skeletons, bộ lọc ngày linh hoạt, empty states tinh gọn.

## 4. Kế hoạch Tích hợp Frontend
- Tạo `src/pages/admin/AdminAnalyticsPage.tsx` làm trang hiển thị chính.
- Tạo `src/api/adminAnalyticsApi.ts` để quản lý các request lấy dữ liệu báo cáo từ backend.
- Cập nhật Sidebar (`components/admin/admin-sidebar.tsx`) để trỏ mục "Báo cáo" vào route `/admin/analytics`.
- Khai báo route mới trong `src/App.tsx`.
