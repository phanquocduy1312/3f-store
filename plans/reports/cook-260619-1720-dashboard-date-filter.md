# Cook Report: Lọc theo ngày cho Dashboard Admin

## Thay đổi thực hiện

- **Header Admin (`components/admin/admin-header.tsx`)**:
  - Gỡ bỏ class `hidden sm:inline` tại nhãn hiển thị bộ lọc ngày, chuyển sang hiển thị cố định (`text-[13px]`) giúp nhãn ngày luôn xuất hiện bên cạnh icon lịch trên mọi kích thước màn hình đúng như yêu cầu của người dùng.
- **Trang Dashboard (`src/pages/admin/admin-dashboard.tsx`)**:
  - Bổ sung helper `getPeriodSuffix()` để tự động sinh hậu tố động theo kỳ chọn (hôm nay, tuần này, tháng này, năm nay, tất cả thời gian).
  - Bổ sung helper `getComparisonLabel()` trả về chuỗi so sánh tương ứng (so với hôm qua, so với tuần trước, so với tháng trước, so với năm trước, rỗng cho tất cả thời gian).
  - Cập nhật tiêu đề và mô tả của 6 thẻ KPI thành các nhãn động (ví dụ: "Doanh thu tuần này", "Số đơn tháng này") giúp giao diện đồng bộ chính xác với bộ lọc dữ liệu thực tế.
  - Truyền `comparisonLabel` vào component `AdminKpiCard`.
  - Cập nhật mô tả chung của dashboard dưới tiêu đề trang ("Tổng quan vận hành 3F Store {hậu tố}") để chuyển đổi linh hoạt theo kỳ lọc.
- **Thẻ KPI (`components/admin/admin-kpi-card.tsx`)**:
  - Thêm thuộc tính `comparisonLabel` vào interface và component.
  - Ẩn toàn bộ badge xu hướng (chỉ số phần trăm tăng/giảm và mô tả so sánh) khi kỳ chọn là "Tất cả thời gian" (`comparisonLabel === ""`), giúp dữ liệu chính xác và sạch sẽ.
  - Hiển thị nhãn so sánh tùy biến thay vì cố định "so với hôm qua".

## Kết quả kiểm thử

- Đã chạy kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`) thành công 100%.
- Đã chạy build production (`npm run build`) thành công hoàn hảo, bundle tạo ra không có lỗi cảnh báo.

## Câu hỏi chưa giải quyết

- Không có câu hỏi nào chưa giải quyết.
