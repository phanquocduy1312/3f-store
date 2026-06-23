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
- [x] Thiết kế lại Giao diện Biến thể & Tồn kho phía Admin sang dạng thẻ (Variant Cards) tiện dụng, hỗ trợ co giãn responsive, cuộn mượt nhảy nhanh đến trường lỗi, kiểm tra SKU trùng lặp và cảnh báo thiếu ảnh không chặn lưu.
- [x] Triển khai Database và API cho Khách hàng, Địa chỉ và Đơn hàng (`orders`, `order_items`, `order_status_logs`, `order_payment_proofs`).
- [x] Triển khai cơ chế Reserve, Release và Fulfill tồn kho atomically sử dụng transaction lock (`FOR UPDATE`).
- [x] Tích hợp tích lũy điểm 3F Club tự động cho đơn hàng web khi trạng thái đơn hàng chuyển sang `completed`.
- [x] Triển khai hệ thống Quản lý Quy trình & Trạng thái đơn hàng đa chiều nâng cấp (CRM + Loyalty + Automation-ready) bao gồm 4 chiều độc lập (Order, Payment, Shipping, Loyalty) được cấu hình động từ database.
- [x] Đánh bóng và tăng cường bảo mật cho các Modal cấu hình trạng thái và bước chuyển đơn hàng (Admin Orders Modal Hardening).
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
- [x] Triển khai hệ thống Quản lý Banner động chuyên nghiệp (database, API CRUD, Admin UI quản lý chiến dịch/lịch chạy/analytics click & views, client homepage integration với Swiper slider & promo cards fallback tự động).
- [x] Triển khai hệ thống cào tin tức tự động từ 3fstore.vn/tin-tuc và tích hợp Blog/Tin tức động (database, API, trang tin tức chi tiết rich-text HTML và tích hợp trang chủ).
- [x] Triển khai hệ thống Tin tức chuyên nghiệp đầy đủ nghiệp vụ SEO và trang tin tức làm đẹp (SEO Metadata injector, structured JSON-LD data, Table of Contents, sharing bar, related products slider, circular scroll-to-top, và Admin News Operations Page).
- [x] Đồng bộ hóa giao diện trang quản lý Tin tức Admin (Admin News UI Synchronization) và trang soạn thảo tin tức theo tiêu chuẩn thiết kế premium đồng bộ của hệ thống quản trị 3F Store.
- [x] Triển khai hệ thống xác thực OTP đa nhà cung cấp sử dụng Provider Adapter Pattern (Mock, SpeedSMS, FPT, Viettel, Stringee) cùng cơ chế bảo mật (OTP hashing, resend cooldown 60s, daily send limits, max verification attempts lock).
- [x] Hoàn thiện Công cụ Tích lũy & Đổi điểm 3F Club nâng cấp (tích hợp ledger transaction tracking, CSDL và cài đặt admin, dynamic rolling 12-month tier Member/Silver/Gold/Diamond, cap redemption limits theo hạng, hiển thị banner nhắc nhở xác thực SĐT và tích hợp OTP trước khi đổi điểm).
- [x] Trang quản lý tài khoản người dùng (Lịch sử đơn hàng, địa chỉ, lịch sử tư vấn AI).
- [x] Nâng cấp trang Tư vấn AI (Hồ sơ thú cưng cũ) thành lịch sử tư vấn AI dinh dưỡng chi tiết, tích hợp tự động lưu kết quả từ AI Advisor Quiz, loại bỏ cấu hình thủ công cũ và hiển thị thông tin context đầu vào của thú cưng trong modal.
- [x] Di chuyển Hạng thành viên 3F Club thành Tab riêng biệt bên trái hiển thị thông tin hạng thành viên động và tiến trình thăng hạng sau khi số điện thoại được xác thực.
- [x] Khôi phục và khóa tính năng sửa/xóa hạng Diamond tại Quản lý Hạng thành viên Admin làm hạng hệ thống mặc định.
- [x] Loại bỏ 3 tab: Hạng thành viên, Quà & Voucher, và Cấu hình 3F Club khỏi trang quản trị Admin 3F Club theo kế hoạch tái cấu trúc.
- [x] Thiết kế lại Giao diện Phân trang Voucher phía Admin (Redesign Voucher Pagination) sang dạng số trang kết hợp co giãn thông minh và hộp chọn số dòng hiển thị tinh gọn.
- [x] Khắc phục lỗi rớt chữ cột Trạng thái/Thanh toán và ẩn icon xe tải trong cột Phương thức tại trang Quản lý đơn hàng Admin.
- [x] Đổi tên mục điều hướng trên thanh Sidebar của Admin từ "Voucher / Campaign" thành "Voucher" cho đồng bộ và tinh gọn.
- [x] Đồng bộ hóa hiển thị Voucher dạng thẻ răng cưa trong kết quả tư vấn AI và ràng buộc chỉ có tối đa 1 voucher hoạt động cho AI Advisor.
- [x] Triển khai Hệ thống Thông báo Quản trị viên (Admin Notification System) tự động cảnh báo các sự kiện đơn hàng mới, yêu cầu tích điểm Shopee mới, và đánh giá sản phẩm mới kèm dropdown bell icon cao cấp trên Header hiển thị số lượng chưa đọc thời gian thực (polling 60s) và tự động đánh dấu đã đọc khi chuyển hướng tài nguyên tương ứng.
- [x] Thiết kế và triển khai lại trang Giới thiệu / About (/about và /gioi-thieu) mang phong cách pet store ấm áp, tin cậy, gần gũi, tối ưu đa kênh và liên hệ, tích hợp điều hướng mượt mà ở Header và Footer.
- [x] Thiết kế và triển khai lại trang Liên hệ / Contact (/contact và /lien-he) mang phong cách pet store ấm áp, tin cậy, gần gũi, tích hợp API lưu trữ tin nhắn contact_messages MySQL và chống spam Honeypot.

## Phase 6: 3F Club Phased Implementation (CRM + Loyalty + Automation)
- [x] Phase 1 — Admin cấu hình cách tính điểm (Hoàn thành)
- [x] Phase 2 — Admin cấu hình hạng thành viên (Hoàn thành)
- [ ] Phase 3 — Admin cấu hình kênh bán hàng (Chưa bắt đầu)
- [ ] Phase 4 — Ledger điểm & lịch sử điểm (Chưa bắt đầu)
- [ ] Phase 5 — Admin cộng / trừ điểm thủ công (Chưa bắt đầu)
- [ ] Phase 6 — OTP Provider Adapter (Chưa bắt đầu)
- [ ] Phase 7 — Khách xác thực SĐT (Chưa bắt đầu)
- [ ] Phase 8 — OTP khi đổi điểm / đổi quà (Chưa bắt đầu)
- [ ] Phase 9 — Shopee / TikTok holding points (Chưa bắt đầu)
- [ ] Phase 10 — Nhắc điểm sắp hết hạn (Chưa bắt đầu)
