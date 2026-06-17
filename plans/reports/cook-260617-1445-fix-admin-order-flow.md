# Cook Report: Standardized Order Status transitions and Admin Dashboard

Báo cáo tiến độ hoàn tất chuẩn hóa luồng trạng thái đơn hàng và nâng cấp giao diện Quản lý đơn hàng Admin cho 3F Store.

## Rationale

* Khắc phục hoàn toàn lỗi cú pháp trong Drawer của `AdminOrdersPage.tsx`.
* Đồng bộ quy trình chuyển trạng thái đơn hàng nghiêm ngặt theo đúng nghiệp vụ 3F Store.
* Nâng cao trải nghiệm quản trị viên thông qua bảng điều khiển thống kê (dashboard summary cards) và lọc theo khoảng ngày thực tế.

## Changes Made

### 1. Backend Codebase (`3f-api`)
* **`OrderController.php`**:
  * Tích hợp lấy tham số `start_date` và `end_date` từ request query parameters trong `adminList()` gửi tới `Order` model.
  * Tự động tạo và append các note mặc định chuẩn hóa theo đúng sơ đồ nghiệp vụ trong timeline log của `adminUpdateStatus()` (ví dụ: "Admin xác nhận đơn hàng", "Đơn chuyển sang chuẩn bị hàng", v.v.).

### 2. Frontend Codebase (`src`)
* **`AdminOrdersPage.tsx`**:
  * **Sửa lỗi cú pháp Drawer**: Khôi phục hoàn toàn cấu trúc Drawer body, Totals Summary và Footer Actions.
  * **Chuẩn hóa Flow Trạng thái**:
    * Chỉ hiển thị các nút hành động tương ứng với trình tự: `pending` (Hủy đơn / Xác nhận đơn) → `confirmed` (Chuẩn bị hàng) → `packing` (Bắt đầu giao) → `shipping` (Hoàn tất).
    * Chặn hoàn toàn nút hủy đơn hàng sau khi đơn đã chuyển sang `confirmed`.
    * Ẩn hoàn toàn nút "Đánh dấu đã thanh toán" theo yêu cầu nghiệp vụ đối soát riêng biệt.
  * **Dashboard Summary Cards**:
    * Thêm 6 thẻ thống kê có icon (Tổng đơn, Chờ xác nhận, Đang xử lý, Đang giao, Hoàn tất, Doanh thu hoàn tất) tương tác trực tiếp với dữ liệu summary thời gian thực từ API.
    * Giao diện responsive linh hoạt (6 cột trên Desktop, 3 cột trên Tablet, 1-2 cột trên Mobile).
  * **Địa chỉ nhận hàng**:
    * Sử dụng CSS `whitespace-normal break-words` đảm bảo địa chỉ hiển thị đầy đủ, không bị cắt xén hay ellipsis.
  * **Tích lũy 3F Club**:
    * Thay đổi đơn vị hiển thị từ "đ" sang "điểm".
  * **Bộ lọc ngày**:
    * Liên kết bộ lọc Từ ngày/Đến ngày trực tiếp với API endpoint.

## Verification & Testing

* **TypeScript Typecheck**: Chạy `npx tsc --noEmit` thành công hoàn toàn không có bất kỳ cảnh báo nào.
* **Vite Bundle Build**: Chạy `npm run build` thành công, các chunk bundle cho trang AdminOrdersPage và vendor được build hoàn hảo.

## Unresolved Questions

* Không có.
