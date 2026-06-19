# Phase 04: Xác nhận và Test luồng tự động duyệt

**Context Links**
- [plan.md](./plan.md)

**Overview**
- Priority: High
- Current status: Pending
- Description: Đóng giả vai trò khách hàng để tạo Request, sau đó kiểm tra xem Backend có giao tiếp được với Shopee Open API để xác thực đơn hàng hay không.

**Requirements**
- Đã hoàn thành Phase 03.
- Cần một mã đơn hàng (Order Code) Shopee THẬT từ cửa hàng Shopee của 3F Store để test.

**Implementation Steps**
1. **Tạo Request (User Flow)**:
   - Vào giao diện Frontend (trang chủ / Trang Tích điểm).
   - Nhập Số điện thoại.
   - Nhập Mã đơn hàng Shopee THẬT (của cửa hàng 3F Store).
   - Nhập Số tiền.
   - Bấm "Gửi đơn Shopee để tích điểm".
2. **Xác nhận quá trình đồng bộ (Backend Flow)**:
   - Request sẽ được gửi xuống DB (bảng `shopee_point_requests` với trạng thái `pending`).
   - Nếu bạn đã kích hoạt cronjob quét duyệt đơn (hoặc bấm nút Duyệt trong màn hình Admin):
     - Hệ thống 3F Store dùng Token Live gọi sang API Shopee `/api/v2/order/get_order_detail`.
     - Lấy trạng thái thực tế của đơn hàng (Đã giao hàng, Số tiền, Trạng thái đổi/trả).
3. **Đánh giá kết quả**:
   - Nếu đơn hàng hợp lệ (Hoàn tất, đúng số tiền): Request sẽ tự động chuyển thành `approved`.
   - Bảng `shopee_point_awards` sẽ tự động sinh record cộng điểm cho khách.
   - Khách sẽ thấy điểm được cộng trên giao diện lịch sử điểm.

**Todo List**
- [ ] Gửi yêu cầu với mã đơn Shopee thật.
- [ ] Test tự động xác minh đơn (Verify Order).
- [ ] Kiểm tra lịch sử cộng điểm.
- [ ] Xác nhận tính năng đã ổn định.

**Next Steps**
- Thông báo ra mắt tính năng cho khách hàng 3F Store.
