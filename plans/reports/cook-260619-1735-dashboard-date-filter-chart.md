# Cook Report: Đồng bộ Bộ lọc ngày Biểu đồ & Sửa lỗi hiển thị cột Tháng này

## Thay đổi thực hiện

- **Backend API Doanh thu (`3f-api/app/Controllers/AdminDashboardController.php`)**:
  - Tái cấu trúc hoàn toàn API `getRevenueChart` để nhận tham số bộ lọc `filter` truyền trực tiếp từ main header (Hôm nay, Tuần này, Tháng này, Năm nay, Tất cả thời gian).
  - Trả về hai mảng tập dữ liệu: `current` (kỳ hiện tại) và `previous` (kỳ so sánh tương ứng) giúp frontend tự động tính toán chính xác phần trăm tăng trưởng.
  - Phân nhóm dữ liệu tương ứng:
    - `today`: 24 giờ trong ngày (hôm nay vs hôm qua).
    - `this_week`: 7 ngày trong tuần từ Thứ 2 đến Chủ nhật (tuần này vs tuần trước).
    - `this_month`: Toàn bộ các ngày trong tháng hiện tại (tháng này vs tháng trước).
    - `this_year`: 12 tháng từ Tháng 1 đến Tháng 12 (năm nay vs năm trước).
    - `all_time`: Nhóm 12 tháng gần nhất (so với 12 tháng trước đó).
- **Frontend API Client (`src/api/adminDashboardApi.ts`)**:
  - Cập nhật API `getRevenueChart` để truyền tham số `filter` thay vì truyền tham số `days` cũ.
- **Biểu đồ doanh thu (`components/admin/admin-revenue-chart.tsx`)**:
  - Nhận tham số `filter` truyền từ Dashboard cha. Loại bỏ dropdown chọn ngày cục bộ ("7 ngày qua / 30 ngày qua") để đồng bộ duy nhất theo bộ lọc lịch chính ở header.
  - Cập nhật tiêu đề động dựa trên bộ lọc: "Doanh thu hôm nay", "Doanh thu tuần này", "Doanh thu tháng này", "Doanh thu năm nay", "Doanh thu tất cả thời gian".
  - Sửa lỗi chồng chéo nhãn X-Axis (đặc biệt khi chọn "Tháng này" hiển thị ~30 ngày): Bổ sung logic hiển thị nhãn có khoảng cách (spaced labels) khi tập dữ liệu > 10 điểm (chia đều khoảng cách 8-9 nhãn chính, hiển thị nhãn đầu và nhãn cuối).
  - Sửa lỗi cột biến dạng khi giá trị doanh thu thấp (Rounding collapse): 
    - Đặt giới hạn chiều cao cột tối thiểu là `4px` đối với các cột có doanh thu dương (giúp cột không bị bẹt thành đường kẻ phẳng do bán kính bo góc đầu cột `rx` lớn hơn chiều cao).
    - Tự động điều chỉnh bán kính bo góc đầu cột `rx` linh hoạt dựa trên chiều cao thực tế `rx = Math.min(barHeight / 2, barWidth / 4)`.
  - Cập nhật tiêu đề và cách tính hộp tóm tắt dưới biểu đồ:
    - Đổi nhãn tĩnh "Đơn hàng TB / ngày" thành nhãn động dựa trên kỳ lọc (ví dụ: "Đơn hàng TB / giờ" cho hôm nay, "Đơn hàng TB / tháng" cho năm nay).
    - Tính toán số chia trung bình tương ứng cực kỳ chính xác (chia cho 24 đối với giờ, 7 đối với tuần, số ngày thực tế trong tháng đối với tháng, 12 đối với năm).
- **Trang Dashboard cha (`src/pages/admin/admin-dashboard.tsx`)**:
  - Truyền prop `filter={selectedDate}` cho component `AdminRevenueChart` để đồng bộ hoàn chỉnh dữ liệu.

## Kết quả kiểm thử và triển khai

- Đã chạy kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`) thành công 100%.
- Đã chạy build production (`npm run build`) thành công hoàn hảo, bundle tạo ra không có lỗi cảnh báo.
- Đã triển khai thành công mã nguồn backend mới lên máy chủ Plesk thông qua script FTP (`deploy_ftp.py`), chỉ upload đúng 1 file thay đổi `AdminDashboardController.php`.

## Câu hỏi chưa giải quyết

- Không có câu hỏi nào chưa giải quyết.
