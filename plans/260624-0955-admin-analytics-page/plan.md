---
title: "Nâng cấp Hệ thống Phân tích & Báo cáo Admin Dashboard"
description: >
  Xây dựng trang Phân tích (Analytics) mới dành cho Admin với đầy đủ nghiệp vụ
  pet store, CRM và Loyalty, sử dụng dữ liệu thực tế và tích hợp thư viện
  Recharts để hiển thị biểu đồ trực quan, thiết kế premium đồng bộ.
status: completed
priority: high
effort: medium
branch: dev
tags: [admin, analytics, recharts, dashboard, crm, loyalty]
created: 2026-06-24
---

# Tổng quan Kế hoạch

## Mục tiêu
1. Phát triển trang **Báo cáo & Phân tích chuyên sâu** tại `/admin/analytics`.
2. Tích hợp đầy đủ chỉ số nghiệp vụ: Doanh số/AOV, phễu đơn hàng, phân bố hạng thành viên, loại pet, nhu cầu dinh dưỡng pet từ AI Advisor, hiệu năng Voucher và Banner.
3. Giao diện **Bento Grid Premium** với màu sắc trực quan, mượt mà, hỗ trợ loading skeletons và empty states.
4. Sử dụng **dữ liệu thật từ MySQL database** thông qua APIs backend mới.

## Các Giai đoạn Thực hiện (Phases)

| # | Giai đoạn | File Chi tiết | Trạng thái |
|---|---|---|---|
| 1 | Xây dựng API Backend và Service Frontend | [phase-01-apis.md](phase-01-apis.md) | `completed` |
| 2 | Phát triển Trang Analytics UI & Biểu đồ Recharts | [phase-02-ui.md](phase-02-ui.md) | `completed` |
| 3 | Tích hợp Sidebar Navigation & Kiểm thử Hệ thống | [phase-03-integration.md](phase-03-integration.md) | `completed` |

## Key Dependencies
- Backend APIs (Phase 1) cần hoàn tất trước khi tích hợp dữ liệu thật vào Frontend UI (Phase 2).
- Cần đảm bảo thư viện `recharts` hoạt động tốt trong React 19 (đã được install trong dự án).
