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
- [x] Triển khai Quick Add To Cart Modal cho product card ngoài trang chủ và trang danh mục.
- [x] Triển khai tính năng tìm kiếm sản phẩm realtime gợi ý dropdown dưới thanh search header và query parameter search mapping trên trang danh mục.

## Phase 3: Mobile Responsive & Performance (Hoàn thành)
- [x] Tối ưu hiệu năng tải trang dưới 1 giây (WebP, Code Splitting, Suspense).
- [x] Nâng cấp toàn bộ responsive di động (hamburger drawer menu, grid 2 cột cho danh mục, sửa lỗi tràn layout BigDeals, drawer bộ lọc trên mobile).

## Phase 4: Backend Integration (Hoàn thành)
- [x] Xây dựng Backend API PHP thuần & database MySQL cho phân hệ tích điểm Shopee (3F Club Shopee Point Requests).
- [x] Thay thế dữ liệu Mock bằng dữ liệu thật qua API Fetching cho tính năng 3F Club Shopee Point Request.
- [x] Tích hợp Shopee Open Platform OAuth Sandbox (kết nối shop, đổi code lấy access/refresh token, tự động refresh, và lưu trữ an toàn trong database).
- [x] Tích hợp tính năng đối chiếu đơn Shopee (order verification) đơn lẻ và hàng loạt qua Shopee Sandbox API, cập nhật verification_status.
- [x] Sửa lỗi UI, logic hiển thị actions và đồng bộ thống kê trang Admin Shopee Requests.
- [x] Xây dựng script deploy PHP backend qua FTP (scripts/deploy_ftp.py) và tài liệu hướng dẫn (docs/deploy-ftp-python.md) thay thế CI/CD khi GitHub Actions và SSH bị khóa.
- [x] Thiết lập Database và API hoàn chỉnh cho Sản phẩm (Di chuyển thành công 113 sản phẩm + 910 variants từ products.json sang MySQL).
- [x] Triển khai Database và API cho Khách hàng, Địa chỉ và Đơn hàng (`orders`, `order_items`, `order_status_logs`, `order_payment_proofs`).
- [x] Triển khai cơ chế Reserve, Release và Fulfill tồn kho atomically sử dụng transaction lock (`FOR UPDATE`).
- [x] Tích hợp tích lũy điểm 3F Club tự động cho đơn hàng web khi trạng thái đơn hàng chuyển sang `completed`.
- [ ] Tích hợp thanh toán online (SePay / Stripe).

## Phase 5: User Authentication & Profile (Hoàn thành một phần)
- [x] Thiết kế giao diện Đăng ký/Đăng nhập (Email, Google Auth) kiểu Split-Screen.
- [x] Nâng cấp và triển khai Popup tư vấn dinh dưỡng AI đa bước (AI Pet Advisor Quiz) tự động hiện sau 7 giây, thu lead và cung cấp lời khuyên cá nhân hóa kèm voucher.
- [x] Thêm quy trình 4 bước (Flow Section) và nâng cấp form tích điểm Shopee cho 3F Club (hỗ trợ optional fields, validation, warning khi thiếu ảnh, và view thành công).
- [x] Xây dựng trang Admin Dashboard giao diện tại route `/admin` (bao gồm các biểu đồ thống kê SVG, danh sách lead tư vấn, yêu cầu tích điểm Shopee).
- [x] Xây dựng chức năng Tạo yêu cầu thủ công trong trang Quản lý Yêu cầu Shopee Admin.
- [x] Xây dựng phân hệ Cấu hình Quy tắc Tích điểm (Loyalty Point Rules) trong Backend và Admin Settings Page.
- [x] Gom các trang quản trị 3F Club thành một trang duy nhất dạng tab tại `/admin/3f-club`.
- [x] Triển khai phân hệ Quà đổi điểm (Loyalty Rewards Catalog), Yêu cầu đổi quà (Redemptions), và Lịch sử điểm (Transactions) ở Backend và Admin Frontend.
- [x] Xây dựng trang đổi quà tích điểm cho khách hàng (Customer Rewards Page) tại route `/3f-club/rewards`.
- [x] Xây dựng trang Thành công Đơn hàng (Order Success) hỗ trợ tạo mã VietQR thanh toán nhanh chuyển khoản.
- [x] Xây dựng trang Theo dõi đơn hàng (Order Tracking) trực quan hiển thị timeline trạng thái đơn hàng và lịch sử điểm thưởng.
- [x] Xây dựng trang quản lý đơn hàng Admin (`/admin/orders`) hỗ trợ chuyển đổi trạng thái tuần tự theo quy trình 3F Store, thống kê nhanh qua summary cards, lọc theo ngày và hiển thị địa chỉ chi tiết không bị cắt xén.
- [x] Triển khai tính năng Sản phẩm yêu thích (Wishlist) cho cả Guest (localStorage) và Member (CSDL), tự động đồng bộ khi đăng ký/đăng nhập thành công.
- [x] Tinh chỉnh Dashboard Admin (bỏ tỷ lệ chuyển đổi/giá trị đơn trung bình/đơn hoàn tất/sản phẩm sắp hết hàng, gom 6 thống kê còn lại lên cùng 1 hàng; loại bỏ biểu đồ nguồn đơn hàng và danh sách lead tư vấn để tối ưu hóa bố cục hàng dưới; sửa chính tả có dấu tiếng Việt cho component Top sản phẩm bán chạy) và trang Khách hàng (loại bỏ nút Xuất CSV).
- [x] Kết nối dữ liệu thời gian thực cho Admin Dashboard (6 KPI cards, Task Queue, biểu đồ doanh thu SVG động hỗ trợ bộ lọc 7/30 ngày và hộp tổng kết tính toán từ kỳ thực tế).
- [ ] Trang quản lý tài khoản người dùng (Lịch sử đơn hàng, địa chỉ...).

