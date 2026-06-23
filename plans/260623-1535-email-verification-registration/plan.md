---
title: Email Verification Registration Flow
description: Implementation plan for registering accounts with email verification link before creation.
status: completed
priority: high
effort: medium
branch: dev
tags: [auth, verification, email, registration]
created: 2026-06-23
---

# Kế hoạch triển khai Đăng ký tài khoản xác thực qua Email

Kế hoạch này chi tiết hóa việc thay đổi luồng đăng ký tài khoản Sen/Khách hàng bằng Email: thay vì tạo tài khoản ngay lập tức khi gửi form, hệ thống sẽ lưu thông tin tạm thời và gửi email chứa mã xác thực (link). Chỉ khi Sen nhấn vào link xác thực thì tài khoản mới chính thức được tạo.

## Các giai đoạn triển khai

1. **Giai đoạn 1: Database và API Backend** ([phase-01-database-and-backend.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1535-email-verification-registration/phase-01-database-and-backend.md))
   - Tạo bảng lưu trữ đăng ký tạm thời `pending_registrations`.
   - Cập nhật API đăng ký và tạo API xác nhận link.
2. **Giai đoạn 2: Tích hợp Gửi Email và Frontend** ([phase-02-frontend-verification.md](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1535-email-verification-registration/phase-02-frontend-verification.md))
   - Xây dựng `EmailService` hỗ trợ gửi mail qua SMTP.
   - Tạo trang `/verify-registration` trên React để xử lý link người dùng click.

## Phụ thuộc chính
- Cấu hình SMTP (Gmail App Password hoặc Mail service) trên file `.env` của backend.
