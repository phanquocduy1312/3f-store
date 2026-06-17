# Cook Report: Improve Admin Order Operations

Báo cáo tiến độ triển khai cải tiến nghiệp vụ admin orders phục vụ vận hành sản xuất 3F Store.

## Rationale & Rationale

* Cải tiến trang `/admin/orders` và backend để kiểm soát chặt chẽ trạng thái đơn hàng (order state transition), tồn kho (inventory lock/fulfillment/release), và tích lũy điểm loyalty (loyalty points).
* Đảm bảo giao diện UI hiển thị thông tin trực quan, chính xác theo trạng thái vận hành của đơn hàng thật.

## Changes Made

### 1. Backend (`3f-api`)
* **Model `Order.php`**:
  * Bổ sung `LEFT JOIN customers c` vào các câu truy vấn để lấy đầy đủ `customer_name`, `customer_phone`, và `customer_email`.
  * Tránh lỗi MySQL Column Ambiguity bằng cách prefix đầy đủ `o.phone`, `c.name`, v.v.
  * Sửa tham số ghi log trạng thái ban đầu của đơn hàng: set `from_status = null` và ghi note `"Đơn hàng được tạo từ website"`.
  * Hỗ trợ bộ lọc `start_date` và `end_date` trong phương thức `listOrders`.
* **Controller `OrderController.php`**:
  * Kiểm tra early return nếu trạng thái mới trùng với trạng thái cũ để tránh cộng/trừ trùng lặp điểm và tồn kho.
  * Ngăn cản tuyệt đối việc Đánh dấu thanh toán (`mark-paid`) đối với các đơn hàng đã bị hủy (`cancelled`).
  * Trả lỗi nghiệp vụ dạng JSON với HTTP Code 400 thay vì để hệ thống báo lỗi 500.

### 2. Frontend (`src`)
* **API Types (`productsApi.ts`)**:
  * Bổ sung các trường tùy chọn `customer_name`, `customer_phone`, và `customer_email` vào kiểu `OrderDetail` để hiển thị trên UI.
  * Cập nhật kiểu `OrderStatusLog` khớp hoàn toàn với cấu trúc bảng cơ sở dữ liệu thực tế (`from_status`, `to_status`, `changed_by`).
* **Trang quản trị (`AdminOrdersPage.tsx`)**:
  * **Bộ lọc ngày**: Thêm hai input Từ ngày/Đến ngày hỗ trợ lọc khoảng thời gian tạo đơn hàng.
  * **Hiển thị điểm 3F Club**: Viết lại logic hiển thị điểm dựa trên điều kiện chi tiết:
    * `completed` + points > 0: "Đã cộng 3F Club: +X điểm"
    * Chưa completed và chưa cancelled: "Điểm dự kiến: +X điểm" (Helper: "Sẽ cộng khi đơn hoàn tất.")
    * `cancelled`: "Không tích điểm" (Helper: "Đơn đã hủy nên không cộng điểm.")
    * `refunded`: "Cần kiểm tra hoàn điểm" (Helper: "Đơn đã hoàn tiền...")
  * **Danh sách sản phẩm mua**:
    * Hiển thị sản phẩm thật kèm Ảnh, Tên, Phân loại, SKU, Số lượng, Đơn giá và Thành tiền (`price * quantity`).
    * Thêm trạng thái Empty hiển thị thông báo "Không có sản phẩm trong đơn hàng này." nếu danh sách rỗng.
  * **Nhật ký trạng thái**:
    * Sử dụng cấu trúc `log.to_status` mới, hiển thị chi tiết tên trạng thái, thời gian, người xử lý, ghi chú.
    * Fallback hiển thị "Trạng thái hiện tại: [status] - Chưa có lịch sử chi tiết cho đơn này." nếu `status_logs` trống.
  * **Hành động nhanh (Cột Hành động)**:
    * Thay thế hoàn toàn dropdown bằng các Icon Button trực quan, size 36px, tooltip đầy đủ.
    * Chỉ hiển thị các nút hành động hợp lệ theo từng trạng thái (ví dụ: pending -> check/cancel, completed/cancelled -> disabled).
  * **Footer Action của Drawer**:
    * Thiết kế footer cố định dưới cùng của drawer.
    * Hiển thị nút bấm chuyển tiếp trạng thái theo sơ đồ transition chính xác của 3F Store.
    * Hiển thị nút "Đánh dấu đã thanh toán" cho các đơn chưa thanh toán và chưa bị hủy.
  * **Confirm Dialog**:
    * Tích hợp React Modal Dialog tùy chỉnh thay thế cho `window.confirm` mặc định.
    * Có textarea nhập lý do (Lý do hủy đơn, Ghi chú thanh toán) khi xác nhận Hủy đơn hoặc Đánh dấu đã thanh toán.
  * **Warning Thanh toán**:
    * Hiển thị cảnh báo màu đỏ nếu đơn hàng đã thanh toán (`paid`) nhưng lại bị hủy (`cancelled`): "Đơn đã hủy nhưng đã thanh toán, cần xử lý hoàn tiền."
* **Order Tracking (`OrderTracking.tsx`)**:
  * Sửa lỗi tham chiếu kiểu dữ liệu `log.status` thành `log.to_status || 'pending'` để tương thích với API logging mới.

## Verification & Testing

* **TypeScript Compilation**: `npx tsc --noEmit` chạy thành công không có lỗi.
* **Production Build**: `npm run build` hoàn thành trong 17.76 giây và tạo bundle dist hoàn hảo.

## Unresolved Questions

* Không có.
