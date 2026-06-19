# Phase 02: Cấu hình biến môi trường (Live) cho 3F Store

**Context Links**
- [plan.md](./plan.md)

**Overview**
- Priority: High
- Current status: Pending
- Description: Đưa các thông số của Shopee App vào file cấu hình môi trường của hệ thống Backend 3F Store (`.env`).

**Requirements**
- Có quyền truy cập vào Server (qua FTP hoặc SSH) hoặc trang quản lý môi trường (cPanel/Plesk).
- Biết thư mục gốc của API (ví dụ: `3f-api/.env`).

**Implementation Steps**
1. Mở file `.env` trên thư mục gốc của backend API (`3f-api/.env`).
2. Tìm đến các config liên quan đến Shopee và thiết lập như sau:
   ```env
   # Bắt buộc đặt là live để trỏ tới API chính thức của Shopee
   SHOPEE_ENV=live
   
   # Thay bằng Partner ID lấy từ Phase 01
   SHOPEE_PARTNER_ID=1234567 
   
   # Thay bằng Partner Key lấy từ Phase 01
   SHOPEE_PARTNER_KEY=abc123def456...
   
   # URL Callback (Phải GIỐNG HỆT Auth Redirect URL đã đăng ký trên Shopee App ở Phase 01)
   SHOPEE_REDIRECT_URL=https://[Domain_3F_Store_Cua_Ban]/api/shopee/auth/callback
   ```
3. Lưu file `.env`.
4. Nếu đang sử dụng caching config trên backend thì cần chạy lệnh clear cache (hoặc khởi động lại tiến trình PHP/FPM nếu cần).

**Todo List**
- [ ] Mở file `.env` trên production server.
- [ ] Set `SHOPEE_ENV=live`.
- [ ] Cập nhật `SHOPEE_PARTNER_ID`, `SHOPEE_PARTNER_KEY`, `SHOPEE_REDIRECT_URL`.
- [ ] Lưu và reset cache.

**Next Steps**
- Sang Phase 03 để thực hiện thao tác uỷ quyền cho cửa hàng Shopee.
