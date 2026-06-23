# Giai đoạn 2: Tích hợp Gửi Email và Frontend

## Context Links
- Frontend Router: [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- Trang Đăng ký: [Register.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/Register.tsx) (hoặc tương đương)
- Cấu hình API Frontend: [customerAuthApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAuthApi.ts)

## Overview
- **Độ ưu tiên**: Cao
- **Trạng thái**: Hoàn thành (Completed)
- **Mô tả**: Thiết lập SMTP hoặc thư viện gửi email tại Backend và cập nhật giao diện đăng ký + tạo trang xác thực trên React Frontend.

## Key Insights
- Để thuận tiện cho việc phát triển cục bộ (Local Development), trong môi trường `development`, link xác thực sẽ được trả về trực tiếp trong phản hồi API đăng ký (giống cách làm `devOtp` của hệ thống) hoặc ghi nhận vào file log, giúp lập trình viên kiểm thử nhanh mà không bắt buộc cấu hình SMTP thực tế.

## Requirements
- **Backend (Email)**:
  - Tích hợp hàm gửi email bằng giao thức SMTP hoặc hàm `mail()` cơ bản của PHP.
  - Thêm cấu hình `.env` cho email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- **Frontend (UI/UX)**:
  - Cập nhật trang Đăng ký: Sau khi đăng ký thành công, thay vì đăng nhập và chuyển hướng luôn, hiển thị thông báo thân thiện (yêu cầu kiểm tra Gmail).
  - Tạo trang `/verify-registration` tiếp nhận mã xác thực từ đường dẫn (ví dụ: `/verify-registration?email=sen@gmail.com&token=abc123xyz...`).
  - Gọi API xác thực từ trang này và tự động đăng nhập khi thành công.

## Architecture
- **Giao tiếp API**:
  - `POST /api/customer/auth/verify-registration`
    - Payload: `{ email: string, token: string }`
    - Response: `{ success: true, data: { token: string, customer: object } }`

## Related Code Files
- **[NEW]** Service Backend: `EmailService.php` (hoặc tích hợp vào thư mục app/Services)
- **[NEW]** Page Frontend: [VerifyRegistrationPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/VerifyRegistrationPage.tsx)
- **[MODIFY]** API Frontend: [customerAuthApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/customerAuthApi.ts)
- **[MODIFY]** Frontend Route: [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx)
- **[MODIFY]** Page Đăng ký: [Register.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/client/Register.tsx)

## Implementation Steps

### 1. Gửi Email (Backend)
- Xây dựng lớp `EmailService`:
  - Đọc thông số cấu hình SMTP từ `.env`.
  - Soạn thảo tiêu đề: `"Xác thực tài khoản 3F Store của bạn"`.
  - Nội dung HTML chứa lời chào ấm áp, hướng dẫn và một nút bấm kích hoạt trỏ về địa chỉ:
    `{APP_URL}/verify-registration?email={email}&token={token}`
  - Trong môi trường `development`, nếu không có cấu hình SMTP thực tế, tự động ghi nhận nội dung email vào file log trong `3f-api/storage/logs/email.log`.

### 2. Giao diện Đăng ký (Frontend)
- Trong component đăng ký (ví dụ: `Register.tsx`):
  - Nhận phản hồi thành công từ API.
  - Thay đổi trạng thái UI để hiển thị thông báo hướng dẫn:
    *"Một liên kết xác thực đã được gửi đến Gmail của bạn. Vui lòng nhấn vào liên kết trong hộp thư để hoàn tất tạo tài khoản."*
  - Nếu ở môi trường dev, có thể hiện nút bấm giả lập click nhanh link xác thực (lấy từ trường trả về của API dev) để tăng năng suất kiểm thử.

### 3. Trang Xác thực (Frontend)
- Xây dựng component `VerifyRegistrationPage.tsx`:
  - Dùng hook `useSearchParams` để trích xuất `email` và `token`.
  - Hiển thị trạng thái đang xử lý xác thực kèm hiệu ứng spinner thân thiện.
  - Gửi request đến `/api/customer/auth/verify-registration`.
  - **Trường hợp thành công**: Lưu session token vào `localStorage`, hiển thị thông báo chúc mừng, tự động đăng nhập và chuyển hướng về trang chủ hoặc hồ sơ khách hàng.
  - **Trường hợp thất bại**: Hiển thị lỗi (mã xác thực không hợp lệ, hết hạn) kèm nút bấm quay lại trang Đăng ký.

## Todo List
- [x] Xây dựng dịch vụ `EmailService.php` cho backend.
- [x] Thêm các cấu hình SMTP tương ứng vào file `.env`.
- [x] Sửa trang `Register.tsx` hiển thị thông báo xác thực thay vì đăng nhập ngay.
- [x] Thêm route `/verify-registration` vào file `App.tsx`.
- [x] Viết trang `VerifyRegistrationPage.tsx` gọi API và chuyển hướng sau khi kích hoạt thành công.

## Success Criteria
- Nhận được email chứa link xác thực sau khi hoàn tất form đăng ký.
- Nhấp vào link dẫn đến trang xác thực trên web, gọi API thành công, tài khoản mới được tạo trong database và tự động đăng nhập.
- Không thể đăng nhập bằng tài khoản trước khi nhấp vào link xác thực.

## Risk Assessment
- **Rủi ro**: Email rơi vào thư mục Spam/Quảng cáo hoặc bị trễ do nhà mạng.
- **Giảm thiểu**: Thiết kế giao diện thông báo đăng ký có dòng nhắc nhở người dùng check cả hòm thư Spam/Quảng cáo và nút "Gửi lại link xác thực" sau 60 giây.

## Security Considerations
- Link xác thực chỉ dùng được duy nhất 1 lần (Single-use token). Khi đã xác thực thành công, token đó phải bị xóa ngay lập tức.
- Giới hạn tần suất gửi email đăng ký (Rate-limiting) theo IP hoặc theo địa chỉ Email để tránh bị kẻ xấu lợi dụng spam mail.
