# Hướng dẫn Deploy Backend bằng Python qua FTP (Plesk)

Tài liệu này hướng dẫn cách deploy phần backend PHP MVC từ thư mục local `3f-api/` lên server Plesk thông qua script Python FTP.

---

## 1. Lý do sử dụng Python FTP Deploy

Hiện tại, việc deploy tự động và thủ công bằng các công cụ thông thường gặp một số hạn chế:
* **GitHub Actions** chưa thể sử dụng do tài khoản bị billing lock.
* **Kết nối SSH** trên hệ thống Plesk trả về lỗi `403 Forbidden`.

Do đó, giải pháp tối ưu và nhanh chóng nhất là chạy một script Python cục bộ để đồng bộ hóa các tệp từ máy cá nhân lên Plesk thông qua giao thức FTP (cổng 21).

---

## 2. Cách Cấu hình Biến Môi Trường

Bạn có thể cung cấp thông tin đăng nhập FTP bằng một trong hai cách:

### Cách 1: Sử dụng file `.deploy.env` (Khuyên dùng)
Tạo một file `.deploy.env` tại thư mục root của dự án (ngang hàng với `package.json` và `.gitignore`). File này đã được thêm vào `.gitignore` để tránh bị commit lên GitHub.

Nội dung file `.deploy.env`:
```env
FTP_HOST=203.205.31.252
FTP_USER=duy
FTP_PASS=your_password_here
FTP_TARGET_DIR=/httpdocs
```

> [!TIP]
> Nếu tài khoản người dùng `duy` không thể kết nối hoặc bị lỗi đăng nhập FTP, hãy thử đổi thông tin đăng nhập sang tài khoản hệ thống của Plesk:
> `FTP_USER=u62dc1310`

### Cách 2: Export trực tiếp trong Terminal
Bạn có thể export trực tiếp các biến môi trường này trước khi chạy script (xem hướng dẫn ở phần 3).

---

## 3. Cách chạy Deploy trên Windows PowerShell

Mở Windows PowerShell tại thư mục root của dự án và chạy các lệnh sau:

```powershell
# Thiết lập biến môi trường
$env:FTP_HOST="203.205.31.252"
$env:FTP_USER="duy"
$env:FTP_PASS="your_password_here"
$env:FTP_TARGET_DIR="/httpdocs"

# Chạy script deploy
python scripts/deploy_ftp.py
```

> [!NOTE]
> Nếu bạn đã cấu hình file `.deploy.env`, bạn chỉ cần chạy lệnh sau mà không cần thiết lập các biến `$env:`:
> ```powershell
> python scripts/deploy_ftp.py
> ```

---

## 4. Chi tiết Hoạt động của Script

Script hoạt động theo các nguyên tắc an toàn sau:
1. **Lấy nội dung bên trong `3f-api/`**: Chỉ deploy các file/thư mục con của `3f-api/` trực tiếp vào thư mục remote chỉ định (`/httpdocs`). Không tạo thư mục `/httpdocs/3f-api/`.
2. **Loại trừ các file/thư mục quan trọng (Bỏ qua)**:
   - Các file config local: `.env`
   - File logs & upload của người dùng: `storage/uploads/` và `storage/logs/` (để tránh mất dữ liệu production).
   - Thư mục quản lý code/dependencies: `.git/`, `.github/`, `node_modules/`, `vendor/`, `__pycache__/`, `.DS_Store`.
3. **Đồng bộ tối ưu**: Chỉ upload/overwrite những file mới hoặc có sự thay đổi về dung lượng (size) so với remote server.
4. **Không xóa dữ liệu**: Phiên bản đầu của script không tự động xóa bất kỳ file nào trên remote server để đảm bảo an toàn tuyệt đối cho dữ liệu.
5. **Tự động tạo thư mục**: Nếu thư mục đích chưa tồn tại trên remote server, script sẽ tự động tạo thư mục đệ quy.

---

## 5. Kiểm tra Sau khi Deploy

Sau khi deploy thành công, bạn có thể thực hiện kiểm tra hoạt động của backend và các API bằng các công cụ như Postman hoặc cURL:

### A. Kiểm tra Trạng thái Kết nối Shopee
* **Endpoint**: `GET /api/admin/shopee/connection-status` (hoặc `?route=admin.shopee.conn_status`)
* **URL**: `https://trial1506895.mbws.vn/api/admin/shopee/connection-status`

### B. Đối chiếu Một Đơn hàng Shopee
* **Endpoint**: `POST /api/admin/shopee/requests/verify` (hoặc `?route=admin.shopee.request_verify`)
* **URL**: `https://trial1506895.mbws.vn/api/admin/shopee/requests/verify`
* **Payload**:
  ```json
  {
    "id": 3
  }
  ```

### C. Đối chiếu Hàng loạt Đơn hàng Shopee
* **Endpoint**: `POST /api/admin/shopee/requests/verify-bulk` (hoặc `?route=admin.shopee.request_verify_bulk`)
* **URL**: `https://trial1506895.mbws.vn/api/admin/shopee/requests/verify-bulk`
* **Payload (Tuỳ chọn)**:
  ```json
  {
    "ids": [1, 2, 3]
  }
  ```
  *(Nếu không truyền `"ids"`, hệ thống sẽ tự động đối chiếu tất cả các yêu cầu đang ở trạng thái `pending` và chưa được đối chiếu `not_checked`)*

---

## 6. Các Trạng thái Đối chiếu (verification_status)

Sau khi đối chiếu, cột `verification_status` của yêu cầu tích điểm sẽ được cập nhật sang một trong các trạng thái sau:
1. `not_checked`: Chưa đối chiếu (Mặc định khi tạo mới).
2. `valid`: Đơn hàng Shopee hợp lệ (Khớp mã đơn, khớp tổng tiền, trạng thái đơn hàng trên Shopee là `COMPLETED`).
3. `duplicate`: Trùng mã đơn hàng (Mã đơn hàng Shopee này đã được đối chiếu thành công hoặc được duyệt ở một yêu cầu tích điểm khác).
4. `not_found`: Không tìm thấy đơn hàng trên hệ thống Shopee.
5. `mismatch`: Lệch tổng tiền (Tìm thấy đơn hàng trên Shopee nhưng số tiền thanh toán thực tế khác với số tiền khách hàng nhập, cho phép sai số tối đa 100 VND do làm tròn).
6. `invalid_order_status`: Đơn hàng chưa đủ điều kiện (Tìm thấy đơn hàng trên Shopee nhưng trạng thái đơn hàng chưa phải là `COMPLETED`).
7. `manual_review`: Cần kiểm tra thủ công (Không thể đối chiếu do lỗi API Shopee, lỗi kết nối hoặc token lỗi). Chi tiết lỗi sẽ được lưu lại trong trường `verification_note`.
