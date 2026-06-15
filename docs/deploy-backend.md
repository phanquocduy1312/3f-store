# Hướng Dẫn Deploy Backend PHP MVC Lên Plesk Bằng GitHub Actions

Tài liệu này hướng dẫn cách cấu hình và tự động triển khai (deploy) source code backend PHP MVC nằm trong thư mục `3f-api/` lên máy chủ Plesk thông qua GitHub Actions.

---

## 1. Cấu Hình Workflow
Workflow deploy backend được định nghĩa tại file:
[.github/workflows/deploy-backend.yml](file:///c:/Users/Admin/Downloads/ccc/.github/workflows/deploy-backend.yml)

### Cơ chế hoạt động:
- **Trigger**: Tự động chạy khi có code push lên nhánh `dev` hoặc `main` và có thay đổi trong thư mục `3f-api/` hoặc thay đổi chính file workflow này.
- **rsync**: Sử dụng câu lệnh `rsync` qua SSH để đồng bộ nội dung *bên trong* folder `3f-api/` trực tiếp vào thư mục đích trên Plesk (ví dụ: `httpdocs/`).
- **Exclude**: Đồng bộ có kèm tham số `--delete` để dọn dẹp file cũ nhưng loại trừ (exclude) các file và thư mục quan trọng sau để tránh ghi đè hoặc xóa mất trên production:
  - `.env` (File môi trường production)
  - `storage/uploads` (Thư mục chứa ảnh đơn hàng khách tải lên)
  - `storage/logs` (Thư mục ghi log hệ thống)
  - Thư mục `.git`, `.github`, `node_modules`, `vendor`.

---

## 2. Các GitHub Secrets Cần Cấu Hình

Để workflow có quyền truy cập và deploy lên Plesk, bạn cần thiết lập các secrets sau trong GitHub Repository (**Settings > Secrets and variables > Actions**):

| Secret Name | Mô Tả | Ví Dụ |
| :--- | :--- | :--- |
| `PLESK_HOST` | Địa chỉ IP hoặc domain SSH của server Plesk | `trial1506895.mbws.vn` |
| `PLESK_USER` | Tên người dùng SSH trên Plesk | `my_ssh_user` |
| `PLESK_PORT` | Cổng kết nối SSH (thường là 22 hoặc cổng tùy chỉnh) | `22` |
| `PLESK_SSH_KEY`| Khóa SSH Private Key (tương ứng với Public Key đã thêm trong mục SSH Keys của Plesk) | `-----BEGIN OPENSSH PRIVATE KEY-----\nMIIE...` |
| `PLESK_PATH` | Đường dẫn tuyệt đối tới thư mục deploy chính của Plesk | `/var/www/vhosts/trial1506895.mbws.vn/httpdocs` |

> [!IMPORTANT]
> - **PLESK_PATH** nên trỏ thẳng tới thư mục `httpdocs`.
> - **Document Root** trong cấu hình Hosting của Plesk phải được chỉnh trỏ vào thư mục con `public` (tức là `httpdocs/public`) để Web Server (Apache/Nginx) chạy đúng file entrypoint `public/index.php`.

---

## 3. Cấu Hình File Môi Trường (.env) Trên Server

Vì workflow tự động loại trừ (exclude) file `.env` để bảo vệ thông số bảo mật và tránh làm gián đoạn hệ thống khi deploy:

1. Bạn **phải tự tạo** file `.env` thủ công trên server Plesk (nằm trực tiếp tại thư mục deploy chính, ví dụ: `httpdocs/.env`).
2. Điền đầy đủ các cấu hình môi trường tương tự như sau:

```env
# Database Credentials
DB_HOST=localhost
DB_NAME=3f_database_name
DB_USER=3f_database_user
DB_PASS=your_strong_production_password
DB_CHARSET=utf8mb4

# Shopee Open Platform Sandbox Credentials
SHOPEE_ENV=sandbox
SHOPEE_PARTNER_ID=1235833
SHOPEE_PARTNER_KEY=your_sandbox_partner_key_from_shopee_console
SHOPEE_REDIRECT_URL=https://trial1506895.mbws.vn/api/shopee/callback
SHOPEE_BASE_URL=https://openplatform.sandbox.test-stable.shopee.sg
```

---

## 4. Quyền Hạn File & Thư Mục Sau Deploy
Sau khi copy code, workflow sẽ tự động SSH vào server Plesk để:
- Tạo mới các thư mục `storage/uploads` và `storage/logs` nếu chưa tồn tại.
- Thay đổi quyền hạn file (chmod) thành `644` (chỉ đọc/ghi cho owner).
- Thay đổi quyền hạn thư mục (chmod) thành `755` (đọc/thực thi cho mọi người).
