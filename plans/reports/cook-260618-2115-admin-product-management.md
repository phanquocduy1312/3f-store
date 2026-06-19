# Cook Report: Admin Product Management

Báo cáo tiến độ triển khai tính năng Quản lý Sản phẩm dành cho Admin (Admin Product Management) đáp ứng đầy đủ yêu cầu nghiệp vụ và an toàn hệ thống của 3F Store.

## Rationale & Rationale

* Triển khai hệ thống Quản lý Sản phẩm an toàn, chống thất thoát dữ liệu lịch sử đơn hàng, sử dụng database transaction để đảm bảo tính toàn vẹn của dữ liệu.
* Phân tách giao diện Form Admin thành các Tab trực quan, giúp vận hành dễ dàng, giảm tải thông tin hiển thị.
* Bảo vệ toàn bộ endpoint API admin bằng JWT token và cơ chế phân quyền chặt chẽ.

## Changes Made

### 1. Backend (`3f-api`)
* **Bảo vệ API (`ProductController.php`)**:
  * Yêu cầu kiểm tra admin token hợp lệ (`AuthMiddleware::requireAdmin()`) trên tất cả các route quản trị `/api/admin/products/*`.
  * Phân quyền cụ thể cho các role hệ thống (`admin`, `superadmin`, `manager`), trả về 403 Forbidden nếu không đủ quyền.
* **Database Transaction (`Product.php`)**:
  * Phương thức `saveProduct` sử dụng PDO transaction (`beginTransaction`, `commit`, `rollBack`) đảm bảo đồng bộ dữ liệu đồng thời trên các bảng `products`, `product_variants`, và `product_images`.
* **Ràng buộc và kiểm tra SKU**:
  * Kiểm tra trùng lặp SKU global trong DB: nếu trùng lặp SKU của variant khác sẽ lập tức trả về lỗi HTTP 400 (`"SKU đã tồn tại."`). Cho phép variant hiện tại giữ nguyên SKU cũ khi cập nhật.
* **Xử lý an toàn biến thể (Soft Delete)**:
  * Khi lưu sản phẩm, hệ thống đối chiếu danh sách biến thể cũ trong DB. Nếu biến thể bị xóa đã từng có lịch sử trong bảng `order_items`, hệ thống chỉ tắt kích hoạt (`is_active = 0`) để bảo vệ lịch sử đơn hàng. Chỉ xóa cứng (`DELETE`) các biến thể chưa từng có đơn hàng nào.
* **Tự động tính toán chỉ số tổng hợp (Aggregates)**:
  * Backend tự động tính toán lại `min_price`, `max_price`, `total_stock`, và `variant_count` dựa trên các biến thể đang hoạt động (`is_active = 1`) sau khi đồng bộ, không tin cậy dữ liệu tính toán từ frontend gửi lên.
* **Sinh Slug độc nhất**:
  * Tự động sinh slug từ tên tiếng Việt không dấu, đảm bảo định dạng URL chuẩn SEO và tự động tăng chỉ số counter (`-1`, `-2`,...) nếu slug bị trùng lặp với sản phẩm khác.
* **Audit Logs**:
  * Ghi lịch sử tác động vào bảng `admin_audit_logs` đối với các hành động: `product_create`, `product_update`, `product_toggle_active`, và `product_reclassify` kèm thông tin chi tiết (`product_id`, `name`, `changed_fields`).

### 2. Frontend & UI/UX
* **Quản trị Route & Sidebar (`App.tsx`, `admin-sidebar.tsx`)**:
  * Thêm các route frontend: `/admin/products`, `/admin/products/create`, và `/admin/products/:id`.
  * Bổ sung mục quản lý "Sản phẩm" vào Sidebar định tuyến chính xác.
* **Trang danh sách sản phẩm (`AdminProductsPage.tsx`)**:
  * Thiết kế bảng dữ liệu hiển thị trực quan các cột: hình ảnh, tên, danh mục, loại thú cưng, loại sản phẩm, khoảng giá, số biến thể, tổng tồn kho, số lượng đã bán, trạng thái hoạt động, ngày cập nhật và nút thao tác nhanh.
  * Bộ lọc linh hoạt: tìm kiếm theo tên/brand/SKU, lọc theo danh mục, loại thú cưng, loại sản phẩm, trạng thái hoạt động (bật/tắt) và tình trạng tồn kho (`in_stock`, `low_stock`, `out_of_stock`).
* **Trang Form thêm mới / chỉnh sửa (`AdminProductForm.tsx`)**:
  * Phân tách Form thành 5 Tab: Thông tin cơ bản, Phân loại & SEO, Biến thể & Tồn kho, Quản lý Hình ảnh, Thiết lập Hiển thị.
  * **Tab Biến thể**: Trình chỉnh sửa bảng inline chuyên nghiệp, hỗ trợ inline validation SKU, giá, tồn kho. Hiển thị cảnh báo xác nhận của hệ thống khi cố gắng xóa biến thể đã lưu.
  * **Tab Hình ảnh**: Quản lý ảnh trực quan, hỗ trợ nhập URL ảnh, xem preview tức thì, nút tích chọn ảnh đại diện chính (Primary Image) và nhập thứ tự sắp xếp.
* **Sửa lỗi TypeScript và build**:
  * Bổ sung các trường `categoryId`, `createdAt`, `updatedAt` vào định nghĩa kiểu `ApiProduct` trong [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts).
  * Chuyển các thuộc tính tìm kiếm và bộ lọc ngày của `AdminHeader` trong [admin-header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-header.tsx) thành dạng tùy chọn (optional) kèm giá trị mặc định để tránh lỗi TypeScript ở các trang không sử dụng bộ lọc.
  * Sửa lỗi tham chiếu thuộc tính `short_description` thành `shortDescription` trên đối tượng thuộc kiểu `ApiProduct` tại trang [AdminProductForm.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminProductForm.tsx).

## Verification & Testing

* **TypeScript Compilation**: `npx tsc --noEmit` hoàn thành thành công không phát sinh bất kỳ cảnh báo hay lỗi kiểu dữ liệu nào.
* **Production Build**: Lệnh `npm run build` chạy thành công, tối ưu hóa bundle CSS/JS hoàn chỉnh để sẵn sàng cho production.
* **Deployment**: Chạy thành công tập lệnh `python scripts/deploy_ftp.py` để đồng bộ các file backend được cập nhật lên máy chủ lưu trữ `203.205.31.252` tại `/httpdocs`.

## Unresolved Questions

* Không có.
