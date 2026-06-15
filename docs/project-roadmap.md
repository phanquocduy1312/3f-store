# Project Roadmap

## Phase 1: Core Pages & UI (Hoàn thành)
- [x] Khởi tạo dự án React + Vite + Tailwind.
- [x] Xây dựng trang chủ (Home) với Banner, Flash Sale, Category.
- [x] Nâng cấp UI/UX trang chủ lên cấp độ Pro Max (Bento Grid, Premium Dark Theme).
- [x] Xây dựng danh sách sản phẩm (Products).
- [x] Thiết kế UI Card sản phẩm sinh động (gradient, hover animation).
- [x] Trang Chi tiết Sản phẩm (PDP) - Xây dựng Layout chia 2 cột, gallery cuộn dính (sticky).

## Phase 2: Shopping Features (Hoàn thành)
- [x] Thêm tính năng Thêm vào giỏ hàng (Add to Cart).
- [x] Xây dựng giao diện Drawer/Modal Giỏ hàng.
- [x] Quản lý Global State cho Giỏ hàng.
- [x] Trang Thanh toán (Checkout Page) tích hợp VietQR và Form giao hàng.

## Phase 3: Mobile Responsive & Performance (Hoàn thành)
- [x] Tối ưu hiệu năng tải trang dưới 1 giây (WebP, Code Splitting, Suspense).
- [x] Nâng cấp toàn bộ responsive di động (hamburger drawer menu, grid 2 cột cho danh mục, sửa lỗi tràn layout BigDeals, drawer bộ lọc trên mobile).

## Phase 4: Backend Integration (Đang triển khai)
- [x] Xây dựng Backend API PHP thuần & database MySQL cho phân hệ tích điểm Shopee (3F Club Shopee Point Requests).
- [x] Thay thế dữ liệu Mock bằng dữ liệu thật qua API Fetching cho tính năng 3F Club Shopee Point Request.
- [x] Tích hợp Shopee Open Platform OAuth Sandbox (kết nối shop, đổi code lấy access/refresh token, tự động refresh, và lưu trữ an toàn trong database).
- [ ] Thiết lập Database hoàn chỉnh cho phần còn lại (Sản phẩm, Người dùng).
- [ ] Tích hợp thanh toán online (SePay / Stripe).

## Phase 5: User Authentication & Profile (Hoàn thành một phần)
- [x] Thiết kế giao diện Đăng ký/Đăng nhập (Email, Google Auth) kiểu Split-Screen.
- [x] Nâng cấp và triển khai Popup tư vấn dinh dưỡng AI đa bước (AI Pet Advisor Quiz) tự động hiện sau 7 giây, thu lead và cung cấp lời khuyên cá nhân hóa kèm voucher.
- [x] Thêm quy trình 4 bước (Flow Section) và nâng cấp form tích điểm Shopee cho 3F Club (hỗ trợ optional fields, validation, warning khi thiếu ảnh, và view thành công).
- [x] Xây dựng trang Admin Dashboard giao diện tại route `/admin` (bao gồm các biểu đồ thống kê SVG, danh sách lead tư vấn, yêu cầu tích điểm Shopee).
- [x] Xây dựng chức năng Tạo yêu cầu thủ công trong trang Quản lý Yêu cầu Shopee Admin.
- [ ] Trang quản lý tài khoản người dùng (Lịch sử đơn hàng, địa chỉ...).
