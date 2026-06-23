# Giai đoạn 1: Database và API Backend

## Context Links
- File cần chỉnh sửa: [CustomerAuthController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerAuthController.php)
- File định nghĩa bảng: [customer-auth-schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/customer-auth-schema.sql)

## Overview
- **Độ ưu tiên**: Cao
- **Trạng thái**: Hoàn thành (Completed)
- **Mô tả**: Thiết lập cơ sở dữ liệu tạm thời để lưu trữ thông tin đăng ký của khách hàng trước khi được xác thực, cập nhật luồng đăng ký email và thêm API xác nhận link.

## Key Insights
- Không tạo tài khoản trực tiếp trong bảng `customers` khi người dùng gửi form để đảm bảo tính sạch sẽ của cơ sở dữ liệu (tránh spam tài khoản ảo bằng email không tồn tại).
- Cần có cơ chế hết hạn (Expires) cho link xác thực (ví dụ: 24 giờ) để tăng tính bảo mật.

## Requirements
- **Yêu cầu chức năng**:
  - Lưu trữ tạm thời: Tên, email, và password_hash của người dùng trong bảng `pending_registrations`.
  - Tạo token ngẫu nhiên và an toàn cho mỗi yêu cầu đăng ký.
  - Khi kích hoạt thành công, chuyển thông tin vào bảng `customers`, gán `email_verified_at = NOW()` và tự động đăng nhập.
  - Xóa hoặc vô hiệu hóa bản ghi tạm thời sau khi đã tạo tài khoản thành công.
- **Yêu cầu phi chức năng**:
  - Thời gian phản hồi API đăng ký dưới 500ms (sau khi gửi email bất đồng bộ).
  - Độ dài Token tối thiểu 64 ký tự hex.

## Architecture
- **Luồng dữ liệu**:
  1. Frontend gửi thông tin đăng ký -> Backend nhận, kiểm tra email tồn tại -> Lưu vào `pending_registrations` -> Sinh token -> Gửi mail -> Trả về kết quả yêu cầu xác thực.
  2. Frontend gửi yêu cầu xác thực `{email, token}` -> Backend đối chiếu database -> Đăng ký chính thức -> Xóa hàng tạm -> Tạo session -> Trả về token đăng nhập.

## Related Code Files
- **[NEW]** SQL migration: [create_pending_registrations.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/database/create_pending_registrations.sql)
- **[MODIFY]** Controller: [CustomerAuthController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerAuthController.php)

## Implementation Steps

### 1. Database Schema
Tạo bảng `pending_registrations`:
```sql
CREATE TABLE IF NOT EXISTS pending_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pr_email (email),
  INDEX idx_pr_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Backend Controllers
- Cập nhật hàm `registerEmail()` trong `CustomerAuthController`:
  - Thực hiện các validation thông thường (tên, email hợp lệ, độ dài mật khẩu).
  - Kiểm tra email đã được đăng ký và xác thực trước đó trong bảng `customers` chưa.
  - Sinh mã token ngẫu nhiên: `$token = bin2hex(random_bytes(32));`
  - Lưu vào bảng `pending_registrations` với thời hạn hết hạn 24 giờ.
  - Gọi dịch vụ email để gửi link xác thực.
- Thêm hàm `verifyRegistration()` trong `CustomerAuthController`:
  - Nhận `email` và `token` từ request.
  - Tìm bản ghi trong `pending_registrations` khớp với `email` và `token` và chưa hết hạn.
  - Nếu hợp lệ:
    - Bắt đầu transaction.
    - Chèn khách hàng vào bảng `customers` (`full_name`, `email`, `password_hash`, `email_verified_at = NOW()`).
    - Tạo session đăng nhập thông qua `CustomerSession`.
    - Xóa bản ghi trong `pending_registrations`.
    - Commit transaction.
    - Trả về token đăng nhập cho frontend.

## Todo List
- [x] Viết script SQL tạo bảng `pending_registrations`.
- [x] Cập nhật controller `CustomerAuthController` với logic lưu đăng ký tạm.
- [x] Thêm route `/api/customer/auth/verify-registration` trong `index.php`.
- [x] Viết hàm `verifyRegistration` xử lý tạo tài khoản chính thức.

## Success Criteria
- Đăng ký bằng Email không tự động tạo tài khoản trong bảng `customers` ngay lập tức.
- Gọi API xác thực với token và email chính xác sẽ chèn dữ liệu vào bảng `customers` và trả về token đăng nhập hợp lệ.
- Link hết hạn hoặc sai token sẽ bị từ chối với lỗi HTTP 400.

## Risk Assessment
- **Rủi ro**: Người dùng đăng ký nhiều lần với cùng một email dẫn đến nhiều hàng chờ trong `pending_registrations`.
- **Giảm thiểu**: Khi có yêu cầu đăng ký mới, tự động vô hiệu hóa/xóa các yêu cầu cũ của cùng email đó trong bảng `pending_registrations`.

## Security Considerations
- Password phải được băm bằng `PASSWORD_BCRYPT` trước khi lưu vào bảng tạm `pending_registrations`.
- Token xác thực phải được sinh bằng bộ sinh số ngẫu nhiên bảo mật (`random_bytes`).

## Next Steps
- Triển khai dịch vụ gửi email SMTP ở Giai đoạn 2.
