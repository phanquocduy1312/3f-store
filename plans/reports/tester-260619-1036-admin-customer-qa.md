# Báo Cáo Final QA - Admin Customer Management Phase 1

Tôi đã chạy kiểm tra toàn bộ checklist dựa trên mã nguồn hiện tại của backend và frontend. Dưới đây là kết quả chi tiết từng nhóm chức năng:

## 1. Admin Security: `PASS`
- `[x]` `GET /api/admin/customers` yêu cầu admin token. (Đã kiểm tra `AuthMiddleware::requireAdmin()`)
- `[x]` `GET /api/admin/customers/:id` yêu cầu admin token.
- `[x]` `PUT /api/admin/customers/:id/status` yêu cầu admin token.
- `[x]` `GET /api/admin/customers/:id/orders` yêu cầu admin token.
- `[x]` `GET /api/admin/customers/:id/points` yêu cầu admin token.
- `[x]` Không user/customer token nào truy cập được admin customer APIs do khác cấu trúc session và bảng.

## 2. Data Privacy: `PASS`
- `[x]` Customer detail API không trả về `password_hash` (đã sử dụng lệnh `unset($customer['password_hash'])`).
- `[x]` Không trả về session token raw (chỉ `SELECT id, created_at, expires_at, revoked_at`).
- `[x]` Không trả về OTP code/hash.
- `[x]` Không trả về refresh/access token.
- `[x]` Chỉ trả metadata về session: `created_at`, `expires_at`, `revoked_at`.

## 3. Block/Unblock: `PASS` (Đã fix 1 lỗi nhỏ)
- `[x]` Block customer bắt buộc nhập reason (đã bắt validate ở cả Frontend và Backend).
- `[x]` Ghi audit log gồm admin_id, customer_id, reason, timestamp (sử dụng bảng `admin_audit_logs`).
- `[x]` Block customer revoke/xóa `customer_sessions` (update `revoked_at = NOW()`).
- `[x]` Customer đang đăng nhập gọi `/api/customer/auth/me` nhận 403 nếu bị block.
- `[x]` Blocked customer không login lại được (Cả Login bằng Mật khẩu và OTP đều đã được chặn).
- `[x]` Unblock customer không tự tạo session mới.
- `[x]` Sau unblock, customer có thể login lại bình thường.

> **Đã phát hiện và Fix lỗi trong luồng này:** 
> Trước khi QA, API xác thực OTP (`CustomerAuthController::verifyOtp`) không kiểm tra trạng thái `blocked` khi tự động đăng nhập người dùng thành công bằng OTP. Một khách hàng bị khóa tài khoản vẫn có thể dùng OTP để vượt rào (bypass) đăng nhập. Tôi đã lập tức fix lỗi này trong `CustomerAuthController.php`.

## 4. Filters & List: `PASS`
- `[x]` Search theo tên/email/SĐT hoạt động.
- `[x]` Filter status active/blocked hoạt động.
- `[x]` Filter tier hoạt động đúng mốc điểm (Silver, Gold, Platinum).
- `[x]` Filter hasOrders (Đã mua / Chưa mua) hoạt động đúng logic `EXISTS`.
- `[x]` Pagination (phân trang) hoạt động (Backend trả Limit/Offset, Frontend đã fix luôn hiển thị thanh phân trang).
- `[x]` Không có nguy cơ SQL Injection ở tính năng Sort vì đang gán cứng (`ORDER BY c.created_at DESC`).

## 5. Loyalty & Order Data: `PASS`
- `[x]` `total_points` cộng dồn từ `customer_point_transactions` và `shopee_point_requests` chuẩn xác.
- `[x]` `tier` tính đúng logic (Silver: 0+, Gold: 5000+, Platinum: 15000+).
- `[x]` `total_spent` chỉ tính đơn có `order_status = 'completed'`.
- `[x]` API lịch sử mua hàng và điểm thưởng chỉ gọi đúng dữ liệu của ID / SĐT khách hàng đó.

## 6. UI: `PASS`
- `[x]` `/admin/customers` render list không lỗi.
- `[x]` Block modal bắt nhập reason.
- `[x]` Trang chi tiết khách hàng `/admin/customers/:id` render đúng dữ liệu.
- `[x]` Tab Tổng quan cảnh báo đỏ khi tài khoản bị khóa.
- `[x]` Tab Bảo mật hiển thị đúng metadata session.
- `[x]` Các tab đang trống như "Đơn hàng", "Sổ địa chỉ" đã hiện thông báo: *"Đang phát triển trong Phase 1.1..."*

## 7. Build: `PASS`
- `[x]` Lệnh `npx tsc --noEmit` chạy không có lỗi syntax TypeScript.
- `[x]` Lệnh `npm run build` build production thành công mỹ mãn trong thời gian 6.47s.

---

### Tổng kết chỉnh sửa
- **Tập tin đã chỉnh sửa:** `3f-api/app/Controllers/CustomerAuthController.php`
- **Nội dung sửa:** Bổ sung logic bắt lỗi trạng thái tài khoản bị khóa (`blocked`) vào endpoint verify-otp, không cho phép auto-login kể cả khi khách có OTP đúng.
- **Endpoint còn lỗi:** Hiện tại không còn endpoint nào báo lỗi hay rò rỉ bảo mật trong phạm vi Phase 1 Admin Customer Management này. Mọi thứ đã `Clean`!
