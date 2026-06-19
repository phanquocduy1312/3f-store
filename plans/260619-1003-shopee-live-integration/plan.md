---
title: Kế hoạch kết nối 3F Store với Shopee Shop (Production)
description: Hướng dẫn và kế hoạch các bước triển khai để kết nối hệ thống 3F Store với tài khoản Shopee Seller chính thức (Live Mode) thông qua Shopee Open Platform.
status: pending
priority: high
effort: medium
branch: main
tags: [shopee, integration, production, oauth]
created: 2026-06-19
---

# Kế hoạch triển khai kết nối Shopee
Hệ thống 3F Store hiện tại đã được code sẵn luồng tích hợp Shopee (bao gồm tạo Link Connect, Callback lưu Token, Scan OTP). Để 3F Store có thể tự động kiểm tra mã đơn Shopee (Order Code) thật từ khách hàng, Admin cần thực hiện cấu hình kết nối chính thức giữa 3F Store và cửa hàng Shopee.

## Các giai đoạn triển khai:

- **[ ] Phase 01: Tạo App và lấy thông tin cấu hình từ Shopee Open Platform**
  - [phase-01-shopee-app-config.md](./phase-01-shopee-app-config.md)
- **[ ] Phase 02: Cấu hình biến môi trường (Live) cho 3F Store**
  - [phase-02-env-setup.md](./phase-02-env-setup.md)
- **[ ] Phase 03: Thực hiện ủy quyền (OAuth) tài khoản Shopee Seller**
  - [phase-03-oauth-connect.md](./phase-03-oauth-connect.md)
- **[ ] Phase 04: Xác nhận và Test luồng tự động duyệt**
  - [phase-04-testing.md](./phase-04-testing.md)
