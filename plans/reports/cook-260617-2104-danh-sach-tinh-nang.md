# Danh Sách Tính Năng Hiện Tại - 3F Store & 3F Club

- **Ngày cập nhật:** 2026-06-17
- **Phiên bản:** 1.0.0

---

## 1. Giao diện & Trải nghiệm Cửa hàng (Frontend Store)
- **Trang chủ Bento Grid & Dark Theme:** Layout bento tương tác cao, Bento Flash Sale nền tối, slider khuyến mãi.
- **Tìm kiếm Real-time thông minh:** Tự động gợi ý sản phẩm/phân loại/giá dưới thanh tìm kiếm, hỗ trợ debounce 300ms, hủy request cũ, đồng bộ tham số URL `q`.
- **Bộ lọc sản phẩm đa năng:** Lọc theo phân loại, giá, rating, trạng thái kho. Có Drawer lọc chuyên biệt trên mobile.
- **Trang Chi tiết Sản phẩm (PDP):** Giao diện 2 cột, gallery ảnh dạng cuộn dính (sticky gallery), chọn variant động cập nhật giá/tồn kho.
- **Quick Add to Cart:** Modal thêm nhanh sản phẩm vào giỏ hàng ngay ngoài trang danh sách không cần tải lại trang.

## 2. Hệ thống Giỏ hàng & Thanh toán (Checkout & Orders)
- **Giỏ hàng trực quan:** Thêm/sửa/xóa số lượng, tự động tính tổng tiền.
- **Trang Thanh toán tối ưu:** Điền địa chỉ giao hàng tích hợp API hành chính Việt Nam v2 (tự động load Tỉnh/Xã), hardcode phí ship = 0đ.
- **Hệ thống Mã giảm giá (Coupon):** Áp dụng mã giảm giá động (ví dụ mã `GIAM50K`), validate điều kiện đơn hàng tối thiểu và giới hạn lượt dùng trên server.
- **Thanh toán VietQR động:** Tự động sinh mã VietQR theo tổng số tiền thực tế sau khi trừ giảm giá coupon để quét mã thanh toán.
- **Trang Success & Tracking:** Trang hoàn tất đơn hàng và trang tra cứu đơn hàng trực quan hiển thị timeline trạng thái đơn hàng thời gian thực.

## 3. Hệ thống Thành viên & Tích điểm (3F Club & Shopee Integration)
- **Tích điểm từ Đơn Shopee:** Khách hàng tải ảnh hóa đơn Shopee, hệ thống quét OCR tự động điền SĐT, mã đơn và tổng tiền.
- **Đối chiếu tự động với API Shopee:** Tích hợp Shopee Open Platform OAuth Sandbox kết nối shop, đối chiếu trạng thái đơn hàng (`COMPLETED`) và số tiền thực tế từ Shopee API.
- **Tích điểm tự động đơn Web:** Tự động cộng điểm cho tài khoản khách hàng khi đơn hàng web được đổi sang trạng thái hoàn thành (`completed`).
- **Cấu hình Quy tắc Tích điểm:** Admin cấu hình số tiền/1 điểm, cách làm tròn điểm, giá trị đơn tối thiểu và điểm tối đa của mỗi đơn hàng.
- **Trang đổi quà khách hàng (`/3f-club/rewards`):** Tra cứu hạng thành viên, xem danh sách quà tặng khả dụng (voucher, quà hiện vật), yêu cầu đổi quà trực tuyến và xem lịch sử điểm qua SĐT.

## 4. Hệ thống Quản trị (Admin Panel)
- **Admin Dashboard:** Biểu đồ thống kê doanh thu và nguồn đơn hàng (SVG Charts), danh sách lead AI và yêu cầu công việc.
- **Quản lý Đơn hàng Web:** Drawer xem chi tiết địa chỉ giao hàng, bộ lọc đơn hàng nâng cao, duyệt chuyển đổi trạng thái đơn hàng tuần tự.
- **Giao diện quản lý 3F Club tập trung:** 
  * Duyệt/từ chối yêu cầu tích điểm Shopee (đơn lẻ hoặc bulk), hiển thị cảnh báo lệch tiền/duyệt thủ công.
  * Cấu hình quy tắc tích điểm (Loyalty Point Rules) kèm Live Preview Calculator.
  * Danh mục quà đổi điểm, danh sách yêu cầu đổi quà và lịch sử điểm toàn hệ thống.
  * Tạo yêu cầu cộng điểm thủ công (Manual Request).

## 5. Trợ lý dinh dưỡng AI (AI Pet Advisor Quiz)
- **Khảo sát Thú cưng Đa bước:** Popup tự động hiện sau 7 giây, lưu trạng thái đóng/gửi thành công để không hiện lại.
- **Gợi ý Cá nhân hóa:** Đưa ra lời khuyên dinh dưỡng kèm 3 gói sản phẩm đề xuất (Tiết kiệm, Cân bằng, Premium) phù hợp ngân sách và tặng voucher mua hàng.

## 6. Hạ tầng & Vận hành (Infrastructure)
- **Tối ưu Tốc độ Tải trang:** Điểm Core Web Vitals tối ưu, ứng dụng WebP, React Lazy/Suspense tải trang dưới 1 giây.
- **Khóa tồn kho an toàn (Inventory Transaction Lock):** Cơ chế giữ chỗ tồn kho (`FOR UPDATE` lock) khi tạo đơn hàng, tự động hoàn kho nếu hủy đơn và trừ kho thật khi hoàn tất đơn.
- **Deploy FTP tự động:** Script Python `scripts/deploy_ftp.py` đồng bộ source code backend lên server hosting qua FTP, bỏ qua file nhạy cảm.
