# Tài liệu logic hoạt động và quản lý hệ thống Voucher (Mã giảm giá)

Hệ thống Voucher trên 3F Store quản lý và đồng bộ mã giảm giá trên toàn bộ ứng dụng: Trang chủ, Trang thanh toán (Checkout) và Popup Kết quả tư vấn AI.

---

## 1. Cấu Trúc Dữ Liệu (Database Schema)

### Bảng `coupons`
Lưu trữ thông tin cấu hình của mã giảm giá.
- `id` (INT, Primary Key): ID tự tăng.
- `code` (VARCHAR, Unique): Mã voucher (luôn được chuẩn hoá viết hoa, ví dụ: `3F30K`).
- `name` (VARCHAR): Tên nội bộ mô tả chiến dịch.
- `description` (TEXT): Điều kiện áp dụng hoặc mô tả hiển thị ngoài frontend.
- `discount_type` (ENUM): Loại giảm giá:
  - `fixed`: Giảm số tiền cố định (đơn vị: VNĐ).
  - `percent`: Giảm theo tỷ lệ phần trăm (%).
  - `free_shipping`: Giảm/miễn phí vận chuyển.
  - `gift`: Tặng kèm quà tặng.
- `discount_value` (DECIMAL): Giá trị giảm giá tương ứng với loại giảm.
- `max_discount_amount` (DECIMAL): Mức giảm tối đa (áp dụng cho loại giảm `percent`).
- `min_order_amount` (DECIMAL): Giá trị đơn hàng tối thiểu để áp dụng mã.
- `usage_limit` (INT, Nullable): Tổng số lượt sử dụng tối đa của mã trên toàn hệ thống.
- `used_count` (INT): Số lượt đã sử dụng thành công.
- `per_customer_limit` (INT, Nullable): Số lượt sử dụng tối đa cho mỗi khách hàng (định danh qua Số điện thoại).
- `starts_at` / `ends_at` (DATETIME, Nullable): Thời gian bắt đầu và kết thúc hiệu lực của mã.
- `is_active` (TINYINT): Trạng thái kích hoạt tổng thể (1: Bật, 0: Tắt).
- **Vị trí hiển thị (Placement Flags)**:
  - `show_on_home` (TINYINT): Hiển thị mã tại slide ưu đãi trang chủ (1: Bật, 0: Tắt).
  - `show_in_cart` (TINYINT): Gợi ý mã tại sidebar trang thanh toán (1: Bật, 0: Tắt).
  - `show_in_ai_advisor` (TINYINT): Liên kết mã vào popup Kết quả tư vấn AI (1: Bật, 0: Tắt).
- **Thuộc tính giao diện (UI Aesthetics)**:
  - `display_title` (VARCHAR): Tiêu đề hiển thị lớn trên thẻ voucher (ví dụ: `GIẢM 30K`).
  - `display_label` (VARCHAR): Nhãn dọc bên trái thẻ (ví dụ: `TƯ VẤN AI`).
  - `badge_text` (VARCHAR): Huy hiệu nhỏ đính kèm (ví dụ: `AI Voucher`).
  - `theme_color` (VARCHAR): Tông màu thẻ (hỗ trợ `sky`, `indigo`, `amber`, `rose`, `violet`, `teal`, `red`).
  - `icon_key` (VARCHAR): Biểu tượng hiển thị (hỗ trợ `ticket`, `paw`, `truck`, `gift`, `bone`, `sparkles`).
  - `sort_order` (INT): Thứ tự sắp xếp hiển thị.

---

## 2. Quy Tắc & Ràng Buộc Nghiệp Vụ (Business Logic)

### Quy trình xác thực mã (Validate Coupon)
Khi khách hàng áp dụng mã giảm giá tại Checkout, backend thực hiện kiểm tra theo trình tự:
1. **Tồn tại & Kích hoạt**: Kiểm tra mã có tồn tại trong DB và cột `is_active = 1` hay không.
2. **Thời gian hiệu lực**: So khớp thời gian hiện tại với `starts_at` và `ends_at`.
3. **Giá trị đơn tối thiểu**: So sánh tổng tiền hàng (subtotal) với `min_order_amount`.
4. **Giới hạn tổng lượt sử dụng**: Đảm bảo `used_count` chưa đạt tới `usage_limit`.
5. **Giới hạn lượt dùng của mỗi khách hàng**: Nếu có `per_customer_limit`, backend truy vấn bảng `coupon_usages` đếm số đơn hàng đã hoàn tất kèm số điện thoại người mua. Nếu vượt quá sẽ từ chối.

