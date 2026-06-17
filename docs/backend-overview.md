# Tổng quan Backend 3F Store (Mini PHP MVC)

## 1. Giới thiệu
Dự án sử dụng kiến trúc **Mini PHP MVC** thuần (Pure PHP), không phụ thuộc vào các framework lớn như Laravel hay Symfony. Hệ thống được thiết kế cực kỳ gọn nhẹ, tập trung vào việc cung cấp các RESTful API phục vụ cho frontend React/Vite.

## 2. Cấu trúc thư mục (`3f-api/`)

```text
3f-api/
├── app/
│   ├── Controllers/    # Xử lý logic request/response cho từng endpoint
│   ├── Core/           # Chứa các thư viện lõi tự xây dựng (Database, Router, Request, Response)
│   ├── Helpers/        # Các hàm tiện ích (VD: cors.php)
│   ├── Models/         # Tương tác trực tiếp với cơ sở dữ liệu
│   └── Services/       # Xử lý business logic phức tạp (OCR, Upload, Validation)
├── config/
│   └── config.php      # Cấu hình Database, App URL, API Keys (OCR)
├── public/
│   ├── .htaccess       # Cấu hình Apache Rewrite engine chuyển hướng về index.php
│   └── index.php       # Entry point duy nhất của ứng dụng, khởi tạo Router
├── storage/
│   ├── logs/           # Thư mục chứa log hệ thống
│   └── uploads/        # Thư mục chứa các file ảnh đơn hàng do user upload
├── migrations/         # Chứa các file migration nếu có
└── schema.sql          # File SQL khởi tạo cấu trúc các bảng trong DB
```

## 3. Kiến trúc Core

Backend tự xây dựng 4 thành phần lõi chính (`app/Core`):
- **Router.php**: Quản lý và điều phối các endpoint. Hỗ trợ chuẩn hóa path (normalize path) xử lý triệt để mismatch `/api/...` và `api/...`.
- **Database.php**: Tương tác với MySQL thông qua `PDO` (hỗ trợ catch PDOException), thiết kế theo pattern Singleton.
- **Request.php**: Lấy thông tin phương thức, lấy tham số body/query (JSON/Form-data).
- **Response.php**: Chuẩn hóa cấu trúc trả về dạng JSON.

## 4. Các API Endpoints
Được định nghĩa tại `public/index.php`:

### 4.1. Shopee Client API
- `POST /api/shopee/order-scan`
  - **Controller**: `ShopeeOrderScanController::scan`
  - **Chức năng**: Upload ảnh hóa đơn Shopee, sử dụng OCR quét và bóc tách dữ liệu đơn hàng.
- `POST /api/shopee/requests`
  - **Controller**: `ShopeePointRequestController::create`
  - **Chức năng**: Tạo mới yêu cầu tích điểm từ khách hàng sau khi scan thành công.

### 4.2. Admin API
- `GET /api/admin/shopee/requests`
  - **Controller**: `ShopeePointRequestController::list`
  - **Chức năng**: Lấy danh sách yêu cầu tích điểm (hỗ trợ phân trang, bộ lọc cho Admin).
- `GET /api/admin/shopee/requests/detail`
  - **Controller**: `ShopeePointRequestController::detail`
  - **Chức năng**: Lấy thông tin chi tiết một yêu cầu bằng ID.
- `POST /api/admin/shopee/requests/approve`
  - **Controller**: `ShopeePointRequestController::approve`
  - **Chức năng**: Duyệt yêu cầu tích điểm, cộng điểm cho khách.
- `POST /api/admin/shopee/requests/reject`
  - **Controller**: `ShopeePointRequestController::reject`
  - **Chức năng**: Từ chối yêu cầu tích điểm (kèm lý do).

### 4.3. Customer API
- `GET /api/customer/points`
  - **Controller**: `CustomerPointController::points`
  - **Chức năng**: Tra cứu tổng số điểm của khách hàng bằng số điện thoại.

## 5. Dịch vụ (Services)
- **OcrService**: Tích hợp với dịch vụ OCR Space (`api.ocr.space`) để trích xuất text từ hình ảnh. Có logic phân tích Regex để lấy tên, SĐT, mã vận đơn, mã đơn Shopee, số tiền.
- **UploadService**: Đảm nhận nhận file từ request, kiểm tra định dạng và di chuyển vào `storage/uploads/`.
- **ValidationService**: Chuẩn hóa số điện thoại, format số liệu.
- **PointService**: Quản lý quy tắc cộng điểm, lịch sử giao dịch điểm.

## 6. Cấu hình triển khai CI/CD (Plesk + GitHub Actions)

Toàn bộ hệ thống được triển khai tự động lên máy chủ **Plesk** qua **GitHub Actions** tại file `.github/workflows/deploy-backend.yml`:

- **Trigger**: Chạy khi có code push lên nhánh `main` (chỉ với những thay đổi trong folder `3f-api/`).
- **Phương thức**: Dùng `rsync` qua SSH để upload.
- **Document Root**: `httpdocs/public` (Apache trên Plesk sẽ trỏ thẳng vào thư mục `public` để đọc file `index.php`).
- **Ngoại lệ (Exclude)**: Không ghi đè `.env`, thư mục `storage/uploads/`, `storage/logs/`.
- **Quyền hạn (Permissions)**: Tự động chạy script cấp quyền file thành `644`, folder thành `755` sau mỗi lần deploy.
- **Secrets yêu cầu trên GitHub**:
  - `PLESK_HOST`, `PLESK_USER`, `PLESK_PORT`, `PLESK_SSH_KEY`, `PLESK_PATH`
