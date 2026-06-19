# Phase 03: Thực hiện ủy quyền (OAuth) tài khoản Shopee Seller

**Context Links**
- [plan.md](./plan.md)

**Overview**
- Priority: High
- Current status: Pending
- Description: Link hệ thống 3F Store với Cửa hàng Shopee của bạn bằng luồng OAuth để lấy Access Token.

**Requirements**
- Có tài khoản Admin 3F Store.
- Cầm tài khoản đăng nhập (Username/Password) của Shop Shopee 3F Store.
- Đã hoàn thành Phase 01 & 02.

**Implementation Steps**
1. Đăng nhập vào trang Quản trị Admin của 3F Store (`/admin`).
2. Vào màn hình **Kết nối Shopee** (Nếu hệ thống có giao diện nút kết nối) HOẶC truy cập trực tiếp vào API tạo link kết nối bằng cách gọi URL trên trình duyệt: 
   `https://[Domain_3F_Store_Cua_Ban]/api/shopee/auth/connect`
3. Trình duyệt sẽ tự động điều hướng (Redirect) sang trang Đăng nhập Shopee Seller.
4. Đăng nhập bằng tài khoản Shopee Seller của 3F Store (Lưu ý: Đăng nhập bằng main account có quyền cao nhất).
5. Sau khi đăng nhập, Shopee sẽ hiện ra thông báo hỏi: "Bạn có đồng ý cho phép ứng dụng truy cập dữ liệu không?".
6. Chọn cửa hàng và bấm **"Đồng ý/Authorize"**.
7. Shopee sẽ redirect ngược lại về trang Callback của 3F Store (`/api/shopee/auth/callback`).
8. Lúc này, Backend 3F Store sẽ nhận được `code` và tự động thực hiện gọi API Shopee lấy `access_token` và lưu vào Database (bảng `shopee_tokens`).
9. Thông báo trên màn hình: "Kết nối thành công!".

**Todo List**
- [ ] Lấy link Connect từ Admin/API.
- [ ] Đăng nhập Shopee Seller & Ủy quyền.
- [ ] Kiểm tra bảng `shopee_tokens` trong Database xem Token live đã được lưu hay chưa.

**Next Steps**
- Sang Phase 04 để tiến hành Test đơn duyệt tự động.