### Ràng buộc duy nhất đối với Voucher Tư Vấn AI
- **Nghiệp vụ**: Hệ thống chỉ cho phép kích hoạt tối đa **1 voucher duy nhất** phục vụ luồng Tư vấn AI tại mọi thời điểm (`show_in_ai_advisor = 1`).
- **Xử lý phía backend**: Tại mô hình `Coupon.php`, khi lưu hoặc cập nhật một coupon có cờ `show_in_ai_advisor = 1`, hệ thống tự động chạy câu lệnh SQL để reset cờ này về `0` cho toàn bộ các voucher khác:
  ```sql
  UPDATE coupons SET show_in_ai_advisor = 0 WHERE id != :current_saved_id;
  ```
- **Xử lý phía frontend**: Tại form tạo/sửa voucher của Admin Panel, nếu người dùng tick chọn mục "Tư vấn AI", hệ thống hiển thị cảnh báo đỏ trực quan:
  > *⚠️ Lưu ý: Chỉ được phép bật tối đa 1 voucher cho Tư vấn AI. Khi lưu, cờ "Tư vấn AI" trên các voucher khác sẽ tự động tắt.*

---

## 3. Luồng Hoạt Động & Tích Hợp API

### Slide Trang Chủ (Home Carousel)
- API gọi: `GET /api/vouchers/featured?limit=12`
- Trả về danh sách voucher có `show_on_home = 1`, đang trong hạn sử dụng và còn lượt.

### Gợi Ý Tại Checkout (Cart Suggestions)
- API gọi: `GET /api/vouchers/cart-suggestions?limit=8`
- Trả về danh sách voucher có `show_in_cart = 1` và đủ điều kiện hoạt động.

### Popup Kết Quả Tư Vấn AI (AI Advisor Result)
Mã voucher tư vấn AI được đồng bộ xuyên suốt từ AI chat đến giao diện hiển thị:
1. **Dynamic Prompt cho Groq AI**: Khi khách hàng gửi yêu cầu tư vấn, backend proxy controller (`CustomerPetController.php`) thực hiện truy vấn cơ sở dữ liệu lấy mã voucher đang có cờ `show_in_ai_advisor = 1`. Giá trị và mã của voucher này sẽ được chèn trực tiếp vào Prompt hệ thống gửi lên Groq AI để mô hình AI đưa lời kêu gọi áp dụng mã một cách tự nhiên trong văn bản phản hồi.
2. **Giao diện Popup kết quả (`AiResult.tsx`)**:
   - Khi hiển thị kết quả, frontend gọi API `GET /api/vouchers/ai-advisor`.
   - Giao diện thẻ voucher trong popup tư vấn AI được thiết kế dạng răng cưa (`VoucherCard` style) đồng bộ 100% về kích thước, màu sắc gradient, hình dạng notch tròn cắt khuyết hai đầu, đường rách đứt nét và hoạ tiết dấu chân cún (`PawPrint`) ẩn dưới nền.
   - Nếu không có voucher nào cấu hình cờ AI, hệ thống sẽ sử dụng mã mặc định làm dự phòng (`3F30K`).

---

## 4. Theo Dõi & Báo Cáo Sự Kiện (Analytics & Tracking)

Hệ thống ghi nhận hành vi sử dụng voucher của người dùng vào bảng `coupon_events` để thống kê hiệu quả chiến dịch:
- Các loại sự kiện được ghi nhận (`event_type`):
  - `view`: Khách hàng nhìn thấy voucher trên màn hình.
  - `copy`: Khách hàng click copy mã.
  - `apply_success`: Áp dụng mã thành công vào giỏ hàng.
  - `apply_failed`: Áp dụng mã thất bại kèm lý do thất bại lưu trong `metadata_json` (ví dụ: `min_order`, `expired`, `usage_limit`).
  - `redeem_order`: Đặt hàng thành công có sử dụng mã.
