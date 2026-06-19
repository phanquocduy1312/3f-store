# Cook Report: Tinh chỉnh Dashboard và Khách hàng Admin

## Thay đổi thực hiện

- **Dashboard Admin (`src/pages/admin/admin-dashboard.tsx`)**:
  - Loại bỏ hoàn toàn 4 chỉ số KPI: "Tỷ lệ chuyển đổi", "Giá trị đơn trung bình", "Đơn hoàn tất" và "Sản phẩm sắp hết hàng".
  - Giữ lại đúng 6 chỉ số vận hành quan trọng nhất: "Doanh thu hôm nay", "Số đơn hôm nay", "Đơn chờ xác nhận", "Đơn đang giao", "Khách hàng mới" và "Điểm 3F Club đã cộng".
  - Sắp xếp toàn bộ 6 chỉ số này trên một hàng ngang duy nhất ở desktop (`lg:grid-cols-6`).
  - Gỡ bỏ hai panel biểu đồ/danh sách *"Nguồn đơn hàng"* (donut chart) và *"Lead tư vấn mới nhất"* (AI leads list) để tinh gọn giao diện theo yêu cầu.
  - Tái sắp xếp hàng dưới thành 3 cột cân đối và song song: *"Yêu cầu Shopee mới nhất"*, *"Top sản phẩm bán chạy"* và *"Top nhu cầu thú cưng"*. Cả 3 panel đều có chiều cao đồng bộ `h-[360px]` giúp giao diện đạt trạng thái cân bằng tuyệt đối.
- **Thẻ Thống kê KPI (`components/admin/admin-kpi-card.tsx`)**:
  - Chuyển đổi linh hoạt từ bố cục ngang (`flex-row`) trên mobile/tablet sang bố cục dọc xếp chồng (`lg:flex-col lg:items-start`) trên desktop. Việc này giúp tối ưu hóa không gian hiển thị của mỗi thẻ thống kê khi màn hình chia thành 6 cột.
  - Tối ưu hóa kích thước đệm (`p-3 lg:p-3 xl:p-4`), chiều cao tối thiểu (`lg:min-h-[135px] xl:min-h-[145px]`) để tất cả các ô trong hàng tự động kéo giãn cao bằng nhau mà không làm méo mó bố cục.
  - Điều chỉnh size chữ giá trị số co giãn theo chiều rộng màn hình (`lg:text-[16px] xl:text-[20px] 2xl:text-[24px]`) cùng với thuộc tính `tracking-tighter` và `truncate` để đảm bảo số tiền lớn không bao giờ bị cắt hay tràn ra ngoài.
  - Tăng số dòng tiêu đề hiển thị lên tối đa 2 dòng (`line-clamp-2`), giúp các tiêu đề dài hiển thị đầy đủ tên không bị che khuất.
- **Top Sản phẩm bán chạy (`components/admin/admin-top-products.tsx`)**:
  - Bổ sung đầy đủ dấu tiếng Việt cho các nhãn, tiêu đề tĩnh: đổi *"Top san pham ban chay"* thành *"Top sản phẩm bán chạy"*, *"San pham co doanh so cao nhat"* thành *"Sản phẩm có doanh số cao nhất"*, *"7 ngay qua"* thành *"7 ngày qua"*, *"Da ban"* thành *"Đã bán"*.
  - Sửa ký hiệu đơn vị tiền tệ doanh thu từ chữ `"d"` thường thành ký hiệu chuẩn `"đ"` tiếng Việt.
- **Trang Khách hàng (`src/pages/admin/AdminCustomersPage.tsx`)**:
  - Gỡ bỏ hoàn toàn nút "Xuất CSV" trên thanh tiêu đề/actions.
  - Xóa bỏ logic handler `handleExportCsv` và import icon `Download` không dùng đến để giữ code sạch và tránh cảnh báo compiler.

## Kết quả kiểm thử

- Đã chạy kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`) thành công, không phát hiện lỗi.
- Đã chạy build production (`npm run build`) thành công rực rỡ, toàn bộ bundle được tạo ra sạch sẽ mà không gặp bất kỳ lỗi cảnh báo hay lỗi biên dịch nào.

## Câu hỏi chưa giải quyết

- Không có câu hỏi nào chưa giải quyết. Giao diện hiển thị nhỏ gọn, thanh thoát và hiện đại đúng theo yêu cầu.
