# Phase 01: Tạo App và lấy thông tin cấu hình từ Shopee Open Platform

**Context Links**
- [plan.md](./plan.md)

**Overview**
- Priority: High
- Current status: Pending
- Description: Đăng ký ứng dụng trên Shopee Open Platform để lấy Partner ID và Partner Key.

**Requirements**
- Có tài khoản Shopee Developer (đăng ký tại [open.shopee.com](https://open.shopee.com/)).
- Có quyền tạo App dạng **Custom App** hoặc **Seller In-house App**.

**Implementation Steps**
1. Truy cập [Shopee Open Platform](https://open.shopee.com/) và đăng nhập bằng tài khoản developer (không bắt buộc phải là tài khoản shop, nhưng khuyến khích dùng chung email quản lý).
2. Chuyển đến mục **Console** -> **App List** -> **Create App**.
3. Chọn loại App: **Custom App** (nếu tài khoản Dev khác tài khoản Shop) hoặc **Seller In-house App** (nếu tài khoản Dev chính là tài khoản Shop của 3F Store).
4. Điền các thông tin mô tả cơ bản của 3F Store.
5. Cấu hình **Auth Redirect URL**: 
   - Điền URL: `https://[Domain_3F_Store_Cua_Ban]/api/shopee/auth/callback`
   - Ví dụ: `https://api.3fstore.vn/api/shopee/auth/callback`
6. Đăng ký App và chờ Shopee duyệt (nếu cần) hoặc App sẽ được active ngay lập tức.
7. Mở chi tiết App vừa tạo để lấy 2 thông tin quan trọng:
   - **Partner ID** (dãy số)
   - **Partner Key** (dãy mã hóa dài)

**Todo List**
- [ ] Đăng nhập Shopee Open Platform.
- [ ] Tạo App & setup Redirect URL.
- [ ] Lấy `Partner ID` và `Partner Key`.

**Next Steps**
- Mang `Partner ID` và `Partner Key` sang Phase 02 để cấu hình lên Server 3F Store.
